var Mongoose = require('mongoose');
const moment = require('moment');

var DiscountCodesSchema = new Mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isPercent: {
    type: Number,
    required: true,
  },
  expireDate: {
    type: String,
    required: true,
    default: moment().format('DD/MM/YYYY') + ';' + moment().format('hh:mm:ss'),
  },
  limit: {
    type: Number,
  },
  usedUsers: {
    type: Array,
  },
  isActive: {
    type: Boolean,
    require: true,
    default: true,
  },
  Created_at: {
    type: String,
    required: true,
    default: moment().format('DD/MM/YYYY') + ';' + moment().format('hh:mm:ss'),
  },
});

const DiscountsModel = Mongoose.model('DiscountCodes', DiscountCodesSchema);

module.exports = DiscountsModel;
