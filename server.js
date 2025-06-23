const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let collection;

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

app.post('/rides', async (req, res) => {
    try {
        const result = await collection.insertOne(req.body);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/rides', async (req, res) => {
    try {
        const rides = await collection.find().toArray();
        res.send(rides);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/rides/:id', async (req, res) => {
    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/rides/:id', async (req, res) => {
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});