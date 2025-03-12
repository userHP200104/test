export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    
    if (req.method !== "PUT") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    
    const { gameId, game } = req.body;
    if (!gameId || !game) {
      res.status(400).json({ error: "Game ID and game state are required" });
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
      const result = await collection.updateOne({ _id: new ObjectId(gameId) }, { $set: game });
      if (result.modifiedCount === 0) {
        res.status(404).json({ error: "Game not found or not updated" });
        return;
      }
      res.status(200).json({ message: "Game updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating game" });
    } finally {
      if (client) client.close();
    }
  }
  