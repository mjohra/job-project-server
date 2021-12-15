const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("userDetails");
    const usersCollection = database.collection("users");
    const profileCollection = database.collection("profile");

    //add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });
    
    app.get('/profile',async(req,res)=>{
        const email=req.query.email;
        console.log(email);
        const query={"email":email};
        console.log(query);
        const cursor=profileCollection.find(query);
        const result=await cursor.toArray();
        res.json(result);
    });
    app.post("/profile", async (req, res) => {
        const profile = req.body;
        const result = await profileCollection.insertOne(profile);
        res.json(result);
      });
  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running product server");
});

app.listen(port, () => {
  console.log("running server on port", port);
});
