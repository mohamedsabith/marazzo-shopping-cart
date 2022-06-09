const userModel = require('../models/userModel')
const ProductModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const SubCategoryModel =  require('../models/subCategoryModel')
const cartModel = require('../models/cartModel')
const DiscountsModel = require('../models/discountModel')
const whishlistModel = require('../models/whishlistModel')
const addressModel = require('../models/addressModel') 
const brandModel = require('../models/brandModel')
const orderModel = require('../models/orderModel')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geodist = require('geodist')
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const {userSignupvalidation,userLoginValidation,forgetpasswordValidation,resetpasswordValidation,updateProfileValidation} = require('../validations/userValidation')
const jwt =require('jsonwebtoken')
const nodemailer = require('nodemailer');
const {phone} = require('phone');
const email_verifier = require('email-verifier-node');
const fast2sms = require('fast-two-sms');
const pincodeDirectory = require('india-pincode-lookup');
const moment = require('moment');
const Razorpay = require('razorpay');
const crypto =require('crypto')
const { resolve } = require('path')
require('dotenv').config()

//razorpay instance
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret:process.env.RAZORPAY_SECRET,
});

//user registration
const userSignup = (data) =>{

     return new Promise(async(resolve,reject)=>{

     const Validations=await userSignupvalidation(data)
      
       if(Validations.error){
        return reject({status:false,errorSignup:Validations.error.details[0].message.replace(/"/g,'')});
       }
    
       const randomNumber =await Math.floor(100000 + Math.random() * 900000);

       const user = await userModel.findOne({email:data.email})

       const number = await userModel.findOne({phone_number:data.phone_number})

       const emailVerifier=await email_verifier.verify_email(data.email)
  
       console.log(emailVerifier);

       const numberVerify=await phone('+91'+data.phone_number)

       if(user){
            reject({status:false,errorSignup:'Another account is using this email'})
        }
        else if(number){
                reject({status:false,errorSignup:'Another account is using this phone number'})
        }else if(numberVerify.isValid==false){
              reject({status:false,errorSignup:'This number is not valid. Please enter valid number.'})  
        }else{
           
       
           //otp sending with nodemailer
            var transporter = await nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user:process.env.GOOGLE_APP_EMAIL,
                  pass:process.env.GOOGLE_APP_PASS
                }
              });
             

              var mailConfig = {
                from: 'mohamedsabithmp@gmail.com',
                to: data.email,
                subject: 'Verify your email address | Marazzo',
                html:`<p>Hi, ${data.username}</p>
                <p>Welcome to Marazzo!</p>
                <p>Enter the below code to verify your code</p>
                <p>Your Marazzo verification code is ${randomNumber}</p>`, 
              };

              transporter.sendMail(mailConfig,function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response.green);
                }
              });
              

            return resolve({ status: 'ok', msg: 'Otp sent successfuly',randomNumber,data})
      }

    })
}

//otp verification in signup
const otpverification = (data,user,randomNumber) =>{

    return new Promise(async(resolve,reject)=>{

    const otpcode= await data.otp1+data.otp2+data.otp3+data.otp4+data.otp5+data.otp6

    if(randomNumber==otpcode){
      
    //password hashing
     data.password =  await bcrypt.hash(user.password,12)
     
     
     var todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

    // saving to DB
    const newUser = new userModel({     
      username: user.username,
      email: user.email,
      phone_number:user.phone_number,
      password: data.password,
      Created_at:todayDateFormat
  })

  await newUser.save(async(err,res)=>{

    if(err){

    console.log(err)
    return reject({status:false,errorSignup:'Something went wrong try again'})

    }

    const token = await jwt.sign({id:res._id,name:res.username,email:res.email,phone_number:res.phone_number,status:'ok'},process.env.JWT_TOKEN,{expiresIn:'1d'});

    return resolve({ status: 'ok', msg: 'Account created successfuly',token })

})

   }else{

     reject({status:false,otpErr:"The OTP entered is invalid/incorrect. Please try again."})

   }

  })

}

