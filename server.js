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
        console.error("Error fetching data from MongoDB: ", err);
        res.status(500).send("Internal Server Error");
      }
});

//GET the lessons with their id
app.get('/lessons/:id', async (req,res) => {
    try {
    const lessonsId =  Number(req.params.id);

    const lessons = await lessonsCollection.findOne({ id:lessonsId });
    if (lessons) {
        res.send(lessons);
      } else {
        res.status(400).send("Lesson not found");
      } 
    } catch (err) {
        console.log("Error fetching lessons id from MongoDB: ", err);
        res.status(500).send("Internal Server Error");
    }
});

//Get the orders
app.get('/orders', async (req,res) => {
    try{
        const orders = await ordersCollection.find().toArray();
        res.json(orders);
    } catch (err) {
        console.log("Error fetching orders from MongoDB: ", err);
        res.status(500).send("Internal Server Error");
    }
});

//Get the orders with lessonId
app.get('/orders/:lessonId', async (req, res) => {
    try {
        const lessonId = req.params.lessonId; //stored lessonId as string

        const order = await ordersCollection.findOne({ lessonId: lessonId });
        if (order) {
            res.send(order);
        } else {
            res.status(400).send("Orders not found");
        }
    } catch (err) {
        console.log("Error fetchind orders id from MongoDB: ", err);
        res.status(500).send("Internal Server Error");
    }
});

//Post the new orders
app.post('/submit-order', async (req, res) => {
   try {
    //Extract order data from the request body
    const { name, phoneNumber, lessonId, numberOfSpaces } = req.body;

    //Insert the order into the "orders" collection
    const result = await ordersCollection.insertOne({
      name,
      phoneNumber,
      lessonId,
      numberOfSpaces
    });

    //Respond with the success message
    res.status(201).json({ message: "Order submitted sucessfully.", orderId: result.insertedId });
  } catch (err) {
    console.error("Error submitting order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT method for updating the number of availabe space
app.put('/lessons/:id', async (req,res) => {
  const lessonId = Number(req.params.id);
  const { availableInventory } = req.body;

  try{
    const result = await lessonsCollection.updateOne(
      { id: lessonId},
      { $inc: { availableInventory: -1}} //updates the inventory by -1 for each request
      //Setting the value for invetory
      // { $set: { availableInventory: 10}}
    );

    if (result.modifiedCount ==1) {
      res.json({ message: "Update Successfull"});
    } else {
      res.status(404).json({ error: "Lesson not found"});
    }
  } catch (err) {
    console.error("Error updating data in MongoDB Atlas: ", err);
    res.status(500).send("Internal Server Error");
  }
});

//Error message
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send("Something is broker.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});