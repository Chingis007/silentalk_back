const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ChanellSchema = new Schema({
  group: {
    default: "chanell",
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  findname: {
    type: String,
    required: true,
  },
  chanellDiscription: {
    type: String,
    required: true,
  },
  chanellUniqueCode: {
    type: String,
    required: true,
  },
  link: {
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
  photoLink: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: String,
    required: true,
  },
})

const Chanell = mongoose.model("Chanell", ChanellSchema)
module.exports = Chanell
