const Mongoose = require('mongoose')

const productSchema=new Mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        max:5
    },
    stock:{
      type:Number,
      required:true,
      max:10
    },
    description:{
        type:String,
        required:true,
        min:10,
        max:200
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    shippingCost:{
        type:Number,
        required:true,
        max:4
    },
    discount:{
        type:Number,
        required:true,
        max:3
    }
})

const productModel = Mongoose.model("Products", productSchema);


module.exports=productModel;