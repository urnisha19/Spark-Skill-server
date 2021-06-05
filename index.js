const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const app = express();
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('courses'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzg3r.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const courseCollection = client.db("SparkSkill").collection("courses");
  const adminCollection = client.db("SparkSkill").collection("admins");
  const reviewCollection = client.db("SparkSkill").collection("review");
  const enrolledCollection = client.db("SparkSkill").collection("enrolled");

  // <----------Get Methods---------->
  //Server Connection Test
  app.get('/', (req, res) => {
    res.send('Hello!!!!! Server is working!');
  });
  console.log("DB connected");

  //total enrolled list 
  app.get('/admin/enrolledList', (req, res) => {
    enrolledCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //all added courses 
  app.get('/courses', (req, res) => {
    courseCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  //get all added Admin
  app.get('/showAllAdmin', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //get all review  
  app.get('/review', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //get total enrolled courses of a student 
  app.get('/enrolled', (req, res) => {
    enrolledCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // <----------Post Methods---------->
  //Admin Page AddCourse
  app.post('/admin/addCourse', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const duration = req.body.duration;
    const price= req.body.price;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimType,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    courseCollection.insertOne({ title, duration, price, description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //Admin Page Make Admin
  app.post('/admin/makeAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //student page addReview
  app.post('/student/addReview', (req, res) => {
    const name = req.body.name;
    const companyName = req.body.companyName;
    const description = req.body.description;
    reviewCollection.insertOne({ name, companyName, description })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //enroll course
  app.post('/student/enroll', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const price = req.body.price;
    enrolledCollection.insertOne({ name, email, title, price })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
});

app.listen(process.env.PORT || 5010)