import { MongoClient } from "mongodb";

let mongo;
let db;
let lightshots;

// Cache the total stats
let totalLightshots = 0;
let totalChecks = 0;

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

    // Get total stats from database
    let totals = await (await lightshots.aggregate([
        {
            '$group': {
                '_id': null,
                'totalLightshots': {
                    '$count': {}
                },
                'totalChecks': {
                    '$sum': '$checks'
                }
            }
        }
    ])).next();

    totalLightshots = totals.totalLightshots;
    totalChecks = totals.totalChecks;
}

export async function addLightshot(id, hash, checks) {
    // Increment the cached stats
    totalLightshots++;
    totalChecks += checks;

    await lightshots.insertOne({ _id: id, hash, checks });
}

export async function checkLightshotUnique(hash) {
    return (await lightshots.countDocuments({ hash })) === 0;
}

export function getTotalStats() {
    return { lightshots: totalLightshots, checks: totalChecks };
}

