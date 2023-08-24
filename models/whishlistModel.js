const Mongoose = require('mongoose');

const WishlistSchema = new Mongoose.Schema({
  user: {
    type: String,
    default: null,
  },
  product: [
    {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      default: null,
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
});

const whishlistModel = Mongoose.model('Whishlist', WishlistSchema);

module.exports = whishlistModel;
