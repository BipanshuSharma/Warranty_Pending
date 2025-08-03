const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // link to the user who added it
    required: true,
  },
  productName: String,
  purchaseDate: Date,
  warrantyPeriod: Number, // in months
  billImageUrl: String,   // if you're storing bill image
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Warranty', warrantySchema);

