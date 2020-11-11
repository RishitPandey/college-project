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

//* firebase config
const db = require('./firebase-config');

//* body parser config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//* authentication routes
//app.use('/auth', require('./routes/auth'));
app.use('/home', require('./routes/newroutes'));
app.use('/privacy', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, (req, res) => {
  console.log(`server started ${PORT}`);
});
