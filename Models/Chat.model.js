const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ChatSchema = new Schema({
  group: {
    default: "chat",
    type: String,
    required: true,
  },
  findname: {
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
  lastUpdated: {
    type: String,
    required: true,
  },
})

const Chat = mongoose.model("Chat", ChatSchema)
module.exports = Chat
