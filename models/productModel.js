const Mongoose = require('mongoose')

const productSchema=new Mongoose.Schema({
    productName:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    originalPrice:{
      type:Number,
      required:true
    },
    stock:{
      type:Number,
      required:true,
      min:0,
    },
    description:{
        type:String,
        required:true,
        min:20,
        max:500
    },
    SubCategory: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required:true
    },
    category:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    brand:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Brands',
        required:true
    },
    shippingCost:{
        type:Number,
        required:true,
    },
    discountPrice:{
        type:Number,
        required:true,
    },
    image:{
        type:Array,
        required:true
    },
    Created_at:{
        type: String,
        required:true
    },
    stockLess:{
        type:Boolean,
        default:false
    }
})

productSchema.index({productName:"text"}) 

const ProductModel = Mongoose.model("Products", productSchema);


module.exports=ProductModel;