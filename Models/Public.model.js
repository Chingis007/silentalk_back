const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PublicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  groupUniqueCode: {
    type: String,
    required: true,
  },
  partisipants: {
    type: [],
    required: true,
  },
  messages: {
    type: [],
    required: true,
  },
  pinned: {
    type: [],
    required: true,
  },
})

const Public = mongoose.model("Public", PublicSchema)
module.exports = Public
