// api/posts.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  const client = await connectToDatabase();
  const db = client.db(); // Uses default database from URI; you can also specify a db name here
  const collection = db.collection('posts');

  if (req.method === 'GET') {
    // Read all posts
    const posts = await collection.find({}).toArray();
    res.status(200).json({ posts });
  } else if (req.method === 'POST') {
    // Create a new post
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    const result = await collection.insertOne({ text });
    res.status(201).json({ post: { _id: result.insertedId, text } });
  } else if (req.method === 'PUT') {
    // Update an existing post
    const { id, text } = req.body;
    if (!id || !text) {
      res.status(400).json({ error: 'ID and text are required' });
      return;
    }
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { text } });
    res.status(200).json({ message: 'Post updated' });
  } else if (req.method === 'DELETE') {
    // Delete a post
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'ID is required' });
      return;
    }
    await collection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Post deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
