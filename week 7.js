const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); 
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mytaxi', {
  // no need for useNewUrlParser or useUnifiedTopology anymore
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// ✅ Ride Insertion Endpoint
app.post('/rides', async (req, res) => {
  try {
    const { passengerId, fare, distance } = req.body;

    await db.collection('rides').insertOne({
      passengerId: new mongoose.Types.ObjectId(passengerId),
      fare: Number(fare),
      distance: Number(distance),
    });

    res.json({ message: 'Ride inserted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// ✅ Analytics Endpoint
app.get('/analytics/passengers', async (req, res) => {
  try {
    const result = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'rides',
          localField: '_id',
          foreignField: 'passengerId',
          as: 'rideInfo',
        },
      },
      {
        $unwind: '$rideInfo',
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          totalRides: { $sum: 1 },
          totalFare: { $sum: '$rideInfo.fare' },
          avgDistance: { $avg: '$rideInfo.distance' },
        },
      },
      {
        $project: {
          _id: 0,
          username: 1,
          totalRides: 1,
          totalFare: 1,
          avgDistance: { $round: ['$avgDistance', 2] },
        },
      },
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aggregation failed' });
  }
});

// Start server
app.listen(PORT, () => {
 console.log(`Server running at http://localhost:${PORT}`);
});