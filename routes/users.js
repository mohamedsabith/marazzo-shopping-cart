const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();
const {
  verifyUser,
  verifyToken,
  verifySession,
} = require('../middlewares/verifyUser');
const upload = require('../middlewares/userMulter');
const cartModel = require('../models/cartModel');
const {
  userSignup,
  userLogin,
  otpSend,
  otpverification,
  forgetPassword,
  resetpassword,
  userDetails,
  otpVerify,
  listAllCategory,
  listAllSubcategory,
  newProducts,
  userCart,
  productView,
  cartCount,
  cartItems,
  userDetailsUpdate,
  changeCartQuantity,
  cartProductDelete,
  totalAmount,
  couponDetails,
  subTotal,
  checkCouponCode,
  getWishlist,
  saveWishlist,
  wishlistProductDelete,
  shippingCost,
  categoryProducts,
  addressCheck,
  pincodeDetails,
  getAddress,
  billingAddress,
  conformAddress,
  shippingAddress,
  AddNewAddress,
  AppleBrandProducts,
  mensFashion,
  newOrder,
  generateRazorpay,
  verifyPayment,
  updatePaymentStatus,
  getDirection,
  getOrder,
  userOrder,
  orderCancel,
  orderTrack,
  paymentFailed,
  generatePdf,
  productSerach,
  invoiceSend,
} = require('../controllers/userControllers');

//home router
router.get('/', async (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  const categories = await listAllCategory();
  const newProduct = await newProducts();
  const Menfashion = await mensFashion();
  const appleBrand = await AppleBrandProducts();

  if (req.cookies.token) {
    var decode = jwt.decode(req.cookies.token);
    const totalAmt = await totalAmount(decode.email);
    const countCart = await cartCount(decode.email);
    res.render('user/home', {
      user: decode.name,
      token: req.cookies.token,
      categories,
      newProduct,
      countCart,
      totalAmt,
      Menfashion,
      appleBrand,
    });
  } else {
    res.render('user/home', {
      categories,
      newProduct,
      countCart: 0,
      Menfashion,
      appleBrand,
    });
  }
});

//signup page router
router.get('/signup', verifySession, function (req, res) {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  res.render('user/signup', { signupErr: req.session.signupErr, countCart: 0 });

  req.session.signupErr = null;
});

//signup page router
router.post('/signup', (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  userSignup(req.body)
    .then((result) => {
      req.session.signupResult = result;
      res.redirect('/otpverification');
    })
    .catch((err) => {
      console.log(err);
      req.session.signupErr = err.errorSignup;
      res.redirect('/signup');
    });
});

//signup otp verification page router
router.get('/otpverification', verifySession, (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  res.render('user/otpForm', {
    otpErr: req.session.otpErr,
    email: req.session.signupResult.data.email,
  });

  req.session.otpErr = null;
});

//signup otp verification router
router.post('/otpverification', (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  otpverification(
    req.body,
    req.session.signupResult.data,
    req.session.signupResult.randomNumber
  )
    .then((result) => {
      res.cookie('token', result.token, { httpOnly: true });
      req.session.loggedIn = true;
      res.redirect('/');
    })
    .catch(async (err) => {
      req.session.otpErr = err.otpErr;
      res.redirect('/otpverification');
    });
});

//login page router
router.get('/login', verifySession, (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  res.render('user/login', { loginErr: req.session.LoginErr });
  req.session.LoginErr = null;
});

//login page router
router.post('/login', (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  userLogin(req.body)
    .then(async (result) => {
      otpSend(result)
        .then(() => {
          const number = result.user.phone_number;
          const last4num = String(number).slice(-4);
          req.session.number = last4num;
          req.session.userid = result.user._id;
          res.redirect('/otpverify');
        })
        .catch((err) => {
          console.log(err);
          req.session.LoginErr = err.errorLogin;
          res.redirect('/login');
        });
    })
    .catch((err) => {
      console.log(err);
      req.session.LoginErr = err.errorLogin;
      res.redirect('/login');
    });
});

//login otp verification router
router.get('/otpverify', verifySession, (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  res.render('user/otpVerify', {
    number: req.session.number,
    userid: req.session.userid,
    err: req.session.loginErrotp,
  });
  req.session.loginErrotp = null;
});

//login otp verification router
router.post('/otpVerify/:id', (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  otpVerify(req.body, req.params.id)
    .then((response) => {
      req.session.loggedIn = true;
      res.cookie('token', response.token, { httpOnly: true });
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
      req.session.loginErrotp = err.errOtp;
      res.redirect('/otpverify');
    });
});

//forgot password router
router.get('/forgotpassword', (req, res) => {
  res.render('user/forgotPassword', {
    msge: req.session.forgetMsge,
    err: req.session.forgotErr,
  });

  req.session.forgetMsge = null;
  req.session.forgotErr = null;
});

//forgot password router
router.post('/forgotpassword', (req, res) => {
  forgetPassword(req.body)
    .then((result) => {
      req.session.forgetMsge = result.msge;
      res.cookie('token', result.token, { httpOnly: true });
      res.redirect('/forgotpassword');
    })
    .catch((err) => {
      console.log(err);
      req.session.forgotErr = err.forgotErr;
      res.redirect('/forgotpassword');
    });
});

