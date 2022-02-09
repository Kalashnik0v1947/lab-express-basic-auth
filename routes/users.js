var express = require("express");
const req = require("express/lib/request");
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const saltRounds = 10;

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post("/signup", function (req, res, next) {
  let errors = [];

  if (!req.body.username) {
    errors.push("You did not include a name!");
  }
  if (!req.body.password) {
    errors.push("You need a password");
  }

  if (errors.length > 0) {
    res.json(errors);
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPass = bcrypt.hashSync(req.body.password, salt);

  User.create({
    username: req.body.username,
    password: hashedPass,
  })
    .then((createdUser) => {
      console.log("User was created", createdUser);
      res.render("profile", {name:req.session.user.username})
    })
    .catch((err) => {
      console.log("Something went wrong", err.errors);
      res.json(err);
    });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", (req, res) => {
  //Make sure all fields have content

  let errors = [];

  if (!req.body.username) {
    errors.push("You did not include a name!");
  }
  if (!req.body.password) {
    errors.push("You need a password");
  }

  if (errors.length > 0) {
    res.json(errors);
  }

  //Verify username and password

  User.findOne({ username: req.body.username })
    .then((foundUser) => {
      //Case 1: user does not exist
      //Solution: send a message back to user
      if (!foundUser) {
        // res.json("Username or password incorrect")
        return res.json("Username not found");
      }

      //Case 2: Username is found
      //Solution: Check the password

      //Two values for compare
      //compare or compareSync will return a boolean
      const match = bcrypt.compareSync(req.body.password, foundUser.password);

      //Case 2.5: Passwords don't match
      //Solution: send message back to user
      if (!match) {
        // res.json("Username or password incorrect")
        return res.json("Incorrect password");
      }

      //Case 3: Username and password are correct
      //Solution: Create a session for the logged in user
      req.session.user = foundUser;

      console.log(req.session.user);
      res.render("profile", {name:req.session.user.username});
     
    })
    .catch((err) => {
      console.log("Something went wrong", err);
      res.json(err);
    });
});


router.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("This is the session", req.session);
  res.json("you have logged out");
});



module.exports = router;

// const match = bcrypt.compareSync("password", hashedPass);
