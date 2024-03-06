const createError = require("http-errors")
// const mongoose = require("mongoose")

// const Cookie = require("../Models/Product.model")

module.exports = {
  setCookie: async (req, res, next) => {
    try {
      res.cookie(`Cookie token name`, `encrypted cookie string Value`)
      console.log("Cookie have been saved successfully")
      res.send("Its fine")
    } catch (error) {
      console.log(error.message)
      next()
    }
  },
}
