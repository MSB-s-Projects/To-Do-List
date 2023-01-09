// importing express
var express = require("express");
// importing body-parser
const bodyParser = require("body-parser");
// importing local module for date
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

// creating a router
var router = express.Router();

// using the bodyParser in urlEncoder mode
router.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

/* GET home page. */
router.get("/", (req, res) => {
  // getting today's date
  const day = date.getDate();

  const items = Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        errorCollector("Sucessfully inserted default items");
        res.redirect("/");
      });
    } else {
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

  const item = new Item({
    name: newItem,
  });

  if (listName === "@index") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }
});

router.post("/delete", (req, res) => {
  var checkedItemIds = [];
  if (typeof req.body.checkbox === "string") {
    checkedItemIds.push(req.body.checkbox);
  } else {
    var checkedItemIds = req.body.checkbox;
  }

  const listName = req.body.list;

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

router.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        res.render("index", {
          pageTitle: `${date.getDay()}, ${customListName} List`,
          listItems: foundList.items,
          listName: customListName,
        });
      }
    }
  });

  // const custom = List.find({name: customListName}, (err, foundItems) => {
  //   if (foundItems.length === 0){
  //     List.insertMany(defaultItems, (err, result) => {
  //       errorCollector(err, result);
  //       res.redirect(`/${customListName}`);
  //     });
  //   }else{
  //     res.render("index", {
  //       pageTitle: `${date.getDay()}, ${customListName} List`,
  //       listItems: custom,
  //       pageName: customListName,
  //     });
  //   }
  // });
});

// get function for "/about" route
router.get("/about", (req, res) => {
  // rendering about.ejs
  res.render("about");
});

module.exports = router;

function errorCollector(err, message) {
  if (err) {
    console.log(err);
  } else {
    console.log(message);
  }
}
