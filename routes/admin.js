var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('admin/adminLogin')
});

router.get('/dashboard',(req,res)=>{
  res.render('admin/adminHome')
})

router.get('/users',(req,res)=>{
  res.render('admin/listUsers')
})

router.get('/addProducts',(req,res)=>{
  res.render('admin/addProducts')
})
module.exports = router;