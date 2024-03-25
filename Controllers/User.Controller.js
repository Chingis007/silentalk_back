const createError = require("http-errors")
const mongoose = require("mongoose")
const argon2 = require("argon2")
const User = require("../Models/User.model")
const generatePassword = require("secure-random-password")
const { AUTH_TOKEN_KEY } = process.env
const jwt = require("jsonwebtoken")
// import * as jose from "jose"

module.exports = {
  mypost: async (req, res, next) => {
    console.log("silly is good")
    return res.send("Billy dilly mega silly")
  },
  CheckIfTokenValid: async (req, res, next) => {
    const auth_token = req.params.tokenCookie
    try {
      if (!auth_token) {
        return res.send("No token send")
      }
      try {
        const decodedUserInfo = jwt.verify(
          auth_token,
          process.env.AUTH_TOKEN_KEY
        )
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
          return res.send("Wrong Token")
          throw new Error("Unauthorized")
        }
        return res.send("Token valid")
        // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
        return res.send(userInfoObj)
      } catch (error) {
        if (error.message === "jwt expired") {
          return res.send("Token expired")
          return res.status(403).json({ error: "Token expired" })
          // LOGIC FOR RELOGINING
          console.log(error)
        } else {
          console.log(error)
        }
      }
    } catch (error) {
      return res.status(403).json({ error: "Something else wrong" })
    }
  },
  CheckIfTokenValidAndSendUserData: async (req, res, next) => {
    const auth_token = req.params.tokenCookie
    try {
      if (!auth_token) {
        return res.send("No token send")
      }
      try {
        const decodedUserInfo = jwt.verify(
          auth_token,
          process.env.AUTH_TOKEN_KEY
        )
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
          return res.send("Wrong Token")
          throw new Error("Unauthorized")
        }
        // return res.send("Token valid")
        // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
        return res.send(userInfoObj)
      } catch (error) {
        if (error.message === "jwt expired") {
          return res.send("Token expired")
          return res.status(403).json({ error: "Token expired" })
          // LOGIC FOR RELOGINING
          console.log(error)
        } else {
          console.log(error)
        }
      }
    } catch (error) {
      return res.status(403).json({ error: "Something else wrong" })
    }
  },
  doSilly: async (req, res, next) => {
    res.send("Silly things are working")
  },
  findGoogleUserByEmail: async (req, res, next) => {
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
            res.send("Wrong password")
          })
          .then((match) => {
            if (match) {
              const jwtOptions = {
                expiresIn: "24h", // Expire token in 24 hours
              }
              const myobj = JSON.stringify(user)
              const auth_token = jwt.sign(
                { myobj: myobj },
                process.env.AUTH_TOKEN_KEY,
                jwtOptions
              )
              // userWithToken = { ...user, auth_token: auth_token }
              const objToSend = {
                email: user._doc.email,
                emailImgUrl: user._doc.emailImgUrl,
                auth_token: auth_token,
                cartItemsArray: user._doc.cartList,
              }
              res.send(["Email Exists", objToSend])
              return
            } else {
              res.send("Wrong password")
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
  },
  LoginOrCreateNewUserWithGoogle: async (req, res, next) => {},
  createNewUser: async (req, res, next) => {
    //register form responce
    if (req.body.email) {
      const phoneNumber = req.body.phoneNumber
      try {
        const user = await User.findOne({ phoneNumber: phoneNumber })
        if (user) {
          const password = req.body.password
          try {
            argon2
              .verify(user.password, password)
              .catch(() => {
                return res.send("User registred but wrong password")
              })
              .then((match) => {
                if (match) {
                  const jwtOptions = {
                    expiresIn: "24h", // Expire token in 24 hours
                  }
                  const myobj = JSON.stringify(user)
                  const auth_token = jwt.sign(
                    { myobj: myobj },
                    process.env.AUTH_TOKEN_KEY,
                    jwtOptions
                  )
                  // userWithToken = { ...user, auth_token: auth_token }
                  const objToSend = {
                    phoneNumber: user._doc.phoneNumber,
                    username: user._doc.username,
                    auth_token: auth_token,
                  }
                  return res.send(["User Exists", objToSend])
                  // return res.send(objToSend)
                } else {
                  return res.send("User Exists, but wrong password")
                }
              })
          } catch (error) {
            return res.send("Errr occurred")
            console.log(error.message)
            if (error instanceof mongoose.CastError) {
              next(createError(400, "Invalid User id"))
              return
            }
            next(error)
          }
        } else {
          try {
            if (req.body.hasOwnProperty("password")) {
              //user from register
              req.body = {
                ...req.body,
                password: await argon2.hash(req.body.password),
              }
              let minm = 100000000
              let maxm = 999999999
              let randNumber =
                Math.floor(Math.random() * (maxm - minm + 1)) + minm
              let randNumberToString = randNumber.toString()
              let randomNameNumber = await User.findOne({
                username: randNumberToString,
              })
              while (randomNameNumber) {
                randNumber =
                  Math.floor(Math.random() * (maxm - minm + 1)) + minm
                randNumberToString = randNumber.toString()
                randomNameNumber = await User.findOne({
                  username: randNumberToString,
                })
              }
              const user = new User({
                username: randNumberToString,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                groupsList: req.body.groupsList,
                publicsList: req.body.publicsList,
                chatsList: req.body.chatsList,
                botsList: req.body.botsList,
              })
              const result = await user.save()
              const jwtOptions = {
                expiresIn: "24h", // Expire token in 24 hours
              }
              const myobj = JSON.stringify(user)
              const auth_token = jwt.sign(
                { myobj: myobj },
                process.env.AUTH_TOKEN_KEY,
                jwtOptions
              )
              // userWithToken = { ...user, auth_token: auth_token }
              const objToSend = {
                phoneNumber: user._doc.phoneNumber,
                username: user._doc.username,
                auth_token: auth_token,
              }
              res.send(["Created Successfully", objToSend])
            } else {
              // user from google auth
              const newPassword = generatePassword.randomPassword({
                length: 10,
                characters: [
                  generatePassword.lower,
                  generatePassword.upper,
                  generatePassword.digits,
                ],
              })
              let minm = 100000000
              let maxm = 999999999
              let randNumber =
                Math.floor(Math.random() * (maxm - minm + 1)) + minm
              let randNumberToString = randNumber.toString()
              let randomNameNumber = await User.findOne({
                username: randNumberToString,
              })
              while (randomNameNumber) {
                randNumber =
                  Math.floor(Math.random() * (maxm - minm + 1)) + minm
                randNumberToString = randNumber.toString()
                randomNameNumber = await User.findOne({
                  username: randNumberToString,
                })
              }
              const user = new User({
                username: randNumberToString,
                password: newPassword,
                phoneNumber: phoneNumber, //змінити логін сторінку щоб при гугл логіні спочатку давало поле для телефону а потім гугле
                cartList: [],
                orderList: [],
                buyHistory: " ",
                googleId: " ",
                provider: " ",
                isVerified: true,
              })
              const result = await user.save()
              const jwtOptions = {
                expiresIn: "24h", // Expire token in 24 hours
              }
              const myobj = JSON.stringify(user)
              const auth_token = jwt.sign(
                { myobj: myobj },
                process.env.AUTH_TOKEN_KEY,
                jwtOptions
              )
              // userWithToken = { ...user, auth_token: auth_token }
              const objToSend = {
                email: user._doc.email,
                emailImgUrl: user._doc.emailImgUrl,
                auth_token: auth_token,
                cartItemsArray: user._doc.cartList,
              }
              res.send(["Created Successfully", objToSend])
            }
          } catch (error) {
            console.log(error.message)
            if (error.name === "ValidationError") {
              next(createError(422, error.message))
              return
            }
            next(error)
          }
        }
      } catch {
        return res.send("Error in email registration validation")
      }
    } else {
      return res.send("Email had not been send properly to server")
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
  NOT_WORKING_checkAuthToken: async (req, res, next) => {
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
      const verifyedUserObj = { ...user }
      return res.send(verifyedUserObj._doc.cartList)
      // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
      return res.send(userInfoObj)
    } catch (error) {
      return res.status(403).json({ error: "Unauthorized" })
    }
  },

  checkIfUserExistAndReturnToken: async (req, res, next) => {
    if (req.params.email) {
      const email = req.params.email
      const password = req.params.password
      try {
        const user = await User.findOne({ email: email })
        if (!user) {
          res.send("User is not registered")
        } else {
          argon2
            .verify(user.password, password)
            .catch(() => {
              return res.send("Email registred but wrong password")
            })
            .then((match) => {
              if (match) {
                const jwtOptions = {
                  expiresIn: "24h", // Expire token in 24 hours
                }
                const myobj = JSON.stringify(user)
                const auth_token = jwt.sign(
                  { myobj: myobj },
                  process.env.AUTH_TOKEN_KEY,
                  jwtOptions
                )
                // userWithToken = { ...user, auth_token: auth_token }
                const objToSend = {
                  email: user._doc.email,
                  auth_token: auth_token,
                }
                return res.send(["Email Exists", objToSend])
                // return res.send(objToSend)
              } else {
                return res.send("Email Exists, but wrong password")
              }
            })
        }
      } catch (error) {
        return res.send("Errr occurred")
        console.log(error.message)
        if (error instanceof mongoose.CastError) {
          next(createError(400, "Invalid User id"))
          return
        }
        next(error)
      }
    } else {
      if (req.body.email) {
        const email = req.body.email
        const password = req.body.password
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
                  const jwtOptions = {
                    expiresIn: "24h", // Expire token in 24 hours
                  }
                  const myobj = JSON.stringify(user)
                  const auth_token = jwt.sign(
                    { myobj: myobj },
                    process.env.AUTH_TOKEN_KEY,
                    jwtOptions
                  )
                  // userWithToken = { ...user, auth_token: auth_token }
                  const objToSend = {
                    email: user._doc.email,
                    emailImgUrl: user._doc.emailImgUrl,
                    auth_token: auth_token,
                    cartItemsArray: user._doc.cartList,
                  }
                  res.send(["Email Exists", objToSend])
                  return
                } else {
                  res.send([
                    "Email is already registered, but wrong password was entered",
                    {},
                  ])
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
                  const jwtOptions = {
                    expiresIn: "24h", // Expire token in 24 hours
                  }
                  const myobj = JSON.stringify(user)
                  const auth_token = jwt.sign(
                    { myobj: myobj },
                    process.env.AUTH_TOKEN_KEY,
                    jwtOptions
                  )
                  // userWithToken = { ...user, auth_token: auth_token }
                  const objToSend = {
                    email: user._doc.email,
                    emailImgUrl: user._doc.emailImgUrl,
                    auth_token: auth_token,
                    cartItemsArray: user._doc.cartList,
                  }
                  res.send(["Email Exists", objToSend])
                  return
                } else {
                  res.send([
                    "Something went wrong on password verification. Please try again.",
                    {},
                  ])
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
      }
    }
  },

  updateAUser: async (req, res, next) => {
    // if (req.body.auth_token) {
    // const auth_token = req.body.auth_token
    const auth_token = req.body[req.body.length - 1]
    // const auth_token = req.body.auth_token
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
          return res.status(403).json({ error: "Some token error" })
        }
      }
      const decodedUserInfo = jwt.verify(auth_token, process.env.AUTH_TOKEN_KEY)
      const userInfoObj = JSON.parse(decodedUserInfo.myobj)
      const user = await User.findOne({
        email: userInfoObj.email,
      })
      if (!user) {
        throw new Error("Unauthorized")
      }
      // delete req.body.auth_token
      // const newList = [...user.cartList]
      // newList.push(req.body)
      // user.cartList = newList
      const newList = [...req.body]
      newList.pop()
      // if (Math.abs(user.cartList.length - newList.length) == 1) {
      user.cartList = newList
      await user.save()
      res.send(["CartList Updated"])
      // }
    } catch (error) {
      return res.status(403).json({ error: "Unauthorized" })
    }
    // }
  },
  getUsersCart: async (req, res, next) => {
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
          return res.send(["User is not logged in"])
          return res.status(403).json({ error: "Token expired" })
          // LOGIC FOR RELOGINING
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
      const verifyedUserObj = { ...user }
      return res.send([
        "User cart items received",
        verifyedUserObj._doc.cartList,
      ])
      // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
      return res.send(userInfoObj)
    } catch (error) {
      return res.send(["Some problem with your cart items"])
    }
  },
  deleteAUser: async (req, res, next) => {
    const id = req.params.id
    try {
      const result = await User.findByIdAndDelete(id)
      // console.log(result);
      if (!result) {
        throw createError(404, "User does not exist.")
      }
      res.send(result)
    } catch (error) {
      console.log(error.message)
      if (error instanceof mongoose.CastError) {
        next(createError(400, "Invalid User id"))
        return
      }
      next(error)
    }
  },
}
