const express = require("express");
const router = express.Router();
const path = require("path");

router.get("^/$|index(.html)", (req, res) => {
  //   res.set("Access-Control-Allow-Origin", "https://www.google.com");
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/new-page.html", (req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname, "..", "views", "new-page.html"));
});

router.get("/old-page(.html)?", (req, res) => {
  res.redirect(301, "/new-page.html");
});

module.exports = router;
