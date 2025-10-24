/ api/index.js - Serverless API for Vercel
const { MongoClient, ObjectId } = require('mongodb');

let cachedDb = null;

async function connectToDatabase(uri) {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('nursery_management');
  cachedDb = db;
  return db;
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const db = await connectToDatabase(process.env.MONGODB_URI);
    const { collection, action } = req.query;

    // Authentication endpoint
    if (collection === 'auth' && action === 'login') {
      const { username, password } = req.body;
      const user = await db.collection('users').findOne({ username, password, status: 'Active' });
      
      if (user) {
        return res.status(200).json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    // Get all documents from a collection
    if (req.method === 'GET' && action === 'getAll') {
      const documents = await db.collection(collection).find({}).toArray();
      return res.status(200).json({ success: true, data: documents });
    }

    // Get single document by ID
    if (req.method === 'GET' && action === 'getById') {
      const { id } = req.query;
      const document = await db.collection(collection).findOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true, data: document });
    }

    // Create new document
    if (req.method === 'POST' && action === 'create') {
      const document = req.body;
      const result = await db.collection(collection).insertOne(document);
      return res.status(201).json({ success: true, data: { _id: result.insertedId, ...document } });
    }

    // Update document
    if (req.method === 'PUT' && action === 'update') {
      const { id } = req.query;
      const updates = req.body;
      delete updates._id; // Remove _id from updates
      
      const result = await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      
      return res.status(200).json({ success: true, data: result });
    }

    // Delete document
    if (req.method === 'DELETE' && action === 'delete') {
      const { id } = req.query;
      const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true, data: result });
    }

    // Get system settings
    if (collection === 'settings' && action === 'get') {
      const settings = await db.collection('settings').findOne({ type: 'system' });
      if (!settings) {
        // Create default settings if not exist
        const defaultSettings = {
          type: 'system',
          nurseryName: "My Nursery",
          currency: "$",
          closingPeriodDate: null,
          incomeRefStart: 1000,
          expenseRefStart: 1000,
          currentIncomeRef: 1000,
          currentExpenseRef: 1000,
          incomeCategories: ["Student Subscription", "Meals Subscription", "Late Club", "Bus", "Activity Club"],
          expenseCategories: ["Salaries", "Rent", "Utilities", "Supplies", "Maintenance", "Food", "Transportation", "Insurance", "Taxes", "Other"],
          incomePaymentMethods: ["Cash", "POS"],
          expensePaymentMethods: ["Cash", "POS"]
        };
        await db.collection('settings').insertOne(defaultSettings);
        return res.status(200).json({ success: true, data: defaultSettings });
      }
      return res.status(200).json({ success: true, data: settings });
    }

    // Update system settings
    if (collection === 'settings' && action === 'update') {
      const updates = req.body;
      const result = await db.collection('settings').updateOne(
        { type: 'system' },
        { $set: updates },
        { upsert: true }
      );
      return res.status(200).json({ success: true, data: result });
    }

    // Initialize default admin user if no users exist
    if (collection === 'users' && action === 'initialize') {
      const userCount = await db.collection('users').countDocuments();
      if (userCount === 0) {
        await db.collection('users').insertOne({
          username: 'admin',
          password: 'admin123',
          role: 'Admin',
          status: 'Active',
          createdDate: new Date().toISOString().split('T')[0]
        });
      }
      return res.status(200).json({ success: true, message: 'Initialized' });
    }

    return res.status(400).json({ success: false, message: 'Invalid request' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
