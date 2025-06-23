const express = require('express');
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let collection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("mytaxi");
        collection = db.collection("rides");
    } catch (err) {
        console.error(err);
    }
}

connectDB();

// Validation schema using Joi
const rideSchema = Joi.object({
    driver: Joi.string().required(),
    passenger: Joi.string().required(),
    pickup: Joi.string().required(),
    destination: Joi.string().required(),
    price: Joi.number().required()
});

// Create (POST)
app.post('/rides', async (req, res) => {
    try {
        const { error } = rideSchema.validate(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }

        const result = await collection.insertOne(req.body);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read (GET)
app.get('/rides', async (req, res) => {
    try {
        const rides = await collection.find().toArray();
        res.send(rides);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update (PUT)
app.put('/rides/:id', async (req, res) => {
    try {
        const { error } = rideSchema.validate(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete (DELETE)
app.delete('/rides/:id', async (req, res) => {
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// START SERVER
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});