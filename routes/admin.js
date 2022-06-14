var express = require('express');
var router = express.Router();
const {adminLogin,allUsers,deleteUser,blockUser,unBlockUser,addProduct,addCategory,addSubCategory,listAllCategory,listAllSubcategory,listProducts,addBrand,listBrands,getProduct,editProduct,deleteProduct,totalUserCount,totalCategoryCount,totalProductCount,totalBrandCount,CreateCoupon,listCoupon,getAllOrders,totalOrder,orderEdit} = require('../controllers/adminControllers')
const verifyAdminToken = require('../middlewares/verifyAdmin')
const upload = require('../middlewares/productMulter');
const orderModel = require('../models/orderModel');

//admin login page router
router.get('/',function(req, res) {

  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
  
  const token = req.cookies.Admintoken;

  if(token || req.session.adminLogged){
      res.redirect('/admin/dashboard')
  }else{ 
    res.render('admin/adminLogin',{error:req.session.adminLoginErr})
    req.session.adminLoginErr=null
  }

});

//admin login page router
router.post('/login',(req,res)=>{
   adminLogin(req.body).then((result)=>{
    req.session.adminLogged=true
    res.cookie("Admintoken",result.token,{ httpOnly: true });
    res.redirect('/admin/dashboard')
   }).catch((error)=>{
     console.log(error);
     req.session.adminLoginErr=error.adminLoginErr
     res.redirect('/admin')
   })

})

//admin dashboard
router.get('/dashboard',verifyAdminToken,async(req,res)=>{
  const userCount = await totalUserCount()
  const productCount = await totalProductCount()
  const orderCount= await totalOrder()
  const categoryCount = await totalCategoryCount()
  const brandCount = await totalBrandCount()
  const coupon = await listCoupon()
  res.render('admin/adminHome',{userCount,productCount,categoryCount,brandCount,coupon,orderCount})
})

//user details router
router.get('/users',verifyAdminToken,(req,res)=>{
  allUsers().then((result)=>{   
     const allUser=result.users
     const blockUser=result.blockedUser
     const nonBlockUser=result.nonBlockedUser
    res.render('admin/listUsers',{allUser,blockUser,nonBlockUser})
  })
})

//delete user router
router.get('/deleteUser/:id',verifyAdminToken,(req,res)=>{
   let id = req.params.id
   deleteUser(id).then(()=>{
       res.clearCookie("token");
       res.session.destroy()
       res.redirect('/admin/users')
   })
})

//block user router
router.get('/blockUser/:id',verifyAdminToken,(req,res)=>{
  let id = req.params.id
  blockUser(id).then(()=>{
    res.clearCookie("token");
    res.session.destroy()
    res.redirect('/admin/users')
  })
})

//unblock user router
router.get('/unBlockUser/:id',verifyAdminToken,(req,res)=>{
  let id = req.params.id
  unBlockUser(id).then(()=>{
    res.redirect('/admin/users')
  })
})

//add new product router
router.get('/addProducts',verifyAdminToken,async(req,res)=>{
    const brand = await listBrands()
    const subcategory = await listAllSubcategory()
    res.render('admin/addProducts',{subcategory,brand,err:req.session.productAddErr})
    req.session.productAddErr=null
})

//add new product router
router.post('/addProduct',upload.fields([{name:"product_img",maxCount:1},{name:"thumb_img1",maxCount:1},{name:"thumb_img2",maxCount:1},{name:"thumb_img3",maxCount:1}]),(req,res)=>{
     let proImg1=req.files.product_img[0].filename
     let proImg2=req.files.thumb_img1[0].filename
     let proImg3=req.files.thumb_img2[0].filename
     let proImg4=req.files.thumb_img3[0].filename
    addProduct(req.body,proImg1,proImg2,proImg3,proImg4).then((result)=>{
        console.log(result);  
        res.redirect('/admin/listProducts')
    }).catch((err)=>{
       req.session.productAddErr=err.productAddErr
       res.redirect('/admin/addProducts')
    })
})

//list all product router
router.get('/listProducts',verifyAdminToken,async(req,res)=>{
  const products = await listProducts()
  res.render('admin/listProducts',{products})
})

//add new category router
router.get('/addCategory',verifyAdminToken,async(req,res)=>{
  const result = await listAllCategory()
   res.render('admin/addCategory',{result,err:req.session.categoryErr,error:req.session.subcategoryErr})
   req.session.categoryErr=null
   req.session.subcategoryErr=null
})

//add new category router
router.post('/category',(req,res)=>{
    addCategory(req.body).then((result)=>{
         console.log(result);
         res.redirect('/admin/addCategory')
    }).catch((err)=>{
          console.log(err);
          req.session.categoryErr=err.categoryErr
          res.redirect('/admin/addCategory')
    })
})

//add new sub category router
router.post('/subcategory',(req,res)=>{
    addSubCategory(req.body).then((result)=>{
         res.redirect('/admin/listCategory')
         console.log(result);
    }).catch((err)=>{
         console.log(err);
         req.session.subcategoryErr=err.subcategoryErr
         res.redirect('/admin/addCategory')
    })
})

//list all category router
router.get('/listCategory',verifyAdminToken,async(req,res)=>{
  const categories = await listAllSubcategory()
  const result = await listAllCategory()
   res.render('admin/listCategory',{categories,result})
})

