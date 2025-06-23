const express = require('express');
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());

// Validation schema using Joi
const rideSchema = Joi.object({
    driver: Joi.string().required(),
    passenger: Joi.string().required(),
    pickup: Joi.string().required(),
    destination: Joi.string().required(),
    price: Joi.number().required()
});


app.post('/rides', async (req, res) => {
    try {
        // Validate request body
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