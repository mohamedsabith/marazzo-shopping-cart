const Mongoose = require('mongoose');

const subCategorySchema = Mongoose.Schema({
  subcategory: {
    type: String,
  },
  category: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  Created_at: {
    type: String,
    required: true,
  },
});

const SubCategoryModel = Mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategoryModel;
