const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ServiceSchema = new Schema({
  // connection: {
  //   type: String,
  //   required: true,
  // },
  group: {
    default: "service",
    type: String,
    required: true,
  },
  serviceUniqueCode: {
    type: String,
    required: true,
  },
  findname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  undernameDiscription: {
    type: String,
    required: true,
  },
  photoLink: {
    type: String,
    required: true,
  },
  // messages: {
  //   type: [],
  //   required: true,
  // },
})

const Service = mongoose.model("Service", ServiceSchema)
module.exports = Service
