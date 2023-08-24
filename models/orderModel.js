const Mongoose = require('mongoose');

const orderSchema = new Mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  product: [
    {
      ProductId: Mongoose.Types.ObjectId,
      name: String,
      price: Number,
      brand: String,
      image: String,
      description: String,
      quantity: Number,
      subtotal: Number,
      paid: {
        type: String,
        default: 'Not Paid',
      },
      status: {
        type: String,
        default: 'Order placed',
      },
      created: String,
      deliverDate: {
        type: String,
        default: null,
      },
      paymentType: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: true,
      },
      cancel: {
        type: Boolean,
        default: false,
      },
      cancelDate: {
        type: String,
        default: null,
      },
      user: String,
    },
  ],
  total: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
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
  deliverDate: {
    type: String,
    default: null,
  },
  count: {
    type: Number,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

const orderModel = Mongoose.model('Orders', orderSchema);

module.exports = orderModel;
