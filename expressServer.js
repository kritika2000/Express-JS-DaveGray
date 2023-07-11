//the config method takes a .env file path as an argument, it parses it and sets
//environment vars defined in that file in process.env.
/* after adding the DB variable inside .env, we need to install mongoose ->
  a library to work with mongo db.
*/
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { logger, logEvents } = require("./middleware/logEvents");
const errHandler = require("./middleware/errHandler");
const cors = require("cors");
const verifyJWT = require("./middleware/verifyJwt");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
/*
    CORS -> https://blog.logrocket.com/the-ultimate-guide-to-enabling-cross-origin-resource-sharing-cors/
    Default CORS setting  -> {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }
*/

const PORT = process.env.PORT || 4000;

//Custom middleware.
/*app.use((req, res, next) => {
  console.log(req.url, req.path, req.headers.origin);
  logEvent(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");
  next();
});
*/

// Connect to DB as the first thing.
connectDB();

// when a request is made to a route, all middlewares will execute above that route.

app.use(logger);

const whitelist = ["https://www.google.com", "http://localhost:3000"];
const corsOptions = {
  // this callback will run whenever a request is made to this server and it is checked if that origin is valid or not.
  origin: (origin, callback) => {
    /* if the origin is undefined that means it is localhost during development, 
    so need to check for that also, otherwise we'll get CORS error for localhost also. */
    if (whitelist.indexOf(origin) != -1 || !origin) {
      // first param -> any err
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
/* 
    app.use is use to apply midleware to all routes or specific routes(if path mentioned).
    express.urlencoded -> This is a built-in middleware function in Express. It parses incoming requests
                        with urlencoded payloads and is based on body-parser.
                        form-data, content-type: application/fox-www-form-urlencoded.
    express.json() -> only parses json data coming from the client.
    The middlewares put the parsed result inside req.body to be accessed by next middlewares/functions.
*/
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

//cookie-parser middleware to parse the cookie.
app.use(cookieParser());

//serve static files -> https://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, "assets")));
app.use("/subdir", express.static(path.join(__dirname, "assets")));

//Routers for Root
app.use("/", require("./routes/root"));

//Routes for SubDir
app.use("/subdir", require("./routes/subdir"));

//Register Routes
app.use("/register", require("./routes/register"));

//Login Routes
app.use("/login", require("./routes/auth"));
//Refresh Route
app.use("/refresh", require("./routes/refresh"));
//Logout Route
app.use("/logout", require("./routes/logout"));

// Using middleware for all the employees routes.
app.use(verifyJWT);
//API routes
app.use("/api/employees", require("./routes/api/employees"));

//Route Handlers -> This is what middlewares are.
/**
 * we can pass as many middleware functions in between and call next in the end of a middleware
 * so that the next function/middleware function can get executed.
 * Instead of separating the middlewares we can create an array of middle functions([m1, m2, m3]).
 * In the last one we can actually send the response to the browser.
 */
app.get(
  "/hello(.html)?",
  (req, res, next) => {
    console.log("Attempted to load hello.html");
    next();
  },
  (req, res, next) => {
    console.log("Loading...");
    next();
  },
  (req, res) => {
    console.log("Loaded hello.html");
    res.send("Hello Kritika");
  }
);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  }
  if (req.accepts("json")) {
    res.json({
      error: "404-Not Found",
    });
  }
});

// Sending server errors
app.use(errHandler);

// We do not want our server to listen to the requests unless we connect to the DB.
mongoose.connection.once("open", () => {
  console.log("Connected to Mongo DB");
  app.listen(PORT, () => {
    console.log(`Server listening to Port ${PORT}`);
  });
});
