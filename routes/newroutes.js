const express    = require('express'),
      router     = express.Router();

router.get('/', (req, res) => {
    res.send('Working here');
})

module.exports = router;