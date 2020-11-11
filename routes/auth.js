const { query }  = require("express");
const express    = require("express"),
      router        = express.Router(),
      bodyParser = require("body-parser"),
      jwt        = require("jsonwebtoken"),
      bcryptjs   = require("bcryptjs"),
      firebase   = require('firebase'),
      db         = require('../firebase-config');

router.post("/signup", async function (req, res) {
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

router.post("/login", async function (req, res) {
  const { email, password } = req.body;
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

module.exports = router;