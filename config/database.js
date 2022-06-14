const mongoose = require('mongoose');
var colors = require('colors');
require('dotenv').config()

mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
})

mongoose.connection.on("error", err => {
  console.log("err".red, err)
})

mongoose.connection.on("connected", (err, res) => {
    console.log('mongoose is connected');
})