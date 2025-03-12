// This endpoint returns all players’ positions.
// It also cleans up any players that have not updated their position in the last 10 seconds.
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
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const collection = db.collection("players");
      // Remove players that haven't updated in over 10 seconds.
      const threshold = new Date(Date.now() - 10000);
      await collection.deleteMany({ updatedAt: { $lt: threshold } });
      const players = await collection.find({}).toArray();
      res.status(200).json(players);
    } catch (e) {
      res.status(500).json({ error: "Database error", details: e });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
