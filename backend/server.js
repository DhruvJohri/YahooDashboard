const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { runScraper } = require('./scraper.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valuations';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(MONGO_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('valuations');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Running' });
});

// Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await db.collection('yahoo_finance').find({}).toArray();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single company by symbol
app.get('/api/companies/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const company = await db.collection('yahoo_finance').findOne({ 
      Symbol: { $regex: new RegExp(symbol, 'i') }
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger scraper manually
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('Manual scrape triggered');
    
    // Run scraper in background
    runScraper().catch(error => {
      console.error('Scraper error:', error);
    });
    
    res.json({ 
      message: 'Scraper started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting scraper:', error);
    res.status(500).json({ error: 'Failed to start scraper' });
  }
});

// Get scraper stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalCompanies = await db.collection('yahoo_finance').countDocuments();
    
    // Get latest scraped timestamp
    const latestDoc = await db.collection('yahoo_finance')
      .findOne({}, { sort: { scraped_at: -1 } });
    
    // Get recent activity (last 5 scraped companies)
    const recentActivity = await db.collection('yahoo_finance')
      .find({})
      .sort({ scraped_at: -1 })
      .limit(5)
      .toArray();

    res.json({
      totalCompanies,
      lastScraped: latestDoc?.scraped_at || null,
      recentActivity: recentActivity.map(doc => ({
        symbol: doc.Symbol,
        company: doc.Company,
        scraped_at: doc.scraped_at
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);