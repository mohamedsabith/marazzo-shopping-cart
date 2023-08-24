const Mongoose = require('mongoose');

// Address Schema
const AddressSchema = new Mongoose.Schema({
  user: {
    type: String,
  },
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  phone_number: {
    type: Number,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  zipCode: {
    type: Number,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const addressModel = Mongoose.model('Address', AddressSchema);

module.exports = addressModel;
