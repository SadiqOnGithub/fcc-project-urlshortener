const express = require('express');
const { getUrl, postUrl } = require('../controller/api');
const router = express.Router();


router.get('/hello', (req, res) => res.json({ greeting: 'hello API' }));

router.get('/shorturl/:shortUrl', getUrl);

router.post('/shorturl', postUrl);


module.exports = router;