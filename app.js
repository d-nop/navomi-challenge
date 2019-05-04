//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/movieDB", {
  useNewUrlParser: true
});
const movieSchema = {
  Title: String,
  Year: String,
  imdbID: String,
  Type: String,
  Poster: String
};

const Movie = mongoose.model("Movie", movieSchema);

app.get("/", function (req, res) {
  Movie.find({}, function (err, foundMovie) {
    if (foundMovie.length === 0) {
      axios.get(`http://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=batman`)
        .then(function (response) {
          Movie.insertMany(response.data.Search, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully added data to DB!")
              res.redirect("/");
            }
          })
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    res.render("movies", {
      listTitle: "Batman Movies",
      newListItems: foundMovie
    });
  })

});

app.post("/", function (req, res) {
  let title = req.body.title;
  let year = req.body.year;
  let type = req.body.type;
  let image = req.body.image;

  const movie = new Movie({
    Title: title,
    Year: year,
    Type: type,
    Poster: image
  });

  movie.save();
  res.redirect("/");

});

app.post("/edit", function (req, res) {
  if (req.body.checkbox) {
    Movie.findByIdAndDelete(req.body.checkbox, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted!")
        res.redirect("/");
      }
    })
  } else {
    Movie.findById(req.body.checkbox2, function(err, movie) {
      console.log(movie);
      res.render("edit", {
        movie: movie
      });
    })
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});