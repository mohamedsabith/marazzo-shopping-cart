const Mongoose = require("mongoose");

const cartSchema = new Mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: Mongoose.Types.ObjectId,
      quantity: Number,
      name: String,
      price: Number,
      brand: String,
      image: String,
      description: String,
      shippingcost: Number,
      discountPrice: Number,
      total: {
        type: Number,
        default: 0,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  shippingcost: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  subTotalAddedd: {
    type: Number,
    default: 0,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  modifiedOn: {
    type: Date,
    default: Date.now,
  },
});

const cartModel = Mongoose.model("Carts", cartSchema);

module.exports = cartModel;
