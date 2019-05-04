//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
require("dotenv").config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/movieDB", {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);

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
      listTitle: "Movies List",
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
    Movie.findById(req.body.checkbox2, function (err, movie) {
      res.render("edit", {
        movie: movie,
        request: "update"
      });
    })
  }
});

app.post("/update", function (req, res) {
  console.log(req.body);
  let id = req.body.id;
  updatedMovie = {
    Title: req.body.title,
    Year: req.body.year,
    Poster: req.body.image
  }

  Movie.findByIdAndUpdate(id, updatedMovie, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("updated!");
      res.redirect("/");
    }
  });
})

app.listen(3000, function () {
  console.log("Server started on port 3000");
});