//add new brand router
router.get('/addBrands',verifyAdminToken,(req,res)=>{
  res.render('admin/addBrand',{err:req.session.brandErr})
  req.session.brandErr=null
})

//add new brand router
router.post('/Addbrand',(req,res)=>{
   addBrand(req.body).then((result)=>{
     console.log(result);
     res.redirect('/admin/listBrands')
   }).catch((err)=>{
      req.session.brandErr=err.brandErr
      res.redirect('/admin/addBrands')
   })
})

//list all brands router
router.get('/listBrands',verifyAdminToken,async(req,res)=>{
  const brand = await listBrands()
  res.render('admin/listBrands',{brand})
})

//edit product router
router.get('/editProduct/:id',verifyAdminToken,async(req,res)=>{
    let product=await getProduct(req.params.id)
    let category=await listAllSubcategory()
    let brands=await listBrands()
    res.render('admin/editProduct',{product,category,brands,err:req.session.editProductErr})
    req.session.editProductErr=null
})

//edit product router
router.post('/editProduct/:id',upload.fields([{name:"product_img",maxCount:1},{name:"thumb_img1",maxCount:1},{name:"thumb_img2",maxCount:1},{name:"thumb_img3",maxCount:1}]),(req,res)=>{
  let proImg1=req.files.product_img ? req.files.product_img[0].filename : req.body.image1
  let proImg2=req.files.thumb_img1 ? req.files.thumb_img1[0].filename  : req.body.image2
  let proImg3=req.files.thumb_img2 ? req.files.thumb_img2[0].filename  : req.body.image3
  let proImg4=req.files.thumb_img3 ? req.files.thumb_img3[0].filename  : req.body.image4          
  editProduct(req.params.id,req.body,proImg1,proImg2,proImg3,proImg4).then(()=>{
     res.redirect('/admin/listProducts')
  }).catch((err)=>{
     req.session.editProductErr=err.editProductErr
     res.redirect('/admin/editProduct/' + req.params.id)
  })
})

//product delete router
router.get('/deleteProduct/:id',verifyAdminToken,(req,res)=>{
     deleteProduct(req.params.id).then((result)=>{
       console.log(result);
       res.redirect('/admin/listProducts')
     })
})

//coupon router
router.get('/addCoupon',verifyAdminToken,(req,res)=>{
   res.render('admin/addCoupon',{err:req.session.couponCodeErr})
   req.session.couponCodeErr=null
})

router.post('/addCoupon',(req,res)=>{
  CreateCoupon(req.body).then(async()=>{
   res.redirect('/admin/dashboard')
  }).catch((err)=>{
   req.session.couponCodeErr=err.couponCodeErr
   res.redirect('/admin/addCoupon')
  })

})

router.get('/order',async(req,res)=>{  
  const order = await getAllOrders()
  if(order){
    res.render('admin/orderView',{Order:order.product})
  }
  res.render('admin/orderView')
})

router.get('/editOrder/:id/:user',async(req,res)=>{
  const orderId=req.params.id
  const user=req.params.user
  res.render('admin/editOrder',{orderId,user})
})

router.post('/orderEdit/:id/:user',(req,res)=>{
   orderEdit(req.params.id,req.params.user,req.body).then((result)=>{
     res.redirect('/admin/order')
   })
})


router.post('/getChartData',async(req,res)=>{

  console.log(req.body);
  let {startDate,endDate} = req.body

  let d1, d2, text;
  if (!startDate || !endDate) {
      d1 = new Date();
      d1.setDate(d1.getDate() - 7);
      d2 = new Date();
      text = "For the Last 7 days";
    } else {
      d1 = new Date(startDate);
      d2 = new Date(endDate);
      text = `Between ${startDate} and ${endDate}`;
    }
 

// Date wise sales report
const date = new Date(Date.now());
const month = date.toLocaleString("default", { month: "long" });

let salesReport = await orderModel.aggregate([
{
  $match: {
    created: {
      $lt: d2,
      $gte: d1,
    },
  },
},
{
  $group: {
    _id: { $dayOfMonth: "$created" },
    total: { $sum: "$netAmount" },
  },
},
]);

let dateArray = [];
let totalArray = [];
salesReport.forEach((s) => {
dateArray.push(`${month}-${s._id} `);
totalArray.push(s.total);
});

let brandReport = await orderModel.aggregate([{
  $unwind: "$product",
},{
  $project:{
      brand: "$product.brand",
      subTotal:"$product.subtotal"
  }
},{
  $group:{
      _id:'$brand',
   totalAmount: { $sum: "$subTotal" },

  }
}

])


let orderCount = await orderModel.find({created:{$gt : d1, $lt : d2}}).count()

let Sales = 0;

salesReport.map((t) => {
  Sales += t.total
})


let success  = await orderModel.find({'products.paid':'Paided'})

let successPayment = 0;

success.map((e)=>{
  successPayment += e.netAmount
})

let brandArray = [];
let sumArray = [];
brandReport.forEach((s) => {
brandArray.push(s._id);
sumArray.push(s.totalAmount);
});

  res.json({dateArray,totalArray,brandArray,sumArray,orderCount,Sales,successPayment})

 })


module.exports = router;