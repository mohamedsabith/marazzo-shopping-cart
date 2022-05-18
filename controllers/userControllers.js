const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const {userSignupvalidation,userLoginValidation,forgetpasswordValidation,resetpasswordValidation} = require('../validations/userValidation')
const jwt =require('jsonwebtoken')
const nodemailer = require('nodemailer');
const {phone} = require('phone');
const email_verifier = require('email-verifier-node');
const fast2sms = require('fast-two-sms');
require('dotenv').config()

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

       const numberVerify=await phone('+91'+data.phone_number)

       if(user){
            reject({status:false,errorSignup:'Another account is using this email'})
        }
        else if(number){
                reject({status:false,errorSignup:'Another account is using this phone number'})
        }else if(emailVerifier.is_verified==true){
               reject({status:false,errorSignup:'This email is not valid. Please enter valid mail.'})
        } else if(numberVerify.isValid==false){
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
     
    // saving to DB
    const newUser = new userModel({     
      username: user.username,
      email: user.email,
      phone_number:user.phone_number,
      password: data.password
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

const userDetails = (data) =>{
  return new Promise(async(resolve,reject)=>{
     const user =await userModel.findOne({username:data.name})
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



module.exports={userSignup,userLogin,otpSend,otpverification,forgetPassword,resetpassword,userDetails,otpVerify}