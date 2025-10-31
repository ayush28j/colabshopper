/*
This is the main server file for the CoShopper application.
It is responsible for starting the server and connecting to the database.

The following libraries are used:
- the express framework to handle requests and responses.
- the mongoose library to connect to the database.
- the require-dir library to import and initalize mongoose models.
- the cors library to handle the CORS policy.
- the body-parser library to parse request bodies.
- the jsonwebtoken library to generate and verify tokens.
*/

// Import libraries
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const requireDir = require("require-dir");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


// Import other files
const models = requireDir("./models/");
const routes = require('./routes.js');
const auth = require('./auth.js');
const { initializeWebSocketServer } = require('./ws/ws-server.js');


// Initialize env variables
const port = process.env.PORT || 8000;
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
}

// Connect to MongoDB
mongoose.connect(mongoUri).then(function () {
  console.log("MONGOOSE CONNECTED!");
}, function (err) {
  console.error(err);
});

// Initialize express app
const app = express();

// Attach middlewares to the express app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    methods: ["GET", "POST", "DELETE", "PUT"]
}))

// Attach authentication middleware to the express app
app.use(auth);

// Attach homepage route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Attach routes to the express app
app.use('/api/v1', routes);

// Start the server
const server = app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else
        console.log(`Server listening at http://localhost:${port}`);
});

// Initialize WebSocket server
initializeWebSocketServer(server);

module.exports = app;