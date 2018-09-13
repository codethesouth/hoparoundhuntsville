// Getting all dependencies
const express = require("express");

const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const bunyan = require("bunyan");
const geoUtils = require("./lib/geoutils");
const schedule = require("./lib/cronSchedules");

// Proper logging
const geoConst = require("./data/geoConst.json");

const log = bunyan.createLogger({ name: "transitTracks" });
log.info("Bunyan initialized.");

let pastStopSeq = 0;
let nextStopSeq = 1;
const possibleSkip = false;

// ALL the vehicles
const vehicles = [];

// Setup DB
const mongoUser = process.env.MONGO_USERNAME;
const mongoPass = process.env.MONGO_PASSWORD;
const connectionString = process.env.MONGO_CONN_STRING;
const mongoUrl =
  connectionString !== null
    ? connectionString
    : `mongodb://${mongoUser}:${mongoPass}@localhost:27017/hsvtransit`;
mongoose.connect(
  mongoUrl,
  {
    useMongoClient: true
  }
);

// Shuttle/trolly/auto DB setup
const transitSchema = new mongoose.Schema({
  id: Number,
  long: Number,
  lat: Number
});
const Transit = mongoose.model("Transit", transitSchema);

const allLocations = [];

// Event DB structure
const eventSchema = new mongoose.Schema({
  id: Number,
  time: String,
  date: String,
  name: String,
  desciption: String,
  xcorr: Number,
  ycoor: Number
});
const Event = mongoose.model("Event", eventSchema);

// Statistics DB structure
const statsSchema = new mongoose.Schema({
  id: Number,
  hits: Number
});
const Stats = mongoose.model("Stats", statsSchema);

const userConnSchema = new mongoose.Schema({
  id: String,
  cipaddr: String,
  connStart: { type: Date, default: Date.now },
  connEnd: Date
});
const UserConn = mongoose.model("UserConn", userConnSchema);

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  pass: String
});
const User = mongoose.model("User", userSchema);

app.set("port", process.env.PORT || 5000);

// Setting directory structure
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup socket.io
// app.http().io();

app.get("/", (req, res) => {
  res.render("pages/index");
  Stats.find({ id: 0 }, (err, stat) => {
    const statContents = stat;
    if (statContents[0]) {
      statContents[0].hits += 1;
      statContents[0].save();
    }
  });
});

app.get("/test", (req, res) => {
  io.emit("location update", [34.73172, -86.58979]);
  res.send("Success");
});

app.get("/stats", (req, res) => {
  Stats.find({ id: 0 }, (err, stat) => {
    if (stat[0]) {
      res.send(`Hits:${stat[0].hits}`);
    } else {
      res.send("Error getting stats.");
    }
  });
});

// Adds location
app.post("/api/v1/trolly/:id/location", (req, res) => {
  let returnStr = "location api called ";
  const transitId = req.params.id;
  let vehicleFound = false;
  for (let i = 0; i < vehicles.length; i++) {
    if (vehicles[i].id === transitId) {
      vehicleFound = true;
      if (geoUtils.contains([req.body.lat, req.body.lon], geoConst.dtBounds)) {
        vehicles[i].lat = req.body.lat;
        vehicles[i].long = req.body.lon;
        //  checkStops([vehicles[i]['lat'],vehicles[i]['long']]);
        returnStr = returnStr.concat("location updated");
      } else {
        returnStr = returnStr.concat("location update failed");
        console.log("Invalid location update");
      }
    }
  }
  if (vehicleFound === false) {
    vehicles.push({ id: transitId, lat: req.body.lat, long: req.body.lon });
    returnStr = "new bus location added";
    console.log(returnStr);
  }
  res.send(returnStr);
});

const latLng = [];
let locations;
const latLongs = {};

function checkStops(curPnt) {
  // for each in stop array
  const sb = null;
  let ns = nextStopSeq;
  const len = geoConst.dtStopArray.length - 1;
  let advance = false;
  const fin = false;

  for (let i = 0; i < len && !advance; ++i) {
    const test_b = geoUtils.setStopBounds(ns - 1);
    if (geoUtils.contains(curPnt, test_b)) {
      advance = nextStopSeq === i;

      if (advance) {
        pastStopSeq = i;
        nextStopSeq = i + 1;
        console.log(`advancing stop seq = ${nextStopSeq} : ${pastStopSeq}`);
        const data = { seq: nextStopSeq, route: "Downtown", id: 0 };
        io.emit("next stop", data);
        return;
      }
    } else {
      ns = ns < len ? ++ns : 1;
    }
  }
}

