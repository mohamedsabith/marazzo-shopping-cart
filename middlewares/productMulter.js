const multer = require("multer");
const fs = require("fs");
const path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
    destination: (req, file, cb)=>{
  
      const dir ="./public/products";

       if(!fs.existsSync(dir)){
         fs.mkdirSync(dir)
       }
       cb(null,dir)
    },
  
    filename: function (req, file, cb) {
      cb(null, Date.now()+"-" +file.originalname )
    },
  });

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null,true)
    }else{
      cb(null,false)
    }
  }
  
var upload = multer({ 
    storage: storage,
    limits:{
      fieldSize:1024*1024*10
    },
    fileFilter:fileFilter
   })

module.exports=upload;