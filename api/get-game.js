export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    
    const { gameId } = req.query;
    if (!gameId) {
      res.status(400).json({ error: "Game ID is required" });
      return;
    }
    
    const { MongoClient, ObjectId } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ error: "MONGODB_URI not defined" });
      return;
    }
    let client;
    try {
      client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db("game_db");
      const collection = db.collection("games");
      const game = await collection.findOne({ _id: new ObjectId(gameId) });
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      res.status(200).json({ game });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching game" });
    } finally {
      if (client) client.close();
    }
  }
  