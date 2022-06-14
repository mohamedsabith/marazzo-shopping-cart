const Mongoose = require("mongoose");

const brandSchema = new Mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    required: true,
  },
});

const brandModel = Mongoose.model("Brands", brandSchema);

module.exports = brandModel;
