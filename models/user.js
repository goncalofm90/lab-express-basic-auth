// User model goes here

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 25,
    unique: true
  },

  passwordHashAndSalt: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;