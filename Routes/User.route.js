const express = require("express")
const router = express.Router()

const UserController = require("../Controllers/User.Controller")

//Create a new user (register) if exist - login
router.post("/createNewUser", UserController.createNewUser)

router.post("/createNewChanell", UserController.createNewChanell)
router.post("/updateChanellChat", UserController.updateChanellChat)

router.get("/fetchChatByLink", UserController.fetchChatByLink)
// router.get("/fetchChatByLink", UserController.addToChat)

//check login data And Return Token (login)
router.get(
  "/check/:email/:password",
  UserController.checkIfUserExistAndReturnToken
)
router.post(
  "/findUserByNumberAndPasswordAndLoginIt",
  UserController.findUserByNumberAndPasswordAndLoginIt
)
//Verify token
router.get("/verifyToken/:tokenCookie", UserController.CheckIfTokenValid)
router.get(
  "/verifyTokenAndSendData/:auth_token",
  UserController.CheckIfTokenValidAndSendUserData
)

//Verify token and send user data
router.get(
  "/CheckTokenAndReturnAllChats/:auth_token",
  UserController.CheckTokenAndReturnAllChats
)
router.get("/giveHash", UserController.giveHash)

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
