//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "This is the secret key.",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/navomi-challengeDB", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const movieSchema = new mongoose.Schema({
  Title: String,
  Year: String,
  imdbID: String,
  Type: String,
  Poster: String
});

userSchema.plugin(passportLocalMongoose);

const Movie = new mongoose.model("Movie", movieSchema);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/movies", function (req, res) {
  if (req.isAuthenticated()) {
    Movie.find({}, function (err, foundMovie) {
      if (foundMovie.length === 0) {
        axios.get(`http://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=batman`)
          .then(function (response) {
            Movie.insertMany(response.data.Search, function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("Successfully added data to DB!")
                res.redirect("/movies");
              }
            })
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {

      res.render("movies", {
        listTitle: "Movies List",
        newListItems: foundMovie
      });
    }
    })
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/movies");
      });

    }
  });
});

app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/movies");
      });
    }
  });

});

app.post("/movies", function (req, res) {
  if (req.isAuthenticated()) {
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
  res.redirect("/movies");
} else {
  res.redirect("login");
}

});

app.post("/edit", function (req, res) {
  if (req.isAuthenticated()) {
  if (req.body.checkbox) {
    Movie.findByIdAndDelete(req.body.checkbox, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted!")
        res.redirect("/movies");
      }
    })
  } else {
    Movie.findById(req.body.checkbox2, function (err, movie) {
      res.render("edit", {
        movie: movie,
      });
    })
  }
}else {
  res.redirect("/login");
}
});

app.post("/update", function (req, res) {
  if (req.isAuthenticated()) {
  let id = req.body.id;
  updatedMovie = {
    Title: req.body.title,
    Year: req.body.year,
    Type: req.body.type,
    Poster: req.body.image
  }

  Movie.findByIdAndUpdate(id, updatedMovie, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("updated!");
      res.redirect("/movies");
    }
  });
} else {
  res.redirect("/login");
}
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});