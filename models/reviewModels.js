const Mongoose = require('mongoose');

const reviewSchema = new Mongoose.Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  title: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  review: {
    type: String,
    trim: true,
  },
  isRecommended: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
    default: moment().format('DD/MM/YYYY') + ';' + moment().format('hh:mm:ss'),
  },
});

const reviewModel = Mongoose.model('Reviews', reviewSchema);

module.exports = reviewModel;
