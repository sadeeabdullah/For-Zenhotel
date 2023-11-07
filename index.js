const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin:['http://localhost:5173']
}));


// MONGODB URI
const uri = "mongodb+srv://zentalhotel:lqkrEM2WSye4gK3O@cluster0.ncskwvc.mongodb.net/?retryWrites=true&w=majority";

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



    // db collection for database 

    const roomsCollection = client.db("zenhotel").collection("rooms")
    const BookingsCollection = client.db("zenhotel").collection("bookings")




    // auth related api

    app.post('/jwt',)



    //use postman to post the rooms the data 

    app.get('/api/v1/rooms', async( req, res ) => {
        const result = await roomsCollection.find().toArray();
        res.send(result)
    })

    // post booking
    app.post('/api/v1/create-bookings', async(req, res) => {
      const bookings = req.body;
      const result = await BookingsCollection.insertOne(bookings)
      res.send(result)
    })
    // update booking while someone booked that service

    app.patch('/api/v1/booked', async(req,res) => {
      const {availiblity, id} = req.body;
      console.log(availiblity)
      const filter = {_id: new ObjectId(id)}
      const options = {
        upsert: true
      }
      const updatedDoc = {
        $set:{
          booking_status:availiblity,
        }
      }
      const result = await roomsCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
    })

    // get the createdBookings
    app.get('/api/v1/bookings', async( req, res ) => {
      const result = await BookingsCollection.find().toArray();
        res.send(result)
    })



    // booking cancelling


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res)  =>{
    res.send('zenhotel is running')
})

app.listen(port, () => {
    console.log(`zenhotel running on port ${port}`)
})