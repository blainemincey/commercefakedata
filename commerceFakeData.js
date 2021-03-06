const faker = require('faker')
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const assert = require('assert');
const boolean = require('boolean');

// set up .env
require('dotenv').config();

// Grab vars from .env file
// Database URL to MongoDB
const url = process.env.DB_HOST;

// Database and collection name
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

// Number of docs to insert
const numDocs = process.env.NUM_DOCS_TO_INSERT;

// Drop existing collection?
const dropCollection = boolean(process.env.DROP_COLLECTION);

// Insert Documents
const insertDocuments = function (db, callback) {

    // Drop collection if dropCollection is set to true
    if (dropCollection) {
        db.collection(collectionName).drop(function (err, dropOK) {
            assert.equal(err, null);
            if (dropOK) {
                console.log("Existing collection dropped.");
            }
        });
    }

    const collection = db.collection(collectionName);

    // loop through docs using faker to create fake data
    for (let i = 0; i < numDocs; i++) {

        // Insert some documents
        collection.insertOne({
            "sku": faker.random.uuid(),
            "color": faker.commerce.color(),
            "department": faker.commerce.department(),
            "productName": faker.commerce.productName(),
            "price": new mongodb.Double(faker.commerce.price()),
            "available": faker.random.number(),
            "dateLastSold": faker.date.past()

        }, function (err, result) {

            assert.equal(err, null);
            callback(result);
        });
    }

    collection.countDocuments({}, {}, function (err, result) {
        assert.equal(err, null);
        console.log("Total number of docs in collection: " + result)

    });

}

// Use connect method to connect to the server
MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server: " + url);
    console.log("Database: " + dbName);
    console.log("Collection: " + collectionName);
    console.log("Num docs to insert: " + numDocs);
    console.log("Should I drop existing collection? " + dropCollection.valueOf());

    const db = client.db(dbName);

    insertDocuments(db, function () {
        client.close();
    })
});

