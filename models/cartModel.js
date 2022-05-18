const Mongoose = require('mongoose')

const cartSchema=new Mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      products: [
        {
          productId: Number,
          quantity: Number,
          name: String,
          price: Number
        }
      ],
      active: {
        type: Boolean,
        default: true
      },
      modifiedOn: {
        type: Date,
        default: Date.now
      }
})

const cartModel = Mongoose.model("Cart", cartSchema);


module.exports=cartModel;