const express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      path           = require("path"),
      morgan         = require("morgan"),
      firebase       = require("firebase"),
      moment         = require('moment'),
      session        = require("express-session"),
      methodOverride = require("method-override"),
      jwt            = require("jsonwebtoken"),
      bcryptjs       = require("bcryptjs"),
      PORT           = process.env.PORT || 3000;

//* environment variables config
require("dotenv").config();

//* body parser config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//* authentication routes
//app.use('/auth', require('./routes/auth'));
app.use('/home', require('./routes/newroutes'));

//* firebase config

var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENT_ID,
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post("/signup", async function (req, res) {
    var newuser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    const salt = await bcryptjs.genSalt(10);
    newuser.password = await bcryptjs.hash(req.body.password, salt);
    let query = await db.collection("users").doc(newuser.name).get();
    //console.log(query.exists)
    if (!query.exists) {
      db.collection("users")
        .doc("/" + req.body.name + "/")
        .set({ user: newuser });
      //return res.status(200).send('')
      const payload = {
        user: {
          name: newuser.name,
        },
      };
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
          algorithm: "HS256",
        },
        (err, token) => {
          if (err) return res.send(err);
          return res.status(200).json({
            token,
          });
        }
      );
    } else {
      console.log("user exists");
      res.status(400).send("user exists already");
    }
  });

  /**
 *@method - POST
 *param - /login
 *@description - User Login
 */

app.post("/login", async function (req, res) {
    const { name, password } = req.body;
    //console.log(password)
    const query = db.collection("users").doc(req.body.name);
    let newuserall = await query.get();
    let newuser = newuserall.data();
    //console.log(newuser)
    //console.log(newuser.user.password)
  
    if (newuser === undefined) return res.status(400).send("User Not Exist");
  
    savepassword = newuser.user.password;
    const isMatch = await bcryptjs.compareSync(req.body.password, savepassword);
    console.log(isMatch);
    if (!isMatch) return res.status(400).send("Incorrect Password");
  
    const payload = {
      user: {
        name: newuser.name,
      },
    };
    jwt.sign(
      payload,
      "randomString",
      {
        expiresIn: 10000,
        algorithm: "HS256",
      },
      (err, token) => {
        if (err) return res.send(err);
        return res.status(200).json({
          token,
      });
    }
  );
});

//* @desc - creating posts
//* @route - POST /create
app.post('/create', async (req, res) => {
  const { topic, query, body, op } = req.body;
  const newpost = {
    author: op,
    topic: topic,
    query: query,
    body: body,
    createdAt: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
  }
  let strid = '@' + topic + '_' + query + '_' + op;
  strid = strid.split(' ').join('-');

  try {
    await db.collection(topic).doc('/' + strid + '/')
    .set(newpost);
    return res.status(200).send('');
  } catch(error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.put('/:post_id/edit', async (req, res) => {
  const { topic, query, body, op } = req.body;
  try {
    
    const postdocument = db.collection(topic).doc(req.params.post_id);
    console.log(postdocument);
    const onepost = await postdocument.get();
    console.log(onepost);
    const post = onepost.data();
    console.log(req.params.post_id);
    console.log(post);
    if(op === post.author) {
      await postdocument.update({
        query: query,
        body: body,
        createdAt: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
      });
      return res.status(200).send('');
    } else {
      return res.status(400).send('Not the author');
    }
  } catch(error) {
    console.log(error);
    return res.status(400).send(error);
  }
})
  

app.listen(PORT, (req, res) => {
  console.log(`server started ${PORT}`);
});