//reset password router
router.get('/resetpassword/:id', verifyToken, (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  req.session.tokenid = req.params.id;
  res.render('user/resetPassword', { err: req.session.resetErr });
  req.session.resetErr = null;
});

//reset password router
router.post('/resetpassword', (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  let token = req.session.tokenid;

  resetpassword(req.body, token)
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
      req.session.resetErr = err.errorReset;
      res.redirect('/resetpassword/' + token);
    });
});

//logout router
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.session.destroy();
  res.redirect('/');
});

router.get('/viewProduct/:id', async (req, res) => {
  let product = await productView(req.params.id);
  const token = req.cookies.token;
  if (token) {
    var decode = jwt.decode(token);
    const totalAmt = await totalAmount(decode.email);
    const countCart = await cartCount(decode.email);
    res.render('user/productDetail', {
      product,
      countCart,
      user: decode.name,
      token: token,
      totalAmt,
    });
  }
  res.render('user/productDetail', { product });
});

//user cart router
router.get('/cart', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const subamt = await subTotal(decode.email);
  const deliveryCost = await shippingCost(decode.email);
  const totalAmt = await totalAmount(decode.email);
  const countCart = await cartCount(decode.email);
  const cart = await cartItems(decode.email);
  const empty = cart == 'CART EMPTY' || cart.products.length == 0;
  res.render('user/cart', {
    cart,
    countCart,
    totalAmt,
    user: decode.name,
    token: token,
    empty,
  });
  req.session.errorCoupon = null;
});

router.get('/cart/:id', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const user = jwt.decode(token);
  userCart(req.params.id, user.email)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/');
    });
});

//user profile router
router.get('/profile', verifyUser, (req, res) => {
  const token = req.cookies.token;
  var decode = jwt.decode(token);

  userDetails(decode)
    .then(async (result) => {
      const user = result.user;
      res.render('user/myAccount', { user, err: req.session.userUpdateErr });
      req.session.userUpdateErr = null;
    })
    .catch((err) => {
      console.log(err);
      res.clearCookie('token');
      req.session.destroy();
      res.redirect('/');
    });
});

router.post('/updateProfile/:id', upload.single('userimg'), (req, res) => {
  let userimage = req.file ? req.file.filename : req.body.image;

  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const number = decode.phone_number;
  userDetailsUpdate(req.params.id, number, userimage, req.body)
    .then((result) => {
      res.cookie('token', result.token, { httpOnly: true });
      res.redirect('/profile');
    })
    .catch((err) => {
      req.session.userUpdateErr = err.errorUpdate;
      res.redirect('/profile');
    });
});

router.post('/change-product-quantity', (req, res) => {
  changeCartQuantity(req.body).then((result) => {
    res.status(200).json(result);
  });
});

router.post('/cartDelete', (req, res) => {
  cartProductDelete(req.body.cart, req.body.product).then(() => {
    res.redirect('/cart');
  });
});

router.post('/coupon', (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  checkCouponCode(req.body.coupon, decode.email)
    .then((result) => {
      req.session.netAmount = result.netAmount;
      req.session.couponDiscount = result.discount;
      res.redirect('/payment');
    })
    .catch((err) => {
      req.session.errorCoupon = err.errorCoupon;
      res.redirect('/payment');
    });
});

router.get('/wishlistAdd/:id', verifyUser, (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  saveWishlist(req.params.id, decode.email).then((result) => {
    res.status(200).json(result);
  });
});

//user wishlist router
router.get('/wishlist', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const totalAmt = await totalAmount(decode.email);
  const countCart = await cartCount(decode.email);
  const wishlistProducts = await getWishlist(decode.email);
  const empty =
    wishlistProducts == null || wishlistProducts.product.length == 0;
  res.render('user/wishlist', {
    wishlistProducts,
    token: token,
    totalAmt,
    empty,
    countCart,
  });
});

router.post('/wishlistDelete', (req, res) => {
  wishlistProductDelete(req.body.user, req.body.product).then(() => {
    res.redirect('/wishlist');
  });
});

router.get('/billing', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const subamt = await subTotal(decode.email);
  const deliveryCost = await shippingCost(decode.email);
  const totalAmt = await totalAmount(decode.email);
  const countCart = await cartCount(decode.email);
  const cart = await cartItems(decode.email);
  const addressChecked = await addressCheck(decode.email);
  const address = await getAddress(decode.email);
  res.render('user/billing', {
    userAddress: address.Useraddress,
    billingAddress: address.billingAddress,
    cart,
    countCart,
    totalAmt,
  });
});

router.get('/category/:id', async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decode = jwt.decode(token);
    const totalAmt = await totalAmount(decode.email);
    const countCart = await cartCount(decode.email);
    let products = await categoryProducts(req.params.id);
    const categories = await listAllCategory();
    res.render('user/categoryPage', {
      products: products.product,
      categories,
      subCategory: products.subCategory,
      token: token,
      totalAmt,
      countCart,
    });
  } else {
    let products = await categoryProducts(req.params.id);
    const categories = await listAllCategory();
    res.render('user/categoryPage', {
      products: products.product,
      categories,
      subCategory: products.subCategory,
    });
  }
});

