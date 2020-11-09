const express    = require('express'),
      router     = express.Router();

app.get('/home', (req, res) => {
    res.send('Working here');
})

module.exports = router;