const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: String,         // previously productName
  brand: String,
  description: String,
  purchaseDate: Date,
  warrantyPeriod: Number,
  expiryDate: Date,
  billImagePath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Warranty', warrantySchema);
