// importing express
var express = require("express");
// importing body-parser
const bodyParser = require("body-parser");
// importing local module for date
const date = require(__dirname + "/date.js");
// importing mongoose module
const mongoose = require("mongoose");
// importing lodash module
const _ = require("lodash");
// requiring dotenv module for environment variables
require("dotenv").config();

// creating a router
var router = express.Router();

// using the bodyParser in urlEncoder mode
router.use(bodyParser.urlencoded({ extended: true }));

// connecting to mongoDB server
mongoose.set("strictQuery", true);
mongoose.connect(
  `mongodb+srv://${process.env.mongoUsername}:${process.env.mongoPass}@cluster0.7xjfwjc.mongodb.net/todoListDB`
);

// creating schema for a new collection "items"
const itemsSchema = new mongoose.Schema({
  name: String,
});

//creating model for a new collection "items"
const Item = mongoose.model("Item", itemsSchema);

// creating items for the items collection
const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

// creating an array of default items.
const defaultItems = [item1, item2, item3];

// creating a new schema for new collection "lists".
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

// creating a new model for new collection "lists".
const List = mongoose.model("List", listSchema);

/* GET home page. */
router.get("/", (req, res) => {
  // getting today's date
  const day = date.getDate();

  // CREATEing the collection for list items and adding data to collection.
  const items = Item.find({}, (err, foundItems) => {
    // adding data to collection only if not already
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        errorCollector("Successfully inserted default items");
        res.redirect("/");
      });
    } else {
      // if data already exits not adding data to collection
      // rendering index.ejs
      res.render("index", {
        pageTitle: day,
        listItems: foundItems,
        listName: "@index",
      });
    }
  });
});

// post function for "/" route
router.post("/", (req, res) => {
  // getting data entered by the user
  const newItem = req.body.newItem;
  const listName = req.body.listName;

  // ADDing data to the items collection
  const item = new Item({
    name: newItem,
  });

  // adding data to the items collection only if route is "/"
  if (listName === "@index") {
    item.save();
    res.redirect("/");
  } else {
    // adding data to the lists collection if custom route is chosen.
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }
});

// POST function for "/delete" route.
router.post("/delete", (req, res) => {
  // creating an array to store all the items to be deleted.
  var checkedItemIds = [];
  if (typeof req.body.checkbox === "string") {
    checkedItemIds.push(req.body.checkbox);
  } else {
    var checkedItemIds = req.body.checkbox;
  }

  // getting the name of the route used
  const listName = req.body.list;

  // if "/" is usd deleting items from the route
  if (listName === "@index") {
    Item.deleteMany(
      {
        _id: {
          $in: checkedItemIds,
        },
      },
      (err, result) => {
        errorCollector(err, result);
        res.redirect("/");
      }
    );
  } else {
    // deleting items from the custom route
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: { $in: checkedItemIds } } } },
      (err, result) => {
        if (!err) {
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

// GET function for custom routes.
router.get("/:customListName", (req, res) => {
  // Capitalizing the custom route and storing it in a variable
  const customListName = _.capitalize(req.params.customListName);

  // finding the data for the custom route from the database
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      // if data is not found creating the data.
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        // if data is found then rendering the index page with this data.
        res.render("index", {
          pageTitle: `${date.getDay()}, ${customListName} List`,
          listItems: foundList.items,
          listName: customListName,
        });
      }
    }
  });
});

// get function for "/about" route
router.get("/about", (req, res) => {
  // rendering about.ejs
  res.render("about");
});

// exporting the router
module.exports = router;

function errorCollector(err, message) {

/** 
* A function to show if any error occurs while accessing the database
* @param {String} err - err parameter to pass error messages.
* @param {String} message - message parameter to pass the message for successful execution.
* @return {String} If Execution is not successful the returning error message, else pass the success message.
*/
  
  if (err) {
    console.log(err);
  } else {
    console.log(message);
  }
}
