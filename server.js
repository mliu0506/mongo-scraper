var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");




var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// =============================config======================
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/medium-scraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var conn = mongoose.connection;

conn.on('error', function(err){
  console.log('Mongoose error');
})
conn.once('open', function(err){
  console.log('Mongoose connection successful');
})

// =============================configeration======================



// Routes
require("./routes/apiRoutes")(app);




// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

module.exports = app;