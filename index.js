// week7.js
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const router = express.Router()

// ✅ MongoDB setup
const uri = "mongodb+srv://liyanaaa:adudusedap@cluster0.2odzpe8.mongodb.net/"
const dbName = "e-hailing"  // ⬅️ make sure this matches your DB in MongoDB Compass

// ✅ Existing analytics route
router.get('/analytics/passengers', async (req, res) => {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const users = client.db(dbName).collection('users')
    const pipeline = [
      { $lookup: { from: "rides", localField: "_id", foreignField: "userId", as: "rides" } },
      { $unwind: "$rides" },
      { $group: { _id: "$name", totalRides: { $sum: 1 }, totalFare: { $sum: "$rides.fare" }, avgDistance: { $avg: "$rides.distance" } } },
      { $project: { _id: 0, name: "$_id", totalRides: 1, totalFare: 1, avgDistance: 1 } }
    ]
    const result = await users.aggregate(pipeline).toArray()
    res.status(200).json(result)
    await client.close()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ NEW: GET all users
router.get('/users', async (req, res) => {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const users = client.db(dbName).collection('users')
    const list = await users.find({}).toArray()
    res.status(200).json(list)
    await client.close()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ NEW: GET all rides
router.get('/rides', async (req, res) => {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const rides = client.db(dbName).collection('rides')
    const list = await rides.find({}).toArray()
    res.status(200).json(list)
    await client.close()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ NEW: GET rides by userId
router.get('/rides/user/:userId', async (req, res) => {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const rides = client.db(dbName).collection('rides')
    const list = await rides.find({ userId: new ObjectId(req.params.userId) }).toArray()
    res.status(200).json(list)
    await client.close()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ NEW: POST new ride
router.post('/rides', async (req, res) => {
  const { userId, fare, distance } = req.body
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const rides = client.db(dbName).collection('rides')
    const result = await rides.insertOne({ userId: new ObjectId(userId), fare, distance })
    res.status(201).json(result)
    await client.close()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router