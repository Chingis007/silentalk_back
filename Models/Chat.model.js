const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ChatSchema = new Schema({
  connection: {
    type: String,
    required: true,
  },
  chatUniqueCode: {
    type: String,
    required: true,
  },
  messages: {
    type: [],
    required: true,
  },
})

const Chat = mongoose.model("Chat", ChatSchema)
module.exports = Chat
