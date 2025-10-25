// api/index.js - Vercel Serverless Function
const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase(uri) {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('nursery_management');
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // Get MongoDB URI from environment
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return res.status(500).json({ 
        success: false, 
        message: 'MongoDB URI not configured. Please set MONGODB_URI environment variable.' 
      });
    }

    const { db } = await connectToDatabase(MONGODB_URI);
    
    // Parse query parameters
    const { collection, action, id } = req.query;

    // Parse request body for POST/PUT requests
    let body = {};
    if (req.method === 'POST' || req.method === 'PUT') {
      body = req.body || {};
    }

    // Authentication endpoint
    if (collection === 'auth' && action === 'login') {
      const { username, password } = body;
      const user = await db.collection('users').findOne({ 
        username, 
        password, 
        status: 'Active' 
      });
      
      if (user) {
        return res.status(200).json({ 
          success: true, 
          user: { 
            id: user._id, 
            username: user.username, 
            role: user.role,
            permissions: user.permissions || {}
          } 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
    }

    // Initialize default admin user
    if (collection === 'users' && action === 'initialize') {
      const userCount = await db.collection('users').countDocuments();
      if (userCount === 0) {
        await db.collection('users').insertOne({
          username: 'admin',
          password: 'admin123',
          role: 'Admin',
          status: 'Active',
          createdDate: new Date().toISOString().split('T')[0],
          permissions: {
            students: { view: true, add: true, edit: true, delete: true },
            transactions: { view: true, add: true, edit: true, delete: true },
            users: { view: true, add: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: true }
          }
        });
        return res.status(200).json({ 
          success: true, 
          message: 'Default admin created' 
        });
      }
      return res.status(200).json({ 
        success: true, 
        message: 'Users already exist' 
      });
    }

    // Get all documents
    if (req.method === 'GET' && action === 'getAll') {
      const documents = await db.collection(collection).find({}).toArray();
      return res.status(200).json({ success: true, data: documents });
    }

    // Get single document by ID
    if (req.method === 'GET' && action === 'getById' && id) {
      const document = await db.collection(collection).findOne({ 
        _id: new ObjectId(id) 
      });
      return res.status(200).json({ success: true, data: document });
    }

    // Create new document
    if (req.method === 'POST' && action === 'create') {
      const result = await db.collection(collection).insertOne(body);
      return res.status(201).json({ 
        success: true, 
        data: { _id: result.insertedId, ...body } 
      });
    }

    // Update document
    if (req.method === 'PUT' && action === 'update' && id) {
      const updates = { ...body };
      delete updates._id;
      
      const result = await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      
      return res.status(200).json({ success: true, data: result });
    }

    // Delete document
    if (req.method === 'DELETE' && action === 'delete' && id) {
      const result = await db.collection(collection).deleteOne({ 
        _id: new ObjectId(id) 
      });
      return res.status(200).json({ success: true, data: result });
    }

    // Get system settings
    if (collection === 'settings' && action === 'get') {
      let settings = await db.collection('settings').findOne({ type: 'system' });
      
      if (!settings) {
        const defaultSettings = {
          type: 'system',
          nurseryName: "My Nursery",
          currency: "$",
          country: "United States",
          timezone: "America/New_York",
          closingPeriodDate: null,
          incomeRefStart: 1000,
          expenseRefStart: 1000,
          currentIncomeRef: 1000,
          currentExpenseRef: 1000,
          incomeCategories: [
            "Student Subscription",
            "Meals Subscription",
            "Late Club",
            "Bus",
            "Activity Club"
          ],
          expenseCategories: [
            "Salaries",
            "Rent",
            "Utilities",
            "Supplies",
            "Maintenance",
            "Food",
            "Transportation",
            "Insurance",
            "Taxes",
            "Other"
          ],
          incomePaymentMethods: ["Cash", "POS"],
          expensePaymentMethods: ["Cash", "POS"],
          incomeSources: ["Student", "Bank", "Staff Advance", "Others"]
        };
        
        await db.collection('settings').insertOne(defaultSettings);
        settings = defaultSettings;
      }
      
      return res.status(200).json({ success: true, data: settings });
    }

    // Update system settings
    if (collection === 'settings' && action === 'update') {
      const result = await db.collection('settings').updateOne(
        { type: 'system' },
        { $set: body },
        { upsert: true }
      );
      return res.status(200).json({ success: true, data: result });
    }

    // If no route matched
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid request parameters' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
