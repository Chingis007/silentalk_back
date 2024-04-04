const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  groupsList: {
    type: [],
    required: true,
  },
  chanellsList: {
    type: [],
    required: true,
  },
  chatsList: {
    type: [],
    required: true,
  },
  botsList: {
    type: [],
    required: true,
  },
  servicesList: {
    type: [],
    required: true,
  },
  googleId: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  pinCodeVerifyString: {
    type: String,
    required: false,
  },
})

const User = mongoose.model("User", UserSchema)
module.exports = User
