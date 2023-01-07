// importing express
var express = require('express');
// importing body-parser
const bodyParser = require("body-parser");
// importing local module for date
const date = require(__dirname + "/date.js");

// creating a router
var router = express.Router();

// using the bodyParser in urlEncoder mode
router.use(bodyParser.urlencoded({extended: true}));

// creating global variables to use in ejs
const listItems = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

/* GET home page. */
router.get("/", (req, res) => {
  // getting today's date
  const day = date.getDate();

  // rendering index.ejs
  res.render("index", { pageTitle: day, listItems: listItems });
});

// post function for "/" route
router.post("/", (req, res) => {
  // getting data entered by the user
  const newItem = req.body.newItem;

  // Checking if the new item is to be added to the work list or normal list
  if (req.body.btn === "Work Tasks") {
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    listItems.push(newItem);
    res.redirect("/");
  }
});

// get function for "/work" route
router.get("/work", (req, res) => {
  // rendering indexedDB.ejs
  res.render("index", {
    pageTitle: `${date.getDay()}'s Work List`,
    listItems: workItems,
  });
});

// get function for "/about" route
router.get("/about", (req, res) => {
  // rendering about.ejs
  res.render("about");
});

module.exports = router;
