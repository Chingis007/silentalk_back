const express = require("express")
const router = express.Router()

const CookieController = require("../Controllers/Cookie.Controller")

router.get("/set", CookieController.setCookie)

module.exports = router
