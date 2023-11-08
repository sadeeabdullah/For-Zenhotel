const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials:true,
}));
app.use(cookieParser());

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

   // middlewares
    // verify token and grant access 
    const verifyToken = (req, res, next) =>{
      const {token} = req.cookies;
      if(!token){
          return res.status(401).send({message:'unauthorized access'})
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded ) =>{
          if(err){
              return res.status(401).send('unauthorized access')
          }

          // attach decoded user so other can get it
          req.user =decoded;
          next();
      })
  }


    // auth related api

    app.post('/api/v1/access-token', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      .send({success:true})
    })



    // when user logout clear the cookie
    app.post('/api/v1/logout', async( req, res ) => {
      const user = req.body;
      res.clearCookie('token',{maxAge:0}).send({success:true})
    })


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
      const filter = {_id: new ObjectId(id)}
      console.log('hitted with',availiblity,id)
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

    // update when someone delete the booking
    
    app.patch('/api/v1/delete', async(req,res) => {

      const {availiblity, image} = req.body;
      console.log('hitted with',availiblity,image)
      const filter = {image1:image}
      
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
    app.get('/api/v1/bookings', verifyToken,async( req, res ) => {
      if(req.user.email !== req.query.email){
        return res.status(403).send({message:'forbidden access'})
      }
      let queries = {}
      if(req.query?.email){
        query ={email:req.query?.email}
      }
      const result = await BookingsCollection.find(queries).toArray();
        res.send(result)
    })


    // get specific data of rooms
    app.get('/api/v1/rooms/:id', async(req, res) =>{
      const id =  req.params.id
      const query = {_id:new ObjectId(id)}
      
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })



    // adding delete method to delete data from the  bookings collection

    app.delete('/api/v1/delete-booking/:id',async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await BookingsCollection.deleteOne(query)
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