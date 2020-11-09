const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('token');
    if(!token) {
        return res.status(400).send('Auth Error');
    }

    try {
        const decoded = jwt.verify(token, 'randomString');
        req.user = decoded.user;
        next();
    } catch(error) {
        console.log(error);
        return res.status(400).send('Invaild Token');
    }
}