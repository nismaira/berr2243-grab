const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://localhost:27017";  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("testDB");
    const collection = db.collection("users");

    const result = await collection.insertOne({ name: "YANO", age: 2001 });
    console.log("Document inserted:", result.insertedId);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();