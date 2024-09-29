// 1. SETUP EXPRESS
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const dbname = "recipes"; // CHANGE THIS TO YOUR ACTUAL DATABASE NAME

// enable dotenv (allow Express application to read .env files)
require('dotenv').config();

// set the mongoUri to be MONGO_URI from the .env file
// make sure to read data from process.env AFTER `require('dotenv').config()`
const mongoUri = process.env.MONGO_URI;

// 1a. create the app
const app = express();
app.use(cors()); // enable cross origin resources sharing

// 1b. enable JSON processing (i.e allow clients to send JSON data to our server)
app.use(express.json());

// uri = connection string
async function connect(uri, dbname) {
    // Create a Mongo Client
    // a client is a software or driver that allows us to communicate with a database
    // (i.e like the Mongo Shell)
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });
    let db = client.db(dbname); // same as  'USE <database>' in Mongo Shell
    return db;
}

 // 2. CREATE ROUTES
 // All routes will be created in the `main` function
async function main() {

    // connect to the mongo database
    let db = await connect(mongoUri, dbname);

    app.get('/', function (req, res) {
        res.json({
            "message": "Hello World!"
        });
    });


    // There's a convention for RESTFul API when it comes to writing the URL
    // The URL should function like a file path  (always a resource, a noun)
    app.get("/recipes", async function(req,res){
        try {
            // mongo shell: db.recipes.find({})
            // let recipes = await db.collection("recipes").find().toArray();
            // res.json({
                // 'recipes': recipes
            // })

            // mongo shell: db.recipes.find({},{name:1, cuisine:1, tags:1, prepTime:1})
            let recipes = await db.collection("recipes").find()
                .project({
                    "name": 1,
                    "cuisine": 1,
                    "tags": 1,
                    "prepTime": `1`
                }).toArray();
            res.json({
                'recipes': recipes
            })
            
        } catch (error) {
            console.error("Error fetching recipes:", error);
            res.status(500);
        }
    })

    // /recipes/12345A => get the details of the recipe with _id 12345A
    app.get("/recipes/:id", async function(req,res){
        try {

            // get the id of the recipe that we want to get full details off
            let id = req.params.id;

            // mongo shell: db.recipes.find({
            //   _id:ObjectId(id)
            //  })
            let recipes = await db.collection('recipes').findOne({
                "_id": new ObjectId(id)
            });

            // check the recipe is not null
            // because .findOne will return null if no document
            // not found
            if (!recipes) {
                return res.status(404).json({
                    "error":"Sorry, recipie not found"
                })
            }

            // send back a response
            res.json({
                'recipes': recipes
            })

        } catch (error) {
            console.error("Error fetching recipe:", error);
            res.status(500);
        }
    })

// we use app.post for HTTP METHOD POST - usually to add new data
app.post("/recipes", async function(req,res){
    try {

        // name, cuisine, prepTime, cookTime, servings, ingredients, instructions and tags
        // when we use POST, PATCH or PUT to send data to the server, the data are in req.body
        let { name, cuisine, prepTime, cookTime, servings, ingredients, instructions, tags} = req.body;

        // basic validation: make sure that name, cuisine, ingredients, instructions and tags
        if (!name || !cuisine || !ingredients || !instructions || !tags) {
            return res.status(400).json({
                "error":"Missing fields required"
            })
        }

        // find the _id of the related cuisine and add it to the new recipe
        let cuisineDoc = await db.collection('cuisine').findOne({
            "name": cuisine
        })

        if (!cuisineDoc) {
            return res.status(400).json({"error":"Invalid cuisine"})
        }

        // find all the tags that the client want to attach to the recipe document
        const tagDocuments = await db.collection('tags').find({
            'name': {
                '$in': tags
            }
        }).toArray();

        let newRecipeDocument = {
            name,
            "cuisine": cuisineDoc,
            prepTime, cookTime, servings, ingredients, instructions,
            "tags": tagDocuments
        }

        // insert the new recipe document into the collection
        let result = await db.collection("recipes").insertOne(newRecipeDocument);
        res.status(201).json({
            'message':'New recipe has been created',
            'recipeId': result.insertedId // insertedId is the _id of the new document
        })


    } catch (e) {
        console.error(e);
        res.status(500);
    }
})


app.put("/recipes/:id", async function(req,res){
    try {

        let id = req.params.id;

        // name, cuisine, prepTime, cookTime, servings, ingredients, instructions and tags
        // when we use POST, PATCH or PUT to send data to the server, the data are in req.body
        let { name, cuisine, prepTime, cookTime, servings, ingredients, instructions, tags} = req.body;

        // basic validation: make sure that name, cuisine, ingredients, instructions and tags
        if (!name || !cuisine || !ingredients || !instructions || !tags) {
            return res.status(400).json({
                "error":"Missing fields required"
            })
        }

        // find the _id of the related cuisine and add it to the new recipe
        let cuisineDoc = await db.collection('cuisine').findOne({
            "name": cuisine
        })

        if (!cuisineDoc) {
            return res.status(400).json({"error":"Invalid cuisine"})
        }

        // find all the tags that the client want to attach to the recipe document
        const tagDocuments = await db.collection('tags').find({
            'name': {
                '$in': tags
            }
        }).toArray();

        let updatedRecipeDocument = {
            name,
            "cuisine": cuisineDoc,
            prepTime, cookTime, servings, ingredients, instructions,
            "tags": tagDocuments
        }

        // insert the new recipe document into the collection
        let result = await db.collection("recipes")
            .updateOne({
                "_id": new ObjectId(id)
            }, {
                "$set": updatedRecipeDocument
            });

            // if there is no matches, means no update took place
        if (result.matchedCount == 0) {
            return res.status(404).json({
                "error":"Recipe not found"
            })
        }

        res.status(200).json({
            "message":"Recipe updated"
        })


    } catch (e) {
        console.error(e);
        res.status(500);
    }
})

app.delete("/recipes/:id", async function(req,res){
    try {
        let id = req.params.id;

        // mongo shell:
        // db.recipes.deleteOne({
        //    _id:ObjectId)id
        //})
        let results = await db.collection('recipes').deleteOne({
            "_id": new ObjectId(id)
        });

        if (results.deletedCount == 0) {
            return res.status(404).json({
                "error":"Recipe not found"
            });
        }

        res.json({
            "message":"Recipe has been deleted successful"
        })

    } catch (e) {
        console.error(e);
        res.status(500);
    }
})

}
main();


// 3. START SERVER (Don't put any routes after this line)
app.listen(3000, function () {
    console.log("Server has started");
})
