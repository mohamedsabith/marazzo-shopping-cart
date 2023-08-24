const Mongoose = require('mongoose');

const categorySchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  Created_at: {
    type: String,
    required: true,
  },
});

const categoryModel = Mongoose.model('Category', categorySchema);

module.exports = categoryModel;
