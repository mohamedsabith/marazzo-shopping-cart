const Joi = require('joi')

const adminLoginValidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().min(4).required().label('Username'),
        password: Joi.string().required().min(6).max(20).label('Password'),
    })

  
    return schema.validate(data);
}

const couponCodeValidation = (data) =>{

    const schema = Joi.object({
        code: Joi.string().min(5).required().label('Coupon code'),
        per: Joi.number().required().min(6).max(20).label('Percentage'),
        expiredate:Joi.required().label('Expire date'),
        limit:Joi.number().integer().required().label('Limit')
    })

  
    return schema.validate(data);
}
module.exports={adminLoginValidation,couponCodeValidation}