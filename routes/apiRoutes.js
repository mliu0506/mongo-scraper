var db = require("../models");
var mongoose = require("mongoose");
var mongojs = require('mongojs')

var request = require("request");
var cheerio = require("cheerio");

module.exports = function(app) {
app.get("/scrape", function(req, res) {
  mongoose.connection.db.dropCollection('articles', function(err, result) {});

  request("https://www.thoughtco.com/arts-music-recreation-4132958", function(error, response, html) {

  
  console.log("Scrape Complete");

    var $ = cheerio.load(html);

  
    $(".g-item").children('a').each(function(i, element) {
      var result = {};

      result.title = $(this)
        .find(".block-title")
        .text();

      result.link = $(this)
        .attr("href");

      result.image = $(this)
        .find("img")
        .attr('data-src');

      
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
          res.send();
        })
        .catch(function(err) {
          return res.json(err);
        });
     
    });

  });
});

app.get("/api/articles", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});
app.get("/api/saved", function(req, res) {
  db.Article.find({
    saved: true
  })
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});

app.get("/api/articles/:id", function(req, res) {
  db.Article.find({_id: mongojs.ObjectId(req.params.id)})
  .populate('articles')  
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});

// Route for saving/updating an Article's associated Note
app.put("/api/saved/:id", function(req, res) {
  
  db.Article.update({_id: mongojs.ObjectId(req.params.id)},{
    $set: {
      saved: true
    }
  }).then(function(dbArticle){
    res.json(dbArticle)
  }).catch(function(err){
    res.json(err);
  })
  
});
app.put("/api/unsaved/:id", function(req, res) {
  
  db.Article.update({_id: mongojs.ObjectId(req.params.id)},{
    $set: {
      saved: false
    }
  }).then(function(dbArticle){
    res.json(dbArticle)
  }).catch(function(err){
    res.json(err);
  })
  
});

app.post("/api/articles/:id", function(req, res) {
  
  db.Article.create(req.body)
    .then(function(dbArticle){
      return db.Article.findOneAndUpdate({},{
        $push: {
          articles: req.params.id
        }},
        {
          new: true
        });
    }).then(function(dbArticle){
      res.json(dbArticle)
    }).catch(function(err){
      res.json(err);
    })
});
};