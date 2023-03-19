import { MongoClient } from "mongodb";

let mongo;
let db;
let lightshots;

export async function initDB() {
    // Connect to the database
    mongo = new MongoClient(process.env.DB);
    await mongo.connect();

    db = mongo.db("lightshot-bot");
    lightshots = db.collection("lightshots");

    // Create an index to ensure the hash is unique
    await lightshots.createIndex({ hash: 1 }, { unique: true });

    // Send a ping to the database to check if it's online
    await db.command({ ping: 1 });
    console.log("Connected to database");
}

export async function addLightshot(id, hash, checks) {
    await lightshots.insertOne({ _id: id, hash, checks });
}

export async function checkLightshotUnique(hash) {
    return (await lightshots.countDocuments({ hash })) === 0;
}
