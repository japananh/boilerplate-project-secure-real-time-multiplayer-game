require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// const expect = require("chai");
const socket = require("socket.io");
const helmet = require("helmet");
const http = require("http");
const nocache = require("nocache");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();
const server = http.createServer(app);
socket.listen(server);

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(nocache());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "http://localhost:3000",
          "https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap",
          "https://real-time-multiplayer-game.herokuapp.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "http://localhost:3000",
          "https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap",
          "https://real-time-multiplayer-game.herokuapp.com/",
        ],
      },
    },
    xssFilter: true,
    hidePoweredBy: false,
    nocache: true,
    frameguard: {
      action: "sameorigin",
    },
    referrerPolicy: {
      policy: "same-origin",
    },
  })
);

app.use(function (_req, res, next) {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  next();
});

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