//user login with phone number
const userLogin= (data) =>{

   return new Promise(async(resolve,reject)=>{

    const Validations=await userLoginValidation(data)

    if(Validations.error){
     return reject({status:false,errorLogin: Validations.error.details[0].message.replace(/"/g,'')});
    }
        
       const user= await userModel.findOne({email:data.email})
       if(user){
         if(user.blocked==false){
         if(user.phone_number==data.phone_number){
                await bcrypt.compare(data.password,user.password).then(async(status)=>{
            if(status){
               resolve({status:true,msge:'otp sending',user})
            }else{
              return reject({status:false,errorLogin:"Your password was incorrect. Please double-check your password."})
            }
       })
      }else{
        return reject({status:false,errorLogin:"This number doesn't match with email."})
      }
      }else{
        return reject({status:false,errorLogin:"This Account has been blocked by the Administrator"})
      }
       }else{
         return reject({status:false,errorLogin:"User not found. Please check your mail."})
       }
   })
}



//otp send
const otpSend = (result)=>{
  return new Promise(async(resolve,reject)=>{
      //creating random numbers
      const randomNumber =Math.floor(100000 + Math.random() * 900000);

      const otpset=await userModel.findByIdAndUpdate({_id:result.user._id},{$set:{otpcode:randomNumber}})

      const fast2smsapi=process.env.FAST2SMSAPI;
     
      var options = {
         authorization :fast2smsapi, 
         message : 'Your Marazzo verification code is ' + randomNumber, 
         numbers :[result.user.phone_number]
        } 

        fast2sms.sendMessage(options).then((result)=>{
              resolve({status:true,msge:"Otp send successfully.",randomNumber})
        }).catch((error)=>{
              reject({status:false,errorLogin:"Something went wrong try again."})
        })

  })
}

// otp verification in login
const otpVerify = (data,userid) =>{
  return new Promise(async(resolve,reject)=>{

    const otpcode= await data.otp1+data.otp2+data.otp3+data.otp4+data.otp5+data.otp6

    const user = await userModel.findById({_id:userid})

    if(user){
       if(user.otpcode==otpcode){
        const token = await jwt.sign({id:user._id,name:user.username,email:user.email,phone_number:user.phone_number,status:'ok'},process.env.JWT_TOKEN,{expiresIn:'1d'});
         resolve({status:true,msge:"Otp Matched.",token,user})
       }else{
         reject({status:false,errOtp:"The OTP entered is invalid/incorrect. Please try again."})
       }
    }else{
      reject({status:false,errOtp:"User not found"})
    }
})
}

//forgetpassword
const forgetPassword = (data) =>{
  return new Promise(async(resolve,reject)=>{
     
    const Validations=await forgetpasswordValidation(data)

    if(Validations.error){
     return reject({status:false,forgotErr:Validations.error.details[0].message.replace(/"/g,'')});
    }

     const user=await userModel.findOne({email:data.email})

     if(!user){
      reject({status:false,forgotErr:"The email you entered doesn't belong to an account. Please check your email and try again."})
     }else{
      const token = await jwt.sign({id:user._id,name:user.username,email:user.email,phone_number:user.phone_number,status:'ok'},process.env.RESET_PASSWORD_KEY,{expiresIn:'1m'});
     
      var transporter = await nodemailer.createTransport({
        service: 'gmail',
        secure:true,
        auth: {
          user:process.env.GOOGLE_APP_EMAIL,
          pass:process.env.GOOGLE_APP_PASS
        }
      });
      
      var mailOptions = {
        from: 'mohamedsabithmp@gmail.com',
        to: data.email,
        subject: 'Reset Account Password Link',
        html:`
        <h3>Please click the link below to reset you password</h3>
        <P>${process.env.CLIENT_URL}/resetpassword/${token}</P>
        `
      };

      await userModel.updateOne({resetLink:token})

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response.green);
        }

      });

     return resolve({status:true,msge:"We sent an email to "+ data.email + " with a link to get back into your account.",token})
     }

  })
}



//resetpassword
const resetpassword = (data,token) =>{
  return new Promise(async(resolve,reject)=>{
    if(token){
      jwt.verify(token,process.env.RESET_PASSWORD_KEY,async(error,decodedData)=>{
        if(error){
          return reject({status:false,errorReset:"invalid token"})
        }else{
          const Validations= await resetpasswordValidation(data)

          if(Validations.error){
           return reject({status:false,errorReset: Validations.error.details[0].message.replace(/"/g,'')});
          }
  
          const hashedPassword = await bcrypt.hash(data.password,12)
          await userModel.findOneAndUpdate({resetLink:token},{$set:{password:hashedPassword}})
          return resolve({status:true,msge:"Successfully updated"})
        }
      })
    }else{
      return reject({status:false,errorReset:"Access denied"})
    }
  })
}

//get user 
const userDetails = (data) =>{
  return new Promise(async(resolve,reject)=>{
     const user =await userModel.findOne({username:data.name}).lean()
     if(user){
        if(user.blocked==false){
          resolve({status:true,user:"User found.",user})
          
        }else{
          reject({status:false,error:"User is not verified/blocked."})
        }
     }else{
       reject({status:false,error:"User not found."})
     }
  })
}

const listAllCategory = () => {
  return new Promise(async(resolve,reject)=>{
       let category = await categoryModel.find({}).lean().limit(6)
       resolve(category)
  })
}

const listAllSubcategory = () =>{
  return new Promise(async(resolve,reject)=>{
    const subCategory = await SubCategoryModel.find({}).lean().populate('category').populate('brand')
      resolve(subCategory)
  })
}

const newProducts = () => {
  return new Promise(async(resolve,reject)=>{
      const product = await ProductModel.find({}).lean().sort({Created_at:-1}).limit(6)
      resolve(product)
  })
}

const productView = (id) =>{
  return new Promise(async(resolve,reject)=>{
    const product = await ProductModel.findById({_id:id}).lean().populate('brand')
    resolve(product)
  })
}

const userCart = (proId,userData,) =>{
   return new Promise(async(resolve,reject)=>{
     const product = await ProductModel.findById({_id:proId})
     const cart = await cartModel.findOne({userId:userData})

     if(cart){
         const proExist = cart.products.findIndex(product => product.productId==proId)

         if(proExist!=-1){
            return resolve({status:false,error:"Product already added to cart"})
         }else{
         await cartModel.findOneAndUpdate({userId:userData},{$push:{products:{productId:proId,quantity:1,name:product.productName,price:product.price,brand:product.brand,shippingcost:product.shippingCost,discountPrice:product.discountPrice,image:product.image[0].proImg1}}}).then(async(res)=>{
          return resolve({status:true,msge:"New product add in cart.",count:res.products.length+1})
        })
         }
      }else{
      const newCart = new cartModel({
          userId:userData,
          products:{productId:proId,quantity:1,name:product.productName,price:product.price,brand:product.brand,shippingcost:product.shippingCost,discountPrice:product.discountPrice,image:product.image[0].proImg1},
      })
      await newCart.save(async(err,res)=>{
        if(err){
          console.log(err);
          return reject({status:false,error:"Something went wrong try again."})
        }
       return resolve({status:true,msge:"Product add to cart.",count:1})
      })
    }
   }) 
}

const cartCount = (data) =>{
   return new Promise(async(resolve,reject)=>{
     const cart = await cartModel.findOne({userId:data})
     if(cart){
       let count = cart.products.length
       resolve(count);
     }else{
       let count = 0
       resolve(count)
     }
   })
}

const cartItems = (id) =>{
  return new Promise(async(resolve,reject)=>{
     const cart = await cartModel.findOne({userId:id}).lean()
     if(cart){
      resolve(cart)
     }else{
       let NotItems="CART EMPTY"
       resolve(NotItems)
     }
  })
}

const userDetailsUpdate = (user,number,image,data) =>{
  return new Promise(async(resolve,reject)=>{

     const Validations= await updateProfileValidation(data)

     if(Validations.error){
      return reject({status:false,errorUpdate: Validations.error.details[0].message.replace(/"/g,'')});
     }
   
    if(user!=data.email){
      const user = await userModel.findOne({email:data.email})
      if(user){
        return reject({status:false,errorUpdate:"Another account is using this email"})
      }
    }

    if(number!=data.phone_number){
      const user = await userModel.findOne({phone_number:data.phone_number})
      if(user){
        return reject({status:false,errorUpdate:"Another account is using this phone number"})
      }
    }
   

    await userModel.findOneAndUpdate({email:user},{$set:
    {
     username:data.username,
     phone_number:data.phone_number,
     email:data.email,
     gender:data.gender,
     country:data.country,
     state:data.state,
     zipcode:data.zipcode,
     district:data.district,
     city:data.city,
     image:image,
     address:data.address
    }
   })
    const users = await userModel.findOne({email:user})
   
    const token = await jwt.sign({id:users._id,name:users.username,email:users.email,phone_number:users.phone_number,status:'ok'},process.env.JWT_TOKEN,{expiresIn:'1d'});

    resolve({status:true,msge:"Successfully updated",token})
  })
}

const changeCartQuantity = (data) =>{
  data.count = parseInt(data.count)
   return new Promise(async(resolve,reject)=>{

    if(data.qty<=1 && data.count==-1){
      return resolve({quantity:0})
    }
        const cart = await cartModel.findById({_id:data.cart})

        const product = await ProductModel.findById({_id:data.product})

          if(cart){
            if(data.qty>=product.stock && data.count==1){
                resolve({error:"Out of stock"})
            }else{
              await cartModel.updateOne({'products.productId':data.product},{$inc:{'products.$.quantity':data.count}})
              return resolve({status:true,msge:"Quantity updated",count:data.count})
            }
          }
   })
}

const cartProductDelete = (cartId,proId) =>{
   return new Promise(async(resolve,reject)=>{
    await cartModel.findByIdAndUpdate({_id:cartId},{$pull:{products:{productId:proId}}})
    resolve({status:true,msge:"Product remove from cart."})
   })
}

const totalAmount = (user) =>{
  return new Promise(async(resolve,reject)=>{
    let amount = await cartModel.aggregate([
    {
        $match: { userId:user }
    },
    {
        $unwind: '$products'
    },
    {
        $project: {
            price: '$products.price',
            quantity: '$products.quantity'
        }
    },
    {
        $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
    }  
    ])

 
    const Total = amount.pop()
    if (Total!=undefined) {
      const cost=await cartModel.findOne({userId:user})
      const totalAmount = Total.total + cost.shippingcost - cost.discountPrice
      await cartModel.findOneAndUpdate({userId:user},{$set:{total:totalAmount}})
      resolve({totalAmount,Total})
    }
    resolve()
  })
}

const subTotal = (user) =>{
  return new Promise(async(resolve,reject)=>{
    let amount = await cartModel.aggregate([
      {
          $match: { userId:user }
      },
      {
          $unwind: '$products'
      },
      {
          $project: {
              id:'$products.productId',
              total: {$multiply: [ "$products.price", "$products.quantity" ] }
          } 
      },
      ])

      const cart = await cartModel.findOne({userId:user})

      if(cart){
       amount.forEach(async(amt)=>{
       await cartModel.updateMany({'products.productId':amt.id},{$set:{"products.$.total":amt.total}})
      })
      }
      resolve({status:true})
  })
}

const couponDetails = () =>{
  return new Promise(async(resolve,reject)=>{
    const coupon = await DiscountsModel.find({}).lean().limit(1)
    resolve(coupon)
  })
}

const checkCouponCode = (Coupon,data) =>{
   return new Promise(async(resolve,reject)=>{

      const coupon = await DiscountsModel.findOne({code:Coupon})

      if(!coupon){
        return reject({status:false,errorCoupon:"The entered coupon is wrong."})
      }

      const user = await DiscountsModel.find({code:Coupon,usedUsers:{$in:[data]}}).count()

      if(new Date().getTime() >= new Date(coupon.expireDate).getTime()){
         await DiscountsModel.deleteOne({code:Coupon})
         return reject({status:false,errorCoupon:"Coupon expired, please await the next coupon."})
      }
 
      if(coupon.limit==0){
        await DiscountsModel.deleteOne({code:Coupon})
        return reject({status:false,errorCoupon:"Coupon limit exceeds please expect next coupon."})
     }

     if(user==1){
      return reject({status:false,errorCoupon:"This coupon has already been used."})
     }

      await DiscountsModel.findOneAndUpdate({code:Coupon},{$inc:{limit:-1}})
      await DiscountsModel.findOneAndUpdate({code:Coupon},{$push:{usedUsers:data}})

      const cart = await cartModel.findOne({userId:data})

      const userCart = cart.products

      const a = userCart.map((e)=>e.price)

     const discount = cart.total * coupon.isPercent/100

     const netAmount = cart.total - discount 

     await cartModel.findOneAndUpdate({userId:data},{$set:{couponDiscount:discount}})

    return resolve({status:true,msge:"Coupon successfully updated.",netAmount,discount})

   })
}

const  saveWishlist = (proId,userId) =>{
  return new Promise(async(resolve,reject)=>{
     
    const wishlist = await whishlistModel.findOne({user:userId})

    if(wishlist){

       const product = await whishlistModel.findOne({user:userId,product:{$in:[proId]}})

       if(product){
        return  resolve({status:false,errWishlist:"Product already added wishlist."})
       }

       await whishlistModel.findOneAndUpdate({user:userId},{$push:{product:proId}})

       return resolve({status:true,msge:"New product added."})
    }else{

      const newWishlist = new whishlistModel({
         user:userId,
         product:proId
      })
      
     await newWishlist.save(async(err,res)=>{
        if(err){
        return resolve({status:false,errWishlist:"Something went wrong try again."})
        }
        return resolve({status:true,msge:"Wishlist created successfully."})
      })
    }

  })
}

const getWishlist = (userId) =>{
   return new Promise(async(resolve,reject)=>{
      const wishlist = await whishlistModel.findOne({user:userId}).lean().populate('product')
      resolve(wishlist)
   })
}

const wishlistProductDelete = (userId,proId) =>{
  return new Promise(async(resolve,reject)=>{
    const userWishlist = await whishlistModel.findOne({user:userId})
    if(userWishlist){
      await whishlistModel.findOneAndUpdate({user:userId},{$pull:{product:proId}})
     return resolve({status:true,msge:'Product remove from wishlist.'})
    }
  })
}

const shippingCost = (data) =>{
    return new Promise(async(resolve,reject)=>{
     const cart = await cartModel.findOne({userId:data})

     if(cart && cart.products.length!=0){
     const products=cart.products

      var total = 0;

      for (var i = 0; i < products.length; i++) {
            total += products[i].shippingcost
        }

      var discount = 0;

      for(var j=0; j<products.length; j++){
        discount += products[j].discountPrice
      }

      const shippingCost=Math.floor(total/products.length)
      const discountCost=Math.floor(discount)

      await cartModel.findOneAndUpdate({userId:data},{$set:{shippingcost:shippingCost}})
      await cartModel.findOneAndUpdate({userId:data},{$set:{discountPrice:discountCost}})
      resolve({status:true,msge:"Sucessfully Updated"})
     }else{
      await cartModel.findOneAndUpdate({userId:data},{$set:{shippingcost:0}})
      await cartModel.findOneAndUpdate({userId:data},{$set:{discountPrice:0}})
      resolve()  
     }
  })
}

const categoryProducts = (data) =>{
  return new Promise(async(resolve,reject)=>{
     const category = await categoryModel.findOne({name:data})
      const subCategory=await SubCategoryModel.find({category:category._id}).lean()
     const products= await ProductModel.find({category:category._id}).lean().populate('SubCategory').populate('brand')
    resolve({product:products,subCategory:subCategory})
  })
}

const addressCheck = (data) =>{
  return new Promise(async(resolve,reject)=>{
     const user = await userModel.findOne({email:data})
     const address = await addressModel.findOne({user:data})

     if(address){
      resolve({status:true})
     }

     if(user.country=="" && user.state=="" && user.address=="" && user.zipcode==null){
        resolve({status:false})
     }else{
       resolve({status:true})
     }

  })
}

const pincodeDetails = (data) =>{
   return new Promise((resolve,reject)=>{
    const details = pincodeDirectory.lookup(data)
     const pincode = details.pop()
     resolve(pincode)
   })
}

const billingAddress = (data,User) =>{
   return new Promise(async(resolve,reject)=>{

       const newAdddress = new addressModel({
           user:User,
           name:data.name,
           phone_number:data.phone_number,
           address:data.address,
           city:data.city,
           state:data.state,
           district:data.district,
           zipCode:data.zipcode
       })

      await newAdddress.save(async(err,res)=>{
         if(err){
           return reject({status:false,error:"Something went wrong try again."})
         }
         return resolve({status:true,msge:"Successfully added new addresss."})
       })
   })
}

const getAddress = (User) =>{
  return new Promise(async(resolve,reject)=>{
    const Useraddress = await userModel.findOne({email:User}).lean()
    const billingAddress = await addressModel.find({user:User}).lean()
    if(Useraddress.country!='' && Useraddress.state!='' && Useraddress.zipcode!=null && Useraddress.address!='' ){
       resolve({Useraddress:Useraddress,billingAddress:billingAddress})
    }

    resolve({billingAddress:billingAddress})

  })
}

const conformAddress = (id,User) =>{
  return new Promise(async(resolve,reject)=>{
    await addressModel.updateMany({user:User},{$set:{isDefault:false}})
    await addressModel.findByIdAndUpdate({_id:id},{$set:{isDefault:true}})
    resolve({status:true})
  })
}

const shippingAddress = (User,id) =>{
  return new Promise(async(resolve,reject)=>{
   const isDefault = await addressModel.find({user:User}).lean()
   isDefault.map((address)=>{
     if(address.isDefault==true){
       resolve(address)
     }
   })
  })
}

const AddNewAddress = (id) =>{
    return new Promise(async(resolve,reject)=>{
    const userAddress = await userModel.findById({_id:id})

    const address = await addressModel.findOne({id:id})
     
    if(address){
      await addressModel.findOneAndUpdate({id:id},{$set:{isDefault:true}})
      resolve({id:address._id})
    }else{
    const newAdddress = new addressModel({
      user:userAddress.email,
      id:userAddress._id,
      name:userAddress.username,
      phone_number:userAddress.phone_number,
      address:userAddress.address,
      city:userAddress.city,
      state:userAddress.state,
      district:userAddress.district,
      zipCode:userAddress.zipcode,
      isDefault:true
  })

  await newAdddress.save(async(err,res)=>{
    if(err){
      console.log(err);
      reject({status:false,error:"Something went wrong try again."})
    } 
     resolve({status:true,msge:"Successfully added new addresss.",id:res._id})
  })
    }
  })
}

const mensFashion = () =>{
  return new Promise(async(resolve,reject)=>{
    const fashion = await SubCategoryModel.findOne({subcategory:"men"})
    const product = await ProductModel.find({SubCategory:fashion._id}).limit(7).lean()
    resolve(product)
  })
}

const AppleBrandProducts = () =>{
  return new Promise(async(resolve,reject)=>{
    const brand = await brandModel.findOne({brand:"apple"})
    const product = await ProductModel.find({brand:brand._id}).limit(7).lean()
    resolve(product)
  })
}

const newOrder = (data,payment) =>{
 return new Promise(async(resolve,reject)=>{
    const cart = await cartModel.findOne({userId:data})

    var todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

    const proDetails=[]

    cart.products.forEach((pro)=>{
         proDetails.push({ProductId:pro.productId,name:pro.name,price:pro.price,brand:pro.brand,image:pro.image,quantity:pro.quantity,subtotal:pro.total,created:todayDateFormat,paymentType:payment})
    })

    const AfterCoupon=cart.total-cart.couponDiscount

    const newOrder = new orderModel({
      user:data,
      product:proDetails,
      total:cart.total,
      shippingcost:cart.shippingcost,
      discountPrice:cart.discountPrice,
      couponDiscount:cart.couponDiscount,
      netAmount:AfterCoupon,
      count:cart.products.length
   })

   await newOrder.save(async(err,res)=>{
      if(err){
        console.log(err);
        return reject({status:false,error:"Something went wrong try again."})
      }

      return resolve({status:true,msge:"order created successfully.",data:res})
   })

 })
}

const generateRazorpay = (data) =>{
  return new Promise((resolve,reject)=>{
   const amt=data.data.total-data.data.couponDiscount
    var options={
      amount: amt*100,
      currency: "INR",
      receipt:""+data.data._id,
    }

    instance.orders.create(options,(err,order)=>{
      if(err){
        console.log(err);
      }
      return resolve(order)
    })
  })
}


const verifyPayment = (details,data) =>{
  return new Promise(async(resolve,reject)=>{
    let hmac=crypto.createHmac('sha256',process.env.RAZORPAY_SECRET)
    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
    hmac=hmac.digest('hex')
    if(hmac==details['payment[razorpay_signature]']){
      await cartModel.findOneAndDelete({userId:data})
      resolve()
    }else{
      reject()
    }
  })
}

const updatePaymentStatus = (orderId) =>{
  return new Promise(async(resolve,reject)=>{
    await orderModel.updateMany({_id:orderId},{$set:{'product.$[].status':"Order placed"}})
    await orderModel.updateMany({_id:orderId},{$set:{'product.$[].paid':"Paided"}})
    await orderModel.updateMany({_id:orderId},{$set:{'product.$[].active':true}})
    resolve()
  })
}

const getDirection = (Order) =>{
  return new Promise(async(resolve,reject)=>{

    const isDefault = await addressModel.find({user:Order.data.user}).lean() 

    let Shippingaddress=[]

    isDefault.map((address)=>{
      if(address.isDefault==true){
         Shippingaddress.push(address)
      }
    })

    const geocoder = mbxGeocoding({ accessToken:process.env.MAPBOX_TOKEN});
    const geoData= await geocoder.forwardGeocode({
      query:Shippingaddress[0].district,
      limit:1
     }).send()

  const coordinate=geoData.body.features[0].geometry.coordinates

  coordinate.reverse()

  const ourlng="11.03"
  const ourlat="76.05"

  const lng=coordinate[0]
  const lat=coordinate[1]
  
  var dist = geodist({lat:ourlng, lon:ourlat}, {lat: lng, lon:lat},{exact: true, unit: 'km'})

    if(dist==0){
      var dt = new Date();
      var deliverDate=dt.setDate(dt.getDate() + 1);
      var todayDateFormat = moment(deliverDate).format("ddd MMM DD YYYY")
       await orderModel.updateMany({_id:Order.data._id},{$set:{'product.$[].deliverDate':todayDateFormat}})
       return resolve({status:true})
    }else if(dist>=50 && dist<=100){
      var dt = new Date();
      var deliverDate=dt.setDate(dt.getDate() + 2);
      var todayDateFormat = moment(deliverDate).format("ddd MMM DD YYYY")
      await orderModel.updateMany({_id:Order.data._id},{$set:{'product.$[].deliverDate':todayDateFormat}})
      return resolve({status:true})
    }else if(dist>=100){
      var dt = new Date();
      var deliverDate=dt.setDate(dt.getDate() + 4);
      var todayDateFormat = moment(deliverDate).format("ddd MMM DD YYYY")
      await orderModel.updateMany({_id:Order.data._id},{$set:{'product.$[].deliverDate':todayDateFormat}})
      return resolve({status:true})
    }else{
      var dt = new Date();
      var deliverDate=dt.setDate(dt.getDate() + 6);
      var todayDateFormat = moment(deliverDate).format("ddd MMM DD YYYY")
      await orderModel.findByIdAndUpdate({_id:Order.data._id},{$set:{deliverDate:todayDateFormat}})
      return resolve({status:true})
    }
   
  })
}

const  getOrder = (orderId) =>{
  return new Promise(async(resolve,reject)=>{
    const order = await orderModel.findById({_id:orderId}).lean()
    resolve(order)
  })
}

const userOrder = (User) =>{
  return new Promise(async(resolve,reject)=>{
   const order = await orderModel.find({user:User}).populate([{path:'product.ProductId'}]).lean()
   resolve(order)
  })
}

const orderCancel = (orderId) =>{
  return new Promise(async(resolve,reject)=>{
    var todayDateFormat = moment(new Date()).format("ddd MMM DD YYYY")
     await orderModel.updateOne({'product._id':orderId},{$set:{'product.$.status':"Canceled",'product.$.active':false,'product.$.deliverDate':null,'product.$.cancel':true,'product.$.cancelDate':todayDateFormat}})
     resolve()
  })
}

const orderTrack = (id) =>{
  console.log(id);
  return new Promise(async(resolve,reject)=>{
  const order= await orderModel.findOne({'product._id':id}).lean()
   order.product.forEach((result)=>{
     if(result._id==id){
       resolve(result)
     }
   })
  })
}

module.exports={userSignup,userLogin,otpSend,otpverification,forgetPassword,resetpassword,userDetails,otpVerify,listAllCategory,listAllSubcategory,newProducts,userCart,productView,cartCount,cartItems,userDetailsUpdate,changeCartQuantity,cartProductDelete,totalAmount,subTotal,couponDetails,checkCouponCode,saveWishlist,getWishlist,wishlistProductDelete,shippingCost,categoryProducts,addressCheck,pincodeDetails,billingAddress,getAddress,conformAddress,shippingAddress,AddNewAddress,mensFashion,AppleBrandProducts,newOrder,generateRazorpay,verifyPayment,updatePaymentStatus,getDirection,getOrder,userOrder,orderCancel,orderTrack}