const Mongoose = require('mongoose')

const userSchema=new Mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        lowercase:true,
        type:String,
        unique: true,
        required:true
    },
    phone_number:{
        type:Number,
        unique:true,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    otpcode:{
        type:Number,
        default:0
    },
    blocked:{
    type:Boolean,
    default:false
    },
    resetLink:{
        type:String,
       default:"notreset"
    },
    Created_at:{
        type: Date,
        default: Date.now
    },
})

const userModel = Mongoose.model("User", userSchema);


module.exports=userModel;