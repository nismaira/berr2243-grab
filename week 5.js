const express = require('express');
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());

// JWT Middleware (authorization checker)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send({ error: 'Access denied. No token provided.' });

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.status(403).send({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
}

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let rideCollection;
let userCollection;

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("mytaxi");
        rideCollection = db.collection("rides");
        userCollection = db.collection("users");
    } catch (err) {
        console.error(err);
    }
}

connectDB();

// Joi validation for rides
const rideSchema = Joi.object({
    driver: Joi.string().required(),
    passenger: Joi.string().required(),
    pickup: Joi.string().required(),
    destination: Joi.string().required(),
    price: Joi.number().required()
});

// 🔐 Protected CRUD Routes (with token)
app.post('/rides', authenticateToken, async (req, res) => {
    try {
        const { error } = rideSchema.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const result = await rideCollection.insertOne(req.body);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/rides', authenticateToken, async (req, res) => {
    try {
        const rides = await rideCollection.find().toArray();
        res.send(rides);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/rides/:id', authenticateToken, async (req, res) => {
    try {
        const { error } = rideSchema.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const result = await rideCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/rides/:id', authenticateToken, async (req, res) => {
    try {
        const result = await rideCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 👤 Public route: User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send({ error: 'Username and password are required' });

        const existingUser = await userCollection.findOne({ username });
        if (existingUser) return res.status(400).send({ error: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await userCollection.insertOne({ username, password: hashedPassword });
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 👤 Public route: User Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userCollection.findOne({ username });
        if (!user) return res.status(400).send({ error: 'Invalid username' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send({ error: 'Invalid password' });

        const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
        res.send({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});