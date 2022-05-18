const Joi = require('joi');

const userSignupvalidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().required().min(3).label('Username'),
        email: Joi.string().email().required().label('Email').lowercase(),
        phone_number:Joi.number().integer().min(10).required().label('Number'),
        password: Joi.string().required().min(6).max(20).label('Password'),
        conform_password: Joi.any().equal(Joi.ref('password'))
        .required()
        .label('conform password')
        .messages({ 'any.only': '{{#label}} does not match' }),
    })

  
        return schema.validate(data);
}

const userLoginValidation = (data)=>{
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email'),
        phone_number:Joi.number().integer().min(10).required().label('Number'),
        password: Joi.string().required().min(6).max(20).label('Password'),
    })

  
        return schema.validate(data);
}

const forgetpasswordValidation = (data)=>{
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email'),
    })

  
        return schema.validate(data);
}

const resetpasswordValidation = (data)=>{
   
    const schema = Joi.object({
        password: Joi.string().required().min(6).max(20).label('Password'),
        conform_password: Joi.any().equal(Joi.ref('password'))
        .required()
        .label('conform password')
        .messages({ 'any.only': '{{#label}} does not match' }),
    })

  
        return schema.validate(data);
}


module.exports={userSignupvalidation,userLoginValidation,forgetpasswordValidation,resetpasswordValidation};