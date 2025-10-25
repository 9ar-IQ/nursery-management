import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("nursery_management");

    const collection = req.query.collection;
    const action = req.query.action;

    if (collection === "auth" && action === "login") {
      const body = JSON.parse(req.body);
      const user = await db.collection("users").findOne({
        username: body.username,
        password: body.password
      });

      if (!user) {
        res.status(400).json({ success: false, message: "Invalid credentials" });
      } else {
        res.json({
          success: true,
          user: {
            username: user.username,
            role: user.role,
            permissions: user.permissions,
          },
        });
      }
      return;
    }

    // Generic GET route
    if (action === "getAll") {
      const data = await db.collection(collection).find({}).toArray();
      res.json({ success: true, data });
      return;
    }

    // Generic CREATE route
    if (action === "create") {
      const body = JSON.parse(req.body);
      await db.collection(collection).insertOne(body);
      res.json({ success: true });
      return;
    }

    // Generic UPDATE route
    if (action === "update") {
      const body = JSON.parse(req.body);
      const id = req.query.id;
      await db.collection(collection).updateOne({ _id: id }, { $set: body });
      res.json({ success: true });
      return;
    }

    // Generic DELETE route
    if (action === "delete") {
      const id = req.query.id;
      await db.collection(collection).deleteOne({ _id: id });
      res.json({ success: true });
      return;
    }

    res.status(404).json({ success: false, message: "Invalid route" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
