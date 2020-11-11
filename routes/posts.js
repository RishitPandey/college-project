const express = require("express"),
      router  = express.Router(),
      moment  = require('moment'),
      db      = require('../firebase-config');

router.get("/yours", async (req, res) => {
  try {
    let response = [];
    const citiesRef = db.collection("holidays");
    const snapshot = await citiesRef.get();
    snapshot.forEach((doc) => {
      let wholeblog = doc.data();
      let ablog = {
        query: wholeblog.query,
        body: wholeblog.body,
        author: wholeblog.author,
      };
      response.push(ablog);
      return res.status(200).send(response);
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

router.post("/create", async (req, res) => {
  const { topic, query, body, op } = req.body;
  const newpost = {
    author: op,
    topic: topic,
    query: query,
    body: body,
    createdAt: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
  };
  let strid = "@" + topic + "_" + query + "_" + op;
  strid = strid.split(" ").join("-");

  try {
    await db
      .collection(topic)
      .doc("/" + strid + "/")
      .set(newpost);
    return res.status(200).send("");
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

router.put("/:post_id/edit", async (req, res) => {
  const { topic, query, body, op } = req.body;
  try {
    const postdocument = db.collection(topic).doc(req.params.post_id);
    console.log(postdocument);
    const onepost = await postdocument.get();
    console.log(onepost);
    const post = onepost.data();
    console.log(req.params.post_id);
    console.log(post);
    if (op === post.author) {
      await postdocument.update({
        query: query,
        body: body,
        createdAt: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
      });
      return res.status(200).send("");
    } else {
      return res.status(400).send("Not the author");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

router.delete('/:topic/:post_id/delete', async (req, res) => {
    try {
        const postdocument = db.collection(topic).doc(req.params.post_id);
        await postdocument.delete();
        return res.status(200).send();
    } catch(error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/:topic/:post_id', async (req, res) => {
  try {
    const { topic, post_id } = req.params;
    const postdocument = db.collection(topic).doc(post_id);
    let post = await postdocument.get();
    let response = post.data();
    let commentresponse = [];

    const commentRef = db.collection(topic + '/' + post_id + '/comments');
    const commentsnapshot = await commentRef.get();
    commentsnapshot.forEach(doc => {
      let wholecomment = doc.data();
      let acomment = {
        author: wholecomment.author,
        comment: wholecomment.comment
      }
      commentresponse.push(acomment);
    })
    console.log(response);
    console.log(commentresponse);
    const allresponse = {
      response: response,
      comments: commentresponse
    };
    return res.status(200).send(allresponse);
  } catch(error) {
    console.log(error);
    return res.status(400).send(error);
  }
})

module.exports = router;