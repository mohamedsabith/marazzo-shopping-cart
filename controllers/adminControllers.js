const bcrypt = require('bcrypt')
const jwt =require('jsonwebtoken')
const moment = require('moment');
const {adminLoginValidation,couponCodeValidation} = require('../validations/adminValidation')
const productAddValidation = require('../validations/productValidation')
const adminModel = require('../models/adminModel')
const userModel = require('../models/userModel')
const ProductModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const SubCategoryModel =  require('../models/subCategoryModel')
const brandModel = require('../models/brandModel')
const DiscountsModel = require('../models/discountModel');
const orderModel = require('../models/orderModel');
const { resolve } = require('path');
require('dotenv').config()

//admin login
const adminLogin = (data) =>{
    
    return new Promise(async(resolve,reject)=>{

        const Validations =await adminLoginValidation(data)

        if(Validations.error){
            return reject({status:false,adminLoginErr:Validations.error.details[0].message.replace(/"/g,'')})
        }
        
       const admin=await adminModel.findOne({username:data.username})

       if(admin){
           await bcrypt.compare(data.password,admin.password).then(async(status)=>{
               if(status){
                const token= await jwt.sign({id:admin._id,username:data.username,data:admin.lastLogin,status:"OK"},process.env.ADMIN_JWT_TOKEN,{expiresIn:"1d"});
                return resolve({status:true,msge:"Successfully logined.",token})
               }else{
                return reject({status:false,adminLoginErr:"Your password was incorrect. Please double-check your password."})
               }
           })
       }else{
           return reject({status:false,adminLoginErr:"The username you entered doesn't belong to an account. Please check your username and try again."})
       }
    })
}

//get all user details
const allUsers = () =>{
    return new Promise(async(resolve,reject)=>{
    //get all users
     const users=await userModel.find({}).lean()
    //dividing in blocked users and non-blocked users
     const blockedUser= (users.filter(e => e.blocked === true)) 

     const nonBlockedUser= (users.filter(e => e.blocked === false)) 
     
      resolve({users,blockedUser,nonBlockedUser})
    })
}

//delete user
const deleteUser = (id) =>{
    return new Promise(async(resolve,reject)=>{
       await userModel.findByIdAndDelete({_id:id})
       resolve({status:true,msge:"Deleted Account"})
    })
}

//blocking user
const blockUser = (id) =>{
    return new Promise(async(resolve,reject)=>{
     await userModel.findByIdAndUpdate({_id:id},{$set:{blocked:true}})
      resolve({status:true,msge:"Account is Blocked"})
    })
}

//unblocking user
const unBlockUser = (id) =>{
    return new Promise(async(resolve,reject)=>{
        await userModel.findByIdAndUpdate({_id:id},{$set:{blocked:false}})
        resolve({status:true,msge:"Account is Unblocked"})
    })
}

//adding new category
const  addCategory = (data) =>{
    return new Promise(async(resolve,reject)=>{

         const category = await categoryModel.findOne({name:data.category})
           
        if(category){
            return reject({status:false,categoryErr:"Category name already exists. Try with another name?"})
        }else{

            var todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

             const newCategory = new categoryModel({
                 name:data.category,
                 Created_at:todayDateFormat
             })

            await newCategory.save(async(err,res)=>{
                if(err){
            return reject({status:false,categoryErr:'Something went wrong try again'})
                }
                return resolve({ status: 'ok', msg: 'Category added Successfully.'})
             })
        }

    })
}

//adding new sub category
const addSubCategory = (data) =>{
    return new Promise(async(resolve,reject)=>{
            const category = await categoryModel.findOne({name:data.category})

            const subcategory = await SubCategoryModel.findOne({subcategory:data.subcategory})

            if(category && subcategory){
                return reject({status:false,subcategoryErr:'Already category and subcategory added. Try with another name?'})
            }

             var todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

             const newSubCategory = new SubCategoryModel({
                 subcategory:data.subcategory,
                 category:category._id,
                 Created_at:todayDateFormat
             })

            await newSubCategory.save(async(err,res)=>{
                if(err){
                    console.log(err);
            return reject({status:false,subcategoryErr:'Something went wrong try again'})
                }
                return resolve({ status: 'ok', msg: 'Sub-category added Successfully.'})
             })
    })
}

//adding new brand
const addBrand = (data) =>{

    return new Promise(async(resolve,reject)=>{

       const Brand = await brandModel.findOne({brand:data.brand})

       if(Brand){
        return reject({status:false,brandErr:"Brand name already exists. Try with another name?"})
       }

       const todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

       const newBrand = new brandModel({
           brand:data.brand,
           created_at:todayDateFormat
       })

        await newBrand.save(async(err,res)=>{

        if(err){
            console.log(err);
           return reject({status:false,brandErr:'Something went wrong try again'})
        }
           return resolve({ status: 'ok', msg: 'Sub-category added Successfully.'})
     })
       
    })
}

//adding new product
const addProduct = (data,proImg1,proImg2,proImg3,proImg4) =>{
    let disamt=parseInt(data.discount)
    let ogamt= parseInt(data.product_price)
    return new Promise(async(resolve,reject)=>{

         const Validations = await productAddValidation(data)
    
         if(Validations.error){
            return reject({status:false,productAddErr:Validations.error.details[0].message.replace(/"/g,'')})
         }

         if(disamt>=ogamt){
            return reject({status:false,productAddErr:'Discount price must be less than or equal two actual price.'})
         }

        const product = await ProductModel.findOne({productName:data.product_name})

        if(product){
           return reject({status:false,productAddErr:"Product name already exists. Try with another name?"})
        }else{

        var todayDateFormat = moment(new Date()).format("DD/MM/YYYY")

        const brand = await brandModel.findOne({brand:data.brand})

        const subcategory = await SubCategoryModel.findOne({subcategory:data.category})
        console.log(subcategory);
        const newProduct = new ProductModel({
            productName:data.product_name,
            price:data.product_price,
            originalPrice:data.originalPrice,
            stock:data.stock,
            description:data.description,
            SubCategory:subcategory._id,
            category:subcategory.category,
            brand:brand._id,
            shippingCost:data.shipping_cost,
            discountPrice:data.discount,
            image:{proImg1,proImg2,proImg3,proImg4},
            Created_at:todayDateFormat
        })
      
        await newProduct.save(async(err,res)=>{

            if(err){
                console.log(err);
            return reject({status:false,productAddErr:'Something went wrong try again'})
            }
            return resolve({ status: 'ok', msg: 'Product Save Successfully.'})
        })

    }

    })
}

//list all category
const listAllCategory = () => {
    return new Promise(async(resolve,reject)=>{
         let category = await categoryModel.find({}).lean()
         resolve(category)
    })
}

//list all sub category
const listAllSubcategory = () =>{
    return new Promise(async(resolve,reject)=>{
        const subCategory = await SubCategoryModel.find({}).lean().populate('category')
        resolve(subCategory)
    })
}

//list all brands
const listBrands = () =>{
    return new Promise(async(resolve,reject)=>{
        const brands = await brandModel.find({}).lean()
        resolve(brands)
    })
}

//list all products
const listProducts = () =>{
    return new Promise(async(resolve,reject)=>{
       const products = await ProductModel.find({}).lean().populate('SubCategory')
       resolve(products)
    })
}

const getProduct = (id) =>{
    return new Promise(async(resolve,reject)=>{
       const product = await ProductModel.findById({_id:id}).lean().populate('brand').populate('SubCategory')
       resolve(product)
    })
}

const editProduct = (id,data,proImg1,proImg2,proImg3,proImg4) =>{

   let disamt=parseInt(data.discount)
   let ogamt= parseInt(data.product_price)
    return new Promise(async(resolve,reject)=>{
    
        const Validations = await productAddValidation(data)
    
        if(Validations.error){
           return reject({status:false,editProductErr:Validations.error.details[0].message.replace(/"/g,'')})
        }
        
        if(disamt>=ogamt){
            return reject({status:false,editProductErr:"Discount price must be less than or equal two actual price."})
        }
   
        const subcategory = await SubCategoryModel.findOne({subcategory:data.category})
        const brand = await brandModel.findOne({brand:data.brand})

      await ProductModel.findByIdAndUpdate({_id:id},{$set:{
          productName:data.product_name,
          price:data.product_price,
          originalPrice:data.originalPrice,
          stock:data.stock,
          description:data.description,
          SubCategory:subcategory._id,
          category:subcategory.category,
          image:{proImg1,proImg2,proImg3,proImg4},
          brand:brand._id,  
          shippingCost:data.shipping_cost,
          discountPrice:data.discount,
      }}).then(()=>{
          resolve({status:true,msge:"Product successfully update."})
      }).catch((err)=>{
          console.log(err);
          reject({status:false,editProductErr:"Something went wrong try again"})
      })

    })
}

const deleteProduct = (id) =>{
    return new Promise(async(resolve,reject)=>{
        await ProductModel.findByIdAndDelete({_id:id}).then(()=>{
            resolve({status:true,msge:"Product deleted successfully."})
        })
    })
}

const totalUserCount = () =>{
    return new Promise(async(resolve,reject)=>{
       const users=await userModel.count()
        resolve(users)
    })
}

const totalBrandCount = () =>{
 return new Promise(async(resolve,reject)=>{
     const brands=await brandModel.count()
     resolve(brands)
 })
}

const totalProductCount = () =>{
    return new Promise(async(resolve,reject)=>{
        const products=await ProductModel.count()
        resolve(products)
    })
}

const totalCategoryCount = () =>{
    return new Promise(async(resolve,reject)=>{
      const categories = await categoryModel.count()
      resolve(categories)
    })
}

const totalOrder = () =>{
  return new Promise(async(resolve,reject)=>{
    const orders=await orderModel.count()
    resolve(orders)
  })
}

const CreateCoupon = (data) =>{
  return new Promise(async(resolve,reject)=>{

        const Validations = await couponCodeValidation(data)
    
        if(Validations.error){
           return reject({status:false,couponCodeErr:Validations.error.details[0].message.replace(/"/g,'')})
        }
    
        const coupon = await DiscountsModel.findOne({code:data.code})

        if(coupon){
            return reject({status:false,couponCodeErr:"Coupon code already exists."})
        }else{

            const expireDate = new Date(data.expiredate);

            let currentDate = new Date().getTime();

            var date = moment(currentDate).isBefore(expireDate)
           
            if(date==false){
                return reject({status:false,couponCodeErr:"Expire date must be greater than today date."})
            }

            const couponCodeDiscount = new DiscountsModel({
                code:data.code,
                isPercent:data.per,
                expireDate:expireDate,
                limit:data.limit,
            }) 

            couponCodeDiscount.save(async(err,res)=>{
                if(err){
                    return reject({status:false,couponCodeErr:"Something went wrong try again"})
                }
                return resolve({status:true,msge:"Coupon code created successfully.",data,res})
            })
        }
    })
}

const listCoupon = () =>{
    return new Promise(async(resolve,reject)=>{
        const coupon = await DiscountsModel.find({}).lean()
        resolve(coupon)
    })
}

const getAllOrders = () =>{
    return new Promise(async(resolve,reject)=>{
     const order = await orderModel.find({}).lean()
      if(order){
        resolve(order)
      }else{
        resolve()
      }
    })
}

const orderEdit = (id,User,data) =>{
    return new Promise(async(resolve,reject)=>{
        await orderModel.updateOne({user:User,product:{$elemMatch:{_id:id}}},{$set:{'product.$.status':data.status}})
        await orderModel.updateOne({user:User,product:{$elemMatch:{_id:id}}},{$set:{'product.$.paid':data.paid}})
        resolve()
    }) 
}


module.exports={adminLogin,allUsers,deleteUser,blockUser,unBlockUser,addProduct,addCategory,addSubCategory,addBrand,listAllCategory,listAllSubcategory,listBrands,listProducts,getProduct,editProduct,deleteProduct,totalCategoryCount,totalProductCount,totalUserCount,totalBrandCount,CreateCoupon,listCoupon,getAllOrders,orderEdit,totalOrder}