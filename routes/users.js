var express = require("express");
var router = express.Router();
const jwt =require('jsonwebtoken')
require("dotenv").config();
const { verifyUser, verifyToken,verifySession } = require("../middlewares/verifyUser");
const {userSignup, userLogin,otpSend,otpverification,forgetPassword,resetpassword,userDetails,otpVerify} = require("../controllers/userControllers");

router.get("/", function (req, res) {
  
  res.header("Cache-control", "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");

  const token = req.cookies.token;

   if(token){
    var decode= jwt.decode(token)
    res.render("user/home",{user:decode.name,token:token});
   }else{
     res.render('user/home')
   }
 
});

router.get("/signup",verifyUser, function (req, res) {

  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");

  res.render("user/signup", { signupErr: req.session.signupErr });

  req.session.signupErr = null;
});

router.post("/signup", (req, res) => {

  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
 
  userSignup(req.body).then((result)=>{
    req.session.signupResult=result
    res.redirect("/otpverification");
  }).catch((err)=>{
    console.log(err);
    req.session.signupErr=err.errorSignup
    res.redirect('/signup')
  })

});

router.get("/otpverification",verifySession,(req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");

  res.render("user/otpForm", {otpErr:req.session.otpErr,email:req.session.signupResult.data.email});

  req.session.otpErr = null;
});

router.post("/otpverification",(req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
      const user=req.session.signupResult.data.username
      const randomNumber=req.session.signupResult.randomNumber
  otpverification(req.body,user,randomNumber).then((result) => {
    res.cookie("token", result.token, { httpOnly: true });
     req.session.loggedIn=true
      res.redirect("/");
    }).catch(async (err) => {
      req.session.otpErr = err.otpErr;
      res.redirect("/otpverification");
    });

});

router.get("/login",verifySession,(req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");

  res.render("user/login", { loginErr: req.session.LoginErr });
  req.session.LoginErr = null;

});

router.post("/login", (req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
  userLogin(req.body).then(async (result) => {

      otpSend(result).then((response) => {
          const number = result.user.phone_number;
          const last4num = String(number).slice(-4);
          req.session.number = last4num;
          req.session.userid = result.user._id;
          res.redirect("/otpverify");
        }).catch((err) => {
          console.log(err);
          req.session.LoginErr = err.errorLogin;
          res.redirect("/login");
        });

    }).catch((err) => {
      console.log(err);
      req.session.LoginErr = err.errorLogin;
      res.redirect("/login");
    });
});

router.get('/otpverify',verifySession,(req,res)=>{
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
  res.render('user/otpVerify',{number:req.session.number,userid:req.session.userid,err:req.session.loginErrotp})
  req.session.loginErrotp=null
})

router.post('/otpVerify/:id',(req,res)=>{
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
    let id = req.params.id

    otpVerify(req.body,id).then((response)=>{
      req.session.loggedIn=true
      res.cookie("token", response.token, { httpOnly: true });
      res.redirect('/')
    }).catch((err)=>{
      console.log(err);
      req.session.loginErrotp=err.errOtp
      res.redirect("/otpverify")
    })

})

router.get("/forgotpassword", (req, res) => {
  
  res.render("user/forgotPassword", {msge: req.session.forgetMsge,err: req.session.forgotErr,});
  req.session.forgetMsge = null;
  req.session.forgotErr = null;
});

router.post("/forgotpassword", (req, res) => {

  forgetPassword(req.body).then((result) => {
      req.session.forgetMsge = result.msge;
      res.cookie("token", result.token, { httpOnly: true });
      res.redirect("/forgotpassword");
    }).catch((err) => {
      console.log(err);
      req.session.forgotErr = err.forgotErr;
      res.redirect("/forgotpassword");
    });

});

router.get("/resetpassword/:id", verifyToken, (req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
  req.session.tokenid = req.params.id;
  res.render("user/resetPassword", { err: req.session.resetErr });
  req.session.resetErr = null;

});

router.post("/resetpassword", (req, res) => {
  res.header("Cache-control","no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0");
  let token = req.session.tokenid;
  resetpassword(req.body, token).then((result) => {
      res.redirect("/login");
    }).catch((err) => {
      console.log(err);
      req.session.resetErr = err.errorReset;
      res.redirect("/resetpassword/" + token);
    });

});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.session.destroy();
  res.redirect("/");
});

router.get('/wishlist',(req,res)=>{
   res.render('user/wishlist')
})

router.get('/cart',(req,res)=>{
   res.render('user/cart')
})

router.get('/profile',verifyUser,(req,res)=>{
 const token = req.cookies.token;
 var decode= jwt.decode(token)
 userDetails(decode).then(async(result)=>{
   let username=result.user.username
   let email=result.user.email
   res.render('user/myAccount',{username,email})
 })

 
})
module.exports = router;
