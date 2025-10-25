import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("nursery_management");

    const collection = req.query.collection;
    const action = req.query.action;

    // Parse body properly - handle both string and object
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    // AUTH LOGIN
    if (collection === "auth" && action === "login") {
      const user = await db.collection("users").findOne({
        username: body.username,
        password: body.password
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
      
      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          permissions: user.permissions || {},
        },
      });
    }

    // GET ALL
    if (action === "getAll") {
      const data = await db.collection(collection).find({}).toArray();
      const formatted = data.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }));
      return res.json({ success: true, data: formatted });
    }

    // GET SINGLE
    if (action === "get") {
      const data = await db.collection(collection).findOne({});
      return res.json({ success: true, data: data || {} });
    }

    // CREATE
    if (action === "create") {
      const result = await db.collection(collection).insertOne({
        ...body,
        id: new ObjectId().toString(),
        createdAt: new Date().toISOString()
      });
      return res.json({ success: true, id: result.insertedId.toString() });
    }

    // UPDATE
    if (action === "update") {
      const id = req.query.id;
      if (id) {
        await db.collection(collection).updateOne(
          { id: id },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        );
      } else {
        await db.collection(collection).replaceOne({}, body, { upsert: true });
      }
      return res.json({ success: true });
    }

    // DELETE
    if (action === "delete") {
      const id = req.query.id;
      await db.collection(collection).deleteOne({ id: id });
      return res.json({ success: true });
    }

    // INITIALIZE (create default admin user if not exists)
    if (action === "initialize") {
      const adminExists = await db.collection("users").findOne({ username: "admin" });
      if (!adminExists) {
        await db.collection("users").insertOne({
          id: new ObjectId().toString(),
          username: "admin",
          password: "1234",
          role: "Admin",
          status: "Active",
          permissions: {
            students: { view: true, add: true, edit: true, delete: true },
            transactions: { view: true, add: true, edit: true, delete: true },
            users: { view: true, add: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: true }
          },
          createdDate: new Date().toISOString().split('T')[0]
        });
      }
      
      const settingsExists = await db.collection("settings").findOne({});
      if (!settingsExists) {
        await db.collection("settings").insertOne({
          nurseryName: "My Nursery",
          currency: "$",
          country: "United States",
          timezone: "America/New_York",
          incomeSources: ["Student", "Bank", "Staff Advance", "Others"],
          incomeCategories: ["Tuition", "Registration", "Materials", "Events"],
          expenseCategories: ["Salaries", "Rent", "Utilities", "Supplies", "Maintenance"],
          incomePaymentMethods: ["Cash", "Bank Transfer", "Card"],
          expensePaymentMethods: ["Cash", "Bank Transfer", "Card", "Cheque"]
        });
      }
      
      return res.json({ success: true, message: "Initialized" });
    }

    return res.status(404).json({ success: false, message: "Invalid route" });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
