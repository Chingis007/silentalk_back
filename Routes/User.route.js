const express = require("express")
const router = express.Router()

const UserController = require("../Controllers/User.Controller")

//Create a new user (register) if exist - login
router.post("/", UserController.createNewUser)
router.get("/silly", UserController.doSilly)

//check login data And Return Token (login)
router.get(
  "/check/:email/:password",
  UserController.checkIfUserExistAndReturnToken
)

//Verify token
router.get("/verifyToken/:tokenCookie", UserController.CheckIfTokenValid)

//Verify token and send user data
router.get(
  "/verifyToken/:tokenCookie",
  UserController.CheckIfTokenValidAndSendUserData
)
//
//
//
//
//Update a user by id
router.post("/updateUser", UserController.updateAUser)

router.get("/cartItems/:tokenCookie", UserController.getUsersCart)

//Delete a user by id
// router.delete("/:id", UserController.deleteAUser)

module.exports = router
