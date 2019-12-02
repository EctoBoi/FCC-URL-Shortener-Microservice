"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var crypto = require("crypto");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

//database setup
process.env.MONGO_URI =
  "mongodb+srv://EctoBoi:gordy159@cluster0-yroxl.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

var Schema = mongoose.Schema;

var URLSchema = new Schema({
  originalURL: String,
  shortURL: String
});

var shortURL = mongoose.model("shortURL", URLSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", function(req, res) {
  var url = req.body.url;

  var hash = crypto.createHash("sha1");
  hash.update(url);
  var shortURLDigest = hash.digest("hex").substring(0, 8);

  var newShortURL = new shortURL({
    originalURL: url,
    shortURL: shortURLDigest
  });
  newShortURL.save(function(err, data) {
    if (err) return console.error(err);
  });

  res.json({ original_url: url, short_url: shortURLDigest });
});

app.get("/api/shorturl/:url", function(req, res) {
  shortURL.findOne({ shortURL: req.params.url }, function(err, data) {
    if (err) return console.error(err);
    res.redirect(data.originalURL);
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
