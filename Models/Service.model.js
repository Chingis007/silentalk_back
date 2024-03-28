const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ServiceSchema = new Schema({
  // connection: {
  //   type: String,
  //   required: true,
  // },
  serviceUniqueCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
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
