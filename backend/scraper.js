require('dotenv').config();
const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');

// Configuration
const config = {
  DB_NAME: "valuations",
  COLLECTION_NAME: "yahoo_finance",
  URLS: [
    "https://finance.yahoo.com/markets/private-companies/highest-valuation/",
    "https://finance.yahoo.com/markets/private-companies/52-week-gainers/",
    "https://finance.yahoo.com/markets/private-companies/recently-funded/",
    "https://finance.yahoo.com/markets/private-companies/most-funded/"
  ],
  TIMEOUT: 120000,
  DELAY_BETWEEN_PAGES: 5000,
  RETRY_ATTEMPTS: 3,
  CRON_SCHEDULE: '0 */6 * * *',
  TIMEZONE: 'America/New_York'
};

// Field mappings with consistent naming
const FIELD_MAPPINGS = {
  'highest-valuation': {
    'Symbol': 'Symbol',
    'Company': 'Company',
    'Price': 'Price',
    '52 Wk Change (%)': 'Change_52Wk',
    'Estimated Valuation': 'Valuation'
  },
  '52-week-gainers': {
    'Symbol': 'Symbol',
    'Company': 'Company',
    'Price': 'Price',
    '52 Wk Change (%)': 'Change_52Wk'
  },
  'recently-funded': {
    'Symbol': 'Symbol',
    'Company': 'Company',
    'Latest Funding Date': 'Last_Funding_Date',
    'Latest Amount Raised': 'Last_Funding_Amount',
    'Latest Round Share Class': 'Last_Round_Type'
  },
  'most-funded': {
    'Symbol': 'Symbol',
    'Company': 'Company',
    'Total Funding Raised': 'Total_Funding',
    'Estimated Valuation': 'Valuation',
    'Private Company Sector': 'Sector'
  }
};

// Helper function to clean and normalize values
function normalizeValue(value) {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/g, ' ').replace(/\$/g, '');
  }
  return value;
}

// Custom wait function for older Puppeteer versions
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePageWithRetry(page, url, attempt = 1) {
  const pageType = url.split('/').slice(-2, -1)[0];
  const mapping = FIELD_MAPPINGS[pageType];
  const pageName = pageType.replace(/-/g, ' ');

  console.log(`Scraping ${pageName} page (Attempt ${attempt})...`);

  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: config.TIMEOUT 
    });

    // Handle cookie consent if present
    try {
      const acceptBtn = await page.$('button[type="submit"]');
      if (acceptBtn) {
        await acceptBtn.click();
        await wait(1000);
      }
    } catch (cookieError) {
      console.log('No cookie consent button found');
    }

    await page.waitForSelector('table', { 
      timeout: config.TIMEOUT,
      visible: true 
    });

    const scrapedData = await page.evaluate((mapping) => {
      const tables = Array.from(document.querySelectorAll('table'));
      const results = [];
      
      tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th'))
          .map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');
        
        Array.from(rows).forEach(row => {
          const rowData = {};
          const cells = row.querySelectorAll('td');
          
          cells.forEach((cell, index) => {
            if (index < headers.length && mapping[headers[index]]) {
              rowData[mapping[headers[index]]] = cell.textContent.trim();
            }
          });
          
          if (Object.keys(rowData).length > 0) {
            results.push(rowData);
          }
        });
      });
      
      return results;
    }, mapping);

    console.log(`✓ Successfully scraped ${scrapedData.length} items from ${pageName}`);
    return scrapedData;

  } catch (error) {
    if (attempt < config.RETRY_ATTEMPTS) {
      console.log(`✗ Attempt ${attempt} failed for ${pageName}, retrying...`);
      await wait(3000);
      return await scrapePageWithRetry(page, url, attempt + 1);
    } else {
      console.error(`✗ Failed to scrape ${pageName} after ${config.RETRY_ATTEMPTS} attempts:`, error.message);
      return [];
    }
  }
}

async function saveToMongoDB(data) {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    const collection = client.db(config.DB_NAME).collection(config.COLLECTION_NAME);

    const existingRecords = await collection.find(
      { Symbol: { $in: data.map(item => item.Symbol) } }
    ).toArray();

    const updateOps = [];
    const insertOps = [];
    const now = new Date();
    let newRecords = 0;
    let updatedRecords = 0;

    data.forEach(newItem => {
      const existingItem = existingRecords.find(item => item.Symbol === newItem.Symbol);
      
      if (!existingItem) {
        insertOps.push({
          insertOne: {
            document: { ...newItem, scraped_at: now }
          }
        });
        newRecords++;
      } else {
        const updateDoc = { $set: { scraped_at: now } };
        let hasChanges = false;

        Object.keys(newItem).forEach(key => {
          const newValue = normalizeValue(newItem[key]);
          const existingValue = normalizeValue(existingItem[key]);
          
          if (newValue !== existingValue) {
            updateDoc.$set[key] = newItem[key];
            hasChanges = true;
          }
        });

        if (hasChanges) {
          updateOps.push({
            updateOne: {
              filter: { Symbol: newItem.Symbol },
              update: updateDoc
            }
          });
          updatedRecords++;
        }
      }
    });

    if (insertOps.length > 0) {
      await collection.bulkWrite(insertOps);
    }
    if (updateOps.length > 0) {
      await collection.bulkWrite(updateOps);
    }

    console.log([
      `\nDatabase Update Summary:`,
      `• Total unique companies processed: ${data.length}`,
      `• New companies added: ${newRecords}`,
      `• Updated records: ${updatedRecords}`,
      `• Unchanged records: ${data.length - newRecords - updatedRecords}`
    ].join('\n'));

    return {
      insertedCount: newRecords,
      modifiedCount: updatedRecords
    };
  } catch (error) {
    console.error('Database operation failed:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

async function runScraper() {
  console.log('\n🚀 Yahoo Finance Private Companies Scraper');
  console.log('==========================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  const page = await browser.newPage();

  try {
    let allData = [];
    
    for (const url of config.URLS) {
      const data = await scrapePageWithRetry(page, url);
      allData = allData.concat(data);
      await wait(config.DELAY_BETWEEN_PAGES);
    }

    const uniqueCompanies = [];
    const seenSymbols = new Set();
    
    for (let i = allData.length - 1; i >= 0; i--) {
      const item = allData[i];
      if (!seenSymbols.has(item.Symbol)) {
        seenSymbols.add(item.Symbol);
        uniqueCompanies.unshift(item);
      }
    }

    console.log(`\nFound ${allData.length} raw records across all tables`);
    console.log(`After deduplication: ${uniqueCompanies.length} unique companies`);

    if (uniqueCompanies.length > 0) {
      console.log('\nProcessing data...');
      await saveToMongoDB(uniqueCompanies);
    } else {
      console.log('\n⚠️ No data was scraped from any pages');
    }
    
  } catch (error) {
    console.error('\n💥 Scraper failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Scraping process completed\n');
  }
}

// Export for use in server.js
module.exports = { runScraper };

if (require.main === module) {
  runScraper();
  
  cron.schedule(config.CRON_SCHEDULE, () => {
    console.log('\n=== Scheduled run started ===');
    runScraper();
  }, {
    scheduled: true,
    timezone: config.TIMEZONE
  });
  
  console.log(`\nScraper scheduled to run every 6 hours (${config.TIMEZONE} timezone)`);
}