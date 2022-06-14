const mongoose = require('mongoose');
var colors = require('colors');
require('dotenv').config()

const CONNECTION_URL = process.env.CONNECTION_URL;

// mongoose.connect(process.env.CONNECTION_URL, {
//     useNewUrlParser: true,
// })

// mongoose.connection.on("error", err => {
//   console.log("err".red, err)
// })

// mongoose.connection.on("connected", (err, res) => {
//     console.log('mongoose is connected');
// })

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((_) => {
   console.log("mongoose is connected");
  })
  .catch((error) => {
    console.log(error);
  });