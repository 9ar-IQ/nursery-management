import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  await client.connect();
  const db = client.db("nurserydb");
  const collectionName = req.query.collection;
  const action = req.query.action;

  try {
    if (collectionName === "auth" && action === "login") {
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

    // General data retrieval for other sections
    if (action === "getAll") {
      const data = await db.collection(collectionName).find({}).toArray();
      res.json({ success: true, data });
      return;
    }

    if (action === "create") {
      const body = JSON.parse(req.body);
      await db.collection(collectionName).insertOne(body);
      res.json({ success: true });
      return;
    }

    if (action === "update") {
      const body = JSON.parse(req.body);
      const id = req.query.id;
      await db.collection(collectionName).updateOne({ _id: id }, { $set: body });
      res.json({ success: true });
      return;
    }

    if (action === "delete") {
      const id = req.query.id;
      await db.collection(collectionName).deleteOne({ _id: id });
      res.json({ success: true });
      return;
    }

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
}
