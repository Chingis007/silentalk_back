const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  findname: {
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
  photoLink: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  publicNumber: {
    type: Boolean,
    required: true,
  },
  lastOnline: {
    type: String,
    required: true,
  },
  // googleId: {
  //   type: String,
  // },
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // pinCodeVerifyString: {
  //   type: String,
  //   required: false,
  // },
})

const User = mongoose.model("User", UserSchema)
module.exports = User