router.get('/pincode/:id', verifyUser, async (req, res) => {
  const pincode = await pincodeDetails(req.params.id);
  res.status(200).json(pincode);
});

router.post('/newAddress', (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  billingAddress(req.body, decode.email)
    .then((result) => {
      res.redirect('/billing');
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/billing');
    });
});

router.get('/deliver/:id', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const address = await conformAddress(req.params.id, decode.email);
  res.status(200).json(address);
});

router.get('/homeAddress/:id', verifyUser, async (req, res) => {
  const address = await AddNewAddress(req.params.id);
  res.status(200).json(address);
});

router.get('/payment', verifyUser, async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const subamt = await subTotal(decode.email);
  const deliveryCost = await shippingCost(decode.email);
  const totalAmt = await totalAmount(decode.email);
  const countCart = await cartCount(decode.email);
  const cart = await cartItems(decode.email);
  const address = await shippingAddress(decode.email, decode.id);
  const coupon = await couponDetails();
  const netAmount = cart.total - cart.couponDiscount;
  res.render('user/payment', {
    cart,
    countCart,
    totalAmt,
    address,
    err: req.session.errorCoupon,
    netAmount,
    discountAmt: req.session.couponDiscount,
    coupon,
  });
  req.session.errorCoupon = null;
});

router.post('/placeOrder', (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  newOrder(decode.email, req.body.payment)
    .then((response) => {
      getDirection(response).then((result) => {
        req.session.orderId = response.data._id;
        if (req.body.payment == 'Cash on Delivery') {
          generatePdf(response, decode.email, result.date).then((Path) => {
            invoiceSend(Path.file, decode.email).then(async () => {
              req.session.InvoiceUrl = Path.path;
              await cartModel.findOneAndDelete({ userId: decode.email });
              res.status(200).json({ status: true, method: 'COD' });
            });
          });
        } else if (req.body.payment == 'Razorpay') {
          generateRazorpay(response).then((result) => {
            res
              .status(200)
              .json({ order: result, method: 'Razorpay', user: decode });
          });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect('/payment');
    });
});

router.post('/verifyPayment', (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  verifyPayment(req.body, decode.email)
    .then(() => {
      updatePaymentStatus(req.body['order[receipt]']).then(() => {
        res.status(200).json({ status: true, msge: 'Payment Successfully' });
      });
    })
    .catch(() => {
      res.json({ status: false, msge: 'Payment Failed' });
    });
});

router.get('/myorder', (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const productOrder = [];
  userOrder(decode.email).then((result) => {
    result.forEach((res) => {
      res.product.forEach((prdt) => {
        productOrder.push(prdt);
      });
    });

    res.render('user/orderPage', { productOrder });
  });
});

router.get('/orderSuccess', async (req, res) => {
  res.header(
    'Cache-control',
    'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0'
  );

  if (req.session.orderId) {
    const token = req.cookies.token;
    const decode = jwt.decode(token);
    const address = await shippingAddress(decode.email, decode.id);
    getOrder(req.session.orderId).then((result) => {
      const TotalDiscount = result.discountPrice + result.couponDiscount;
      const netAmount = result.total - result.couponDiscount;
      const deliveryDate = moment(new Date(result.deliverDate)).format(
        'ddd MMM DD YYYY'
      );
      res.render('user/orderSuccess', {
        result,
        address,
        TotalDiscount,
        netAmount,
        deliveryDate,
        link: req.session.InvoiceUrl,
      });
    });
  } else {
    res.redirect('/');
  }
});

router.post('/orderCancel', (req, res) => {
  orderCancel(req.body.id).then(() => {
    res.status(200).json({ status: true });
  });
});

router.get('/orderTrack/:id', async (req, res) => {
  const token = req.cookies.token;
  const decode = jwt.decode(token);
  const address = await shippingAddress(decode.email, decode.id);
  orderTrack(req.params.id).then((result) => {
    res.render('user/orderTrack', { result, address });
  });
});

router.post('/paymentFailed', (req, res) => {
  paymentFailed(req.body).then((result) => {
    res.status(200).json({ status: true });
  });
});

router.get('/productSerach', async (req, res) => {
  const products = await productSerach();
  res.status(200).json(products);
});

router.get('/search', async (req, res) => {
  const token = req.cookies.token;
  const categories = await listAllCategory();
  const Searchproduct = await productSerach(req.query.search);
  const searchEmpty = Searchproduct.length == 0;
  if (token) {
    var decode = jwt.decode(token);
    res.render('user/productSearch', {
      categories,
      Searchproduct,
      searchEmpty,
      token: token,
      user: decode.name,
    });
  } else {
    res.render('user/productSearch', {
      categories,
      Searchproduct,
      searchEmpty,
    });
  }
});

module.exports = router;
