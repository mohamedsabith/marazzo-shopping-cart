const Mongoose = require('mongoose')

const orderSchema=new Mongoose.Schema({
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      total: {
        type: Number,
        default: 0
      },
      updated: Date,
      created: {
        type: Date,
        default: Date.now
      }
})

const orderModel = Mongoose.model("Orders", orderSchema);


module.exports=orderModel;