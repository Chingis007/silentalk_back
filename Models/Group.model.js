const mongoose = require("mongoose")
const Schema = mongoose.Schema

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
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

const Group = mongoose.model("Group", GroupSchema)
module.exports = Group
