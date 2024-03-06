const createError = require("http-errors")
const mongoose = require("mongoose")
const argon2 = require("argon2")
const User = require("../Models/User.model")
const Item = require("../Models/Chat.model")
const generatePassword = require("secure-random-password")
const { AUTH_TOKEN_KEY } = process.env
const jwt = require("jsonwebtoken")
// import * as jose from "jose"

module.exports = {
  getAllItems: async (req, res, next) => {
    try {
      const results = await Item.find({}, { __v: 0 })
      // const results = await User.find({}, { name: 1, price: 1, _id: 0 });
      // const results = await User.find({ price: 699 }, {});
      res.send(results)
    } catch (error) {
      console.log(error.message)
    }
  },
  getSpecificItems: async (req, res, next) => {
    try {
      let searchPageType = req.params.searchPageType
      let searchText = req.params.searchText
      // if (searchPageType == "search") {
      // if (searchText == "") {
      //   const results = await Item.find({})
      //   res.send(results)
      // }
      // тут мало б бути створення арея слів схожих на те що дали, і по цим словам пошук айтемів у базі
      const results = await Item.find({})
      res.send(results)
      // searchText
      // const results = await Item.find({}, { name: somePullOfWords })
      // res.send(results)

      // } else {
      //   const results = await Item.find({}, { peopleGroup: searchPageType })
      //   res.send(results)
      // }
      // const results = await User.find({}, { name: 1, price: 1, _id: 0 });
      // const results = await User.find({ price: 699 }, {});
    } catch (error) {
      console.log(error.message)
    }
  },

  createNewItem: async (req, res, next) => {
    try {
      let boolNewCollection = false
      if (
        req.body.newCollection == "True" ||
        req.body.newCollection == "true"
      ) {
        boolNewCollection = true
      } else {
        if (
          req.body.newCollection == "False" ||
          req.body.newCollection == "false"
        ) {
          boolNewCollection = false
        } else {
          next(createError(422, error.message))
          return
        }
      }

      const item = new Item({
        name: req.body.name,
        itemUniqueCode: req.body.itemUniqueCode,
        groupCode: req.body.groupCode,
        brand: req.body.brand,
        manufacturer: req.body.manufacturer,
        additional: req.body.additional,
        material: req.body.material,
        newCollection: boolNewCollection,
        peopleGroup: req.body.peopleGroup,
        allSizes: req.body.allSizes,
      })
      const result = await item.save()
      res.send(result.name)
    } catch (error) {
      console.log(error.message)
      if (error.name === "ValidationError") {
        next(createError(422, error.message))
        return
      }
      next(error)
    }

    /*Or:
    If you want to use the Promise based approach*/
    /*
    const user = new User({
      name: req.body.name,
      price: req.body.price
    });
    user
      .save()
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(err => {
        console.log(err.message);
      }); 
      */
  },
  checkAuthToken: async (req, res, next) => {
    const auth_token = req.params.tokenCookie
    try {
      if (!auth_token) {
        throw new Error("Unauthorized")
      }
      try {
        const decodedUserInfo = jwt.verify(
          auth_token,
          process.env.AUTH_TOKEN_KEY
        )
      } catch (error) {
        if (error.message === "jwt expired") {
          return res.status(403).json({ error: "Token expired" })
          // LOGIC FOR RELOGINING
          console.log(error)
        } else {
          console.log(error)
        }
      }
      const decodedUserInfo = jwt.verify(auth_token, process.env.AUTH_TOKEN_KEY)
      // Check if user actually exist in db
      // const modifdecodedUserInfo = decodedUserInfo.myobj
      // try {
      //   const userInfoObj = JSON.parse(modifdecodedUserInfo)
      // } catch {
      //   console.log("shit")
      // }
      const userInfoObj = JSON.parse(decodedUserInfo.myobj)
      const user = await User.findOne({
        email: userInfoObj.email,
      })
      if (!user) {
        throw new Error("Unauthorized")
      }
      const verifyedUserObj = { ...user, userInfoObj: userInfoObj }
      return res.send(verifyedUserObj)
      // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
      return res.send(userInfoObj)
    } catch (error) {
      return res.status(403).json({ error: "Unauthorized" })
    }
  },
  findItemByitemUniqueCode: async (req, res, next) => {
    if (req.params.itemUniqueCode) {
      const itemUniqueCode = req.params.itemUniqueCode
      try {
        const item = await Item.findOne({ itemUniqueCode: itemUniqueCode })
        if (!item) {
          res.send(["Item doesnt exists", {}])
        } else {
          res.send(["Item exists", item])
          return
        }
      } catch (error) {
        console.log(error.message)
        if (error instanceof mongoose.CastError) {
          next(createError(400, "Invalid ItemUniqueCode"))
          return
        }
        next(error)
      }
    } else {
      if (req.body) {
        const itemUniqueCode = req.body.itemUniqueCode
        // const password = req.params.password
        // тут пароль має видатись випадковий, бо чел зайшов за доп гугла
        try {
          const item = await Item.findOne({ itemUniqueCode: itemUniqueCode })
          if (!item) {
            next()
          } else {
            res.send("ItemUniqueCode already exists")
            // argon2
            //   .verify(user.password, password)
            //   .catch(() => {
            //     throw new Error(
            //       "Something went wrong on password verification. Please try again."
            //     )
            //   })
            //   .then((match) => {
            //     if (match) {
            //       res.cookie(`email`, `${email}`)
            //       res.cookie(`password`, `${password}`)
            //       res.cookie(`emailImgUrl`, `${user.emailImgUrl}`)
            //       res.send("Email Exists")
            //       return
            //     } else {
            //       res.send(
            //         "Email is already registered, but wrong password was entered"
            //       )
            //       return
            //     }
            //   })
          }
        } catch (error) {
          console.log(error.message)
          if (error instanceof mongoose.CastError) {
            next(createError(400, "Invalid User id"))
            return
          }
          next(error)
        }
      } else {
        if (req.main_payload.email) {
          const email = req.main_payload.email
          const password = req.main_payload.password
          // const password = req.params.password
          // тут пароль має видатись випадковий, бо чел зайшов за доп гугла
          try {
            const user = await User.findOne({ email: email })
            if (!user) {
              next()
            } else {
              argon2
                .verify(user.password, password)
                .catch(() => {
                  throw new Error(
                    "Something went wrong on password verification. Please try again."
                  )
                })
                .then((match) => {
                  if (match) {
                    res.cookie(`email`, `${email}`)
                    res.cookie(`password`, `${password}`)
                    res.cookie(`emailImgUrl`, `${user.emailImgUrl}`)
                    res.send("Email Exists")
                    return
                  } else {
                    res.send(
                      "Email is already registered, but wrong password was entered"
                    )
                    return
                  }
                })
            }
          } catch (error) {
            console.log(error.message)
            if (error instanceof mongoose.CastError) {
              next(createError(400, "Invalid User id"))
              return
            }
            next(error)
          }
        } else {
          return
        }
      }
    }
  },
}
