// This endpoint accepts a POST request to update (or create) a player's position.
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id, x, y } = req.body;
    if (!id || typeof x !== "number" || typeof y !== "number") {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const collection = db.collection("players");
      await collection.updateOne(
        { id },
        { $set: { x, y, updatedAt: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ message: "Updated" });
    } catch (e) {
      res.status(500).json({ error: "Database error", details: e });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
