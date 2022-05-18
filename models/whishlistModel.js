const Mongoose = require('mongoose')


const WishlistSchema = new Mongoose.Schema({
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isLiked: {
      type: Boolean,
      default: false
    },
    updated: {
      type: Date,
      default: Date.now
    },
    created: {
      type: Date,
      default: Date.now
    }
  });

  
const whishlistModel = Mongoose.model("Whishlist", WishlistSchema);


module.exports=whishlistModel;