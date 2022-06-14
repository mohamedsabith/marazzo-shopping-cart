const Joi = require('joi')

const productAddValidation = (data)=>{
    const schema = Joi.object({
        product_name: Joi.string().required().label('Product Name'),
        product_price:Joi.number().min(1).integer().required().label('Product Price'),
        stock:Joi.number().required().min(0).max(300).integer().label('Stock'),
        originalPrice:Joi.number().required().min(0).label('Original Price'),
        category:Joi.string().required().label('Product Category'),
        description:Joi.string().required().min(20).max(500).label('Product Description'),
        image1:Joi.invalid(),
        image2:Joi.invalid(),
        image3:Joi.invalid(),
        image4:Joi.invalid(),
        brand:Joi.string().required().label('Brand'),
        shipping_cost:Joi.number().integer().required().label("Delivery Cost"),
        discount:Joi.number().integer().required().label("Discount")
    })

        return schema.validate(data);
}

module.exports=productAddValidation;