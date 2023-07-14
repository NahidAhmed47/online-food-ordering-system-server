const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config()

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ze0g6j8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("online-food-order-system");
    const menuCollection = database.collection("menu");
    const ordersCollection = database.collection("orders");
    // get menu
    app.get('/menu', async (req, res) => {
      const limit = req.query.limit ? parseInt(req.query.limit) : 0;
      const result = await menuCollection.find().limit(limit).toArray();
      res.send(result);
    })
    // set order
    app.put('/order', async (req, res) => {
      const checkIfExists = await ordersCollection.findOne({
        $and: [
          { customerId: req.body.customerId },
          { foodId: req.body.foodId }
        ]
      });
      if (checkIfExists) {
        const updatedOrder = await ordersCollection.updateOne({
          $and: [
            { customerId: req.body.customerId },
            { foodId: req.body.foodId }
          ]
        }, { 
          $set: { 
            price: checkIfExists.price + req.body.price, quantity: 
            checkIfExists.quantity + req.body.quantity 
          } 
        });
        res.send(updatedOrder);
      }
      else {
        const result = await ordersCollection.insertOne(req.body);
        res.send(result);
      }
    })
    // get all orders
    app.get('/orders/:id', async (req, res) => {
      const result = await ordersCollection.find({ customerId: parseInt(req.params.id) }).toArray();
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server running on port ${port}`);
})