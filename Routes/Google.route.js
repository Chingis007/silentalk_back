const passport = require("passport")
// require("../Controllers/passportLocal")(passport)
// require("../Controllers/Google.Controller")(passport)
const dotenv = require("dotenv").config()
const express = require("express")
const createError = require("http-errors")
const GoogleController = require("../Controllers/Google.Controller")
const UserController = require("../Controllers/User.Controller")
const router = express.Router()

// router.get(
//   "/",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// )

// router.get(
//   "/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.redirect("/profile")
//   }
// )
router.get(
  "/temporfetch",
  GoogleController.verify,
  UserController.findGoogleUserByNumberAndLoginIt, //if find send cookies and return
  UserController.CreateNewUserWithGoogle
)
router.post("/sendmail", GoogleController.sendMail)
module.exports = router
