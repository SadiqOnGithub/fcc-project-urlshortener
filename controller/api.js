require('dotenv').config();
const mongoose = require('mongoose');
const isUrl = require("is-valid-http-url");

// custom models
const URL = require('../model/model');


// database config
const mySecret = process.env['MONGO_DB_URI'] || 'mongodb://127.0.0.1:27017/urlShortener';
mongoose.connect(mySecret);

mongoose.connection.on('error', (err) => {
	console.error(err);
});


const getUrl = async (req, res) => {

	// retrieving shortUrl
	const { shortUrl } = req.params;
	const parsedShortUrl = parseInt(shortUrl);

	// checking shortUrl format
	if (!(Number.isInteger(parsedShortUrl))) {
		return res.json({
			"error": "Wrong format"
		})
	}

	try {
		// search url in database
		const response = await URL.findOne({ short_url: parsedShortUrl }).exec()

		if (!response) {
			return res.json({
				"error": "No short URL found for the given input"
			})
		}
		else {
			const { original_url } = response;
			return res.redirect(original_url)
		}

	}
	catch (error) {
		console.error(error);
	}

	return res.json({
		"error": "oops! something went wrong"
	})
}

const postUrl = async (req, res) => {

	//get url from body
	// change the name from original_url to originalUrl
	const { url: original_url } = req.body

	const isItUrl = isUrl(original_url)

	if (!isItUrl) {
		return res.json({ error: 'invalid url' })
	}

	try {
		//check the existence of url in database
		const existence = await URL.exists({ original_url: original_url })

		if (!existence) {

			// retrieve last shortUrl from database
			const allDoc = await URL.
				find({}).
				select('short_url').
				sort('-short_url').
				limit(1);

			const lastShortUrl = allDoc[0]?.short_url || 0;

			// create a urlData with incremented shortUrl
			const urlData = {
				original_url,
				short_url: lastShortUrl + 1
			}

			// add/create urlData in database 
			const urlDocCreated = await URL.create(urlData);

			// sending response
			return res.json({
				original_url: urlDocCreated.original_url,
				short_url: urlDocCreated.short_url
			});

		}
		else {
			// if req.body.url already exist in database
			const { _id } = existence;
			const existingUrl = await URL.findById(_id);
			return res.json({
				original_url: existingUrl.original_url,
				short_url: existingUrl.short_url
			})
		}

	}
	catch (error) {
		console.error(error);
		//send the error response 
		return res.json({
			"error": "oops! caught an error",
			errorMsg: error.message
		})
	}

	//send the general response 
	return res.json({
		"error": "oops! something went wrong"
	})

};


module.exports = { getUrl, postUrl };