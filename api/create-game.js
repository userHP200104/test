export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
  
    const { MongoClient } = require('mongodb');
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
      // Create new game record with default state
      const newGame = { turn: "X", createdAt: new Date() };
      const result = await collection.insertOne(newGame);
      newGame._id = result.insertedId;
      res.status(200).json({ gameId: newGame._id.toString(), game: newGame });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating game" });
    } finally {
      if (client) client.close();
    }
  }
  