require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000; // Define the port

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('courses'));
app.use(fileUpload());

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const courseCollection = client.db("SparkSkill").collection("courses");
    const adminCollection = client.db("SparkSkill").collection("admins");
    const reviewCollection = client.db("SparkSkill").collection("review");
    const enrolledCollection = client.db("SparkSkill").collection("enrolled");

    // <----------CourseCollection---------->
    //Admin Page AddCourse
    app.post('/admin/addCourse', (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const duration = req.body.duration;
      const price = req.body.price;
      const description = req.body.description;
      const newImg = file.data;
      const encImg = newImg.toString('base64');
      var image = {
        contentType: file.mimetype, // Corrected typo here
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      courseCollection.insertOne({ title, duration, price, description, image })
        .then(result => {
          res.send(result.insertedCount > 0);
        })
    });

    //all added courses 
    app.get('/courses', (req, res) => {
      courseCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        });
    });
    // <----------EOF CourseCollection---------->

    // <----------AdminCollection---------->
    //Admin Page Make Admin
    app.post('/admin/makeAdmin', (req, res) => {
      const email = req.body.email;
      adminCollection.insertOne({ email })
        .then(result => {
          res.send(result.insertedCount > 0);
        });
    });

    //get all added Admin
    app.get('/showAllAdmin', (req, res) => {
      adminCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        });
    });

    // <----------EOF AdminCollection---------->

    // <----------EnrolledCollection---------->
    //enroll course
    app.post('/student/enroll', (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const title = req.body.title;
      const price = req.body.price;
      enrolledCollection.insertOne({ name, email, title, price })
        .then(result => {
          res.send(result.insertedCount > 0);
        });
    });

    //total enrolled list 
    app.get('/admin/enrolledList', (req, res) => {
      enrolledCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        });
    });

    //get total enrolled courses of a student 
    app.get('/enrolled', (req, res) => {
      enrolledCollection.find({ email: req.query.email })
        .toArray((err, documents) => {
          res.send(documents);
        });
    });
    // <----------EOF EnrolledCollection---------->

    // <----------ReviewCollection---------->
    //student page addReview
    app.post('/student/addReview', (req, res) => {
      const name = req.body.name;
      const companyName = req.body.companyName;
      const description = req.body.description;
      reviewCollection.insertOne({ name, companyName, description })
        .then(result => {
          res.send(result.insertedCount > 0);
        });
    });

    //get all review  
    app.get('/review', (req, res) => {
      reviewCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        });
    });
    // <----------EOF ReviewCollection---------->
  } finally {
    // Commented out to keep the client connection open for handling multiple requests
    // await client.close();
  }
}

run().catch(console.dir);

//Server Connection Test
app.get('/', (req, res) => {
  res.send('Hello!!!!! Server is working!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
