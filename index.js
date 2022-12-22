const express = require('express');
const cors = require('cors');

// custom models
const { errorHandler } = require('./middleware/errorHandler.js');


// Config
const port = process.env.PORT || 3000;
const app = express();


// middleware
app.use(cors());
app.use('/api/shorturl', express.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));


// routes
app.get('/', (req, res) => res.sendFile(process.cwd() + '/views/index.html'));
app.use('/api', require('./router/api'));


// err
app.use(errorHandler);


// server PORT listener
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
