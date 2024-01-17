import express from "express";
import bodyParser from "body-parser";
import products from "./lessons.js";
import cors from "cors";
import morgan from "morgan";
import {MongoClient} from "mongodb";

const app = express();
app.use(cors());
app.use(morgan('short'));
const PORT = 3000;

let lessonsCollection;
let ordersCollection;
app.use(bodyParser.json());

//----------------- MongoDB local connection -------------------//
const connectMongoDB = async () => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('post_school');
    console.log("Connected to the database sucessfully.")
    return {
      lessons: db.collection('lessons'),
      orders: db.collection('orders')
    };
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
};


// Async function to connect to MongoDB and set lessonsCollection
const setupMongoDB = async () => {
    const collections = await connectMongoDB();
    lessonsCollection = collections.lessons;
    ordersCollection = collections.orders;
  // Get the lessons collection
  //   try { 
  //     const result = await lessonsCollection.find().toArray();
  //     console.log(result)
  //   } catch (err) {
  //     console.error('Error fetching data from MongoDB:', err);
  //   }
  };
  
  // Run the setup when the server starts
  setupMongoDB();

  //GET the lessons
app.get('/lessons', async (req,res) => {
  try {
      const result = await lessonsCollection.find().toArray();
      res.json(result);
      } catch (err) {
        console.error("Error fetchind data from MongoDB: ", err);
        res.status(500).send("Internal Server Error");
      }
});

//GET the lessons with their id
app.get('/lessons/:id', (req,res) => {
    const lessonsId = Number(req.params.id);

    const lessons = products.filter((lessons) => lessons.id === lessonsId);
    res.send(lessons);

});

//Error message
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send("Something is broker.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});