function locationRecieved(data) {
  let returnStr = "location socket called: ";

  const transitId = data.id;

  let vehicleFound = false;

  for (let i = 0; i < vehicles.length; i++) {
    if (vehicles[i].id == transitId) {
      vehicleFound = true;
      if (
        geoUtils.contains([data.lat, data.lon], geoConst.dtBounds) ||
        transitId === "999"
      ) {
        vehicles[i].lat = data.lat;
        vehicles[i].long = data.lon;
        returnStr = returnStr.concat("location updated");
      } else {
        returnStr = returnStr.concat("location update failed");
      }
    }
  }
  if (vehicleFound === false) {
    vehicles.push({ id: transitId, lat: data.lat, long: data.lon });
    returnStr = "new bus location added";
  }
  console.log(returnStr);
  return returnStr;
}

// Trolley Service Schedule - Will need schedule for each route
function isTrolleyInactive() {
  // would like to extend this to start at 4pm and end at 1am following morning... of course
  // that complicates the testing
  let trolleyInactive = true; // named the variable for readability
  const date = new Date();
  date.setHours(date.getHours()); // minus 6 from UTC time - CHANGE for DAYLIGHT/STANDARD TIME
  console.log(`hour: ${date.getHours()}, day: ${date.getDay()}`);

  if (date.getDay() === 5 && date.getHours() <= 24 && date.getHours() >= 16) {
    console.log(`first test: ${trolleyInactive}`);
    trolleyInactive = false;
  }

  if (
    trolleyInactive &&
    date.getDay() === 6 &&
    ((date.getHours() <= 24 && date.getHours() >= 16) || date.getHours() === 0)
  ) {
    console.log(`second test: ${trolleyInactive}`);
    trolleyInactive = false;
  }

  if (trolleyInactive && date.getDay() == 0 && date.getHours() == 0) {
    console.log(`third test: ${trolleyInactive}`);
    trolleyInactive = false;
  }
  return trolleyInactive;
}

// Everything socket.io related
io.sockets.on("connection", socket => {
  console.log(`id: ${socket.id} address: ${socket.handshake.address}`);
  // TODO will need an flag set if the connection is from beacon or client user ---

  io.emit("made connect", { nextSeq: nextStopSeq, greet: "hello there" }); // sent to client user

  //  BEACON listerns won't hear anything until sockets on the beacon is implementation-----
  socket.on("bus:connect", data => {
    console.log(`bus connected: ${data.id} : ${data.pw}`);
    console.log(
      `bus connected: ${socket.id} address: ${socket.handshake.address}`
    );
  });
  socket.on("bus:location", data => {
    //  bus:location
    console.log(`location update: ${data.id} : ${data.lat} - ${data.lon}`);
    locationRecieved(data);
    //  TODO update vehicles here...;
  });
  //  --------------------------------------------------------------------------------------------

  socket.on("get location", data => {
    // console.log('location update requested ');
    if (false) {
      console.log("Sending dormant signal");
      io.emit("trolley off", [0, 0]);
    } else {
      console.log("Sending coordinates");
      io.emit("location update", vehicles);
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
    UserConn.find({ id: socket.id }, (err, uc) => {
      returnStr = "updating connection";
      if (uc[0]) {
        returnStr = `Recording user connection diconnect: ${uc[0].cipaddr} - `;
        uc[0].connEnd = new Date();
        uc[0].save();
        returnStr = returnStr.concat("db updated");
      } else {
        returnStr = returnStr.concat("db update failed");
        console.log("Invalid credentials in connection update");
      }
    });
  });
});

/** ******************************************************
 *   Admin Functionality
 *   WARNING: Suspending development of section indefinitely
 *   ******************************************************* */

/*
app.get('/admin', function(req, res) {
  var updates = [];
  res.render('pages/admin', {messages: updates});
});

app.get('/admin/addevent', function(req, res) {
  res.render('pages/eventadd');
});
*/

// Opening server to requests
http.listen(app.get("port"), () => {
  const d = new Date();
  d.setHours(d.getHours());
  log.info(`Time: ${d.getTime()}, Day: ${d.getDay()}, Hour: ${d.getHours()}`);

  console.log("Application is running on port", app.get("port"));
});

log.info(`Trolley Home: ${geoConst.trolleyHome}`);
