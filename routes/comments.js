const express = require('express'),
      router  = express.Router(),
      moment  = require('moment'),
      shortid = require('shortid'),
      db      = require('../firebase-config');


router.post('/:topic/:post_id', async (req, res) => {
    const { author, comment } = req.body;
    const commentid = shortid.generate();
    const topic = req.params.topic;
    const post_id = req.params.post_id;

    const newcomment = {
        author: author,
        comment: comment
    }
    try {
        await db.collection(topic + '/' + post_id + '/comments')
        .doc('/' + commentid + '/')
        .set(newcomment);
        return res.status(200).send();
    } catch(error) {
        console.log(error);
        return res.status(400).send(errors);
    }
});

module.exports = router;