const createError = require("http-errors")
const mongoose = require("mongoose")
const argon2 = require("argon2")
const User = require("../Models/User.model")
const Chanell = require("../Models/Chanell.model")
const Service = require("../Models/Service.model")
const generatePassword = require("secure-random-password")
const { AUTH_TOKEN_KEY } = process.env
const jwt = require("jsonwebtoken")
// import * as jose from "jose"

module.exports = {
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
          phoneNumber: userInfoObj.phoneNumber,
        })
        if (!user) {
          return res.send("Wrong Token")
          // throw new Error("Unauthorized")
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
  giveHash: async (req, res, next) => {
    const newPassword = await argon2.hash("1234567890")
    res.send(newPassword)
  },
  CheckTokenAndReturnAllChats: async (req, res, next) => {
    const auth_token = req.params.auth_token
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
        // console.log(userInfoObj)
        // console.log(userInfoObj.phoneNumber
        const user = await User.findOne({
          phoneNumber: userInfoObj.phoneNumber,
        })
        if (!user) {
          return res.send("Wrong Token")
          throw new Error("Unauthorized")
        }
        const userList = {
          botsList: user.botsList,
          chatsList: user.chatsList,
          groupsList: user.groupsList,
          servicesList: user.servicesList,
          chanellsList: user.chanellsList,
          findname: user.findname,
        }
        let allChanells = []
        for (let i = 0; i < user.chanellsList.length; i++) {
          const chanell = await Chanell.findOne({
            findname: user.chanellsList[i].findname,
          })
          allChanells.push({
            group: chanell.group,
            username: chanell.username,
            findname: chanell.findname,
            chanellDiscription: chanell.chanellDiscription,
            chanellUniqueCode: chanell.chanellUniqueCode,
            link: chanell.link,
            partisipants: chanell.partisipants,
            messages: chanell.messages,
            pinned: chanell.pinned,
            photoLink: chanell.photoLink,
            lastUpdated: chanell.lastUpdated,
          })
        }
        for (let i = 0; i < user.servicesList.length; i++) {
          const service = await Service.findOne({
            findname: user.servicesList[i].findname,
          })
          allChanells.push({
            group: service.group,
            serviceUniqueCode: service.undernameDiscription,
            findname: service.findname,
            username: service.username,
            photoLink: service.photoLink,
            lastUpdated: service.lastUpdated,
          })
        }
        allChanells.sort((a, b) => {
          return b.lastUpdated - a.lastUpdated
        })

        return res.send(["Back is good", userList, allChanells])
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
    const auth_token = req.params.auth_token
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
        // console.log(userInfoObj)
        // console.log(userInfoObj.phoneNumber
        const user = await User.findOne({
          phoneNumber: userInfoObj.phoneNumber,
        })
        if (!user) {
          return res.send("Wrong Token")
          throw new Error("Unauthorized")
        }
        const userToResond = {
          botsList: user.botsList,
          chatsList: user.chatsList,
          groupsList: user.groupsList,
          servicesList: user.servicesList,
          chanellsList: user.chanellsList,
          phoneNumber: user.phoneNumber,
          username: user.username,
        }
        // return res.send("Token valid")
        // ПОВНИЙ РЕСПОНЗ АБО ЛИШЕ ОСНОВНИЙ ОБЖЕКТ
        return res.send(["Back is good", userToResond])
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
  findUserByNumberAndPasswordAndLoginIt: async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber
    const password = req.body.password
    try {
      const user = await User.findOne({ phoneNumber: phoneNumber })
      if (!user) {
        res.send("Wrong Number")
      } else {
        argon2
          .verify(user.password, password)
          .catch(() => {
            res.send(["Wrong password"])
          })
          .then((match) => {
            //User exist, login it
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
              findname: user._doc.findname,
              email: user._doc.email,
              emailImgUrl: user._doc.emailImgUrl,
              auth_token: auth_token,
            }
            res.send(["Logged Successfully", objToSend])
            return
          })
      }
    } catch (error) {}
  },
  findGoogleUserByNumberAndLoginIt: async (req, res, next) => {
    const phoneNumber = req.headers["myphonenumber"]
    // const email = req.main_payload.email
    try {
      const user = await User.findOne({ phoneNumber: phoneNumber })
      if (!user) {
        next()
      } else {
        //User exist, login it
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
          findname: user._doc.findname,
          email: user._doc.email,
          emailImgUrl: user._doc.emailImgUrl,
          auth_token: auth_token,
        }
        res.send(["Email Exists and Logged Successfully", objToSend])
        return
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
  CreateNewUserWithGoogle: async (req, res, next) => {
    // if (ddasda) {
    //   // login
    //   const email = req.main_payload.email
    //   const password = req.main_payload.password
    //   argon2
    //     .verify(user.password, password)
    //     .catch(() => {
    //       res.send("Wrong password")
    //     })
    //     .then((match) => {
    //       if (match) {
    //         const jwtOptions = {
    //           expiresIn: "24h", // Expire token in 24 hours
    //         }
    //         const myobj = JSON.stringify(user)
    //         const auth_token = jwt.sign(
    //           { myobj: myobj },
    //           process.env.AUTH_TOKEN_KEY,
    //           jwtOptions
    //         )
    //         // userWithToken = { ...user, auth_token: auth_token }
    //         const objToSend = {
    //           email: user._doc.email,
    //           emailImgUrl: user._doc.emailImgUrl,
    //           auth_token: auth_token,
    //           cartItemsArray: user._doc.cartList,
    //         }
    //         res.send(["Email Exists", objToSend])
    //         return
    //       }
    //     })
    //   try {
    //   } catch (error) {}
    // } else {
    // create
    try {
      const email = req.main_payload.email
      const phoneNumber = req.headers["myphonenumber"]
      const newPassword = await argon2.hash(
        generatePassword.randomPassword({
          length: 10,
          characters: [
            generatePassword.lower,
            generatePassword.upper,
            generatePassword.digits,
          ],
        })
      )
      let minm = 100000000
      let maxm = 999999999
      let randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
      let randNumberToString = randNumber.toString()
      let randomNameNumber = await User.findOne({
        username: randNumberToString,
      })
      while (randomNameNumber) {
        randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        randNumberToString = randNumber.toString()
        randomNameNumber = await User.findOne({
          username: randNumberToString,
        })
      }
      const username = randNumberToString
      const user = new User({
        username: username,
        password: newPassword,
        phoneNumber: phoneNumber,
        servicesList: [
          { findname: "silentalk", archived: "no", muted: "no", pinned: "no" },
        ],
        email: email,
        // isVerified: true,
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
        username: user._doc.username,
        email: user._doc.email,
        emailImgUrl: user._doc.emailImgUrl,
        auth_token: auth_token,
      }
      res.send(["Created Successfully", objToSend])
    } catch (error) {
      console.log(error)
      res.send(["Creation Failed"])
    }
    // }
  },
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
                findname: randNumberToString,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                groupsList: req.body.groupsList,
                chanellsList: req.body.chanellsList,
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
  createNewChanell: async (req, res, next) => {
    try {
      const auth_token = req.body.auth_token
      const chanellName = req.body.chanellName

      let chanellDiscription = ""
      let photoLink = ""
      if (req.body.photoLink) {
        photoLink = req.body.photoLink
      }
      if (req.body.chanellDiscription) {
        chanellDiscription = req.body.chanellDiscription
      }

      const decodedUserInfo = jwt.verify(auth_token, process.env.AUTH_TOKEN_KEY)
      const userInfoObj = JSON.parse(decodedUserInfo.myobj)
      const user = await User.findOne({
        findname: userInfoObj.findname,
      })
      if (!user) {
        return res.send("Wrong Token")
      }
      const userFindname = user.findname

      let randomCodeNumber
      let aaa = true
      let chanellUniqueCode
      while (aaa) {
        let minm = 100000000
        let maxm = 999999999
        let randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        chanellUniqueCode = randNumber.toString()
        randomCodeNumber = await Chanell.findOne({
          chanellUniqueCode: chanellUniqueCode,
        })
        if (!randomCodeNumber) {
          aaa = false
        }
      }

      let randomLinkNumber
      let bbb = true
      let link
      while (bbb) {
        let minm = 100000000
        let maxm = 999999999
        let randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        link = randNumber.toString()
        randomLinkNumber = await Chanell.findOne({
          link: link,
        })
        if (!randomLinkNumber) {
          bbb = false
        }
      }

      let randomFindNumber
      let ddd = true
      let findname
      while (ddd) {
        let minm = 100000000
        let maxm = 999999999
        let randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        findname = randNumber.toString()
        randomFindNumber = await Chanell.findOne({
          findname: findname,
        })
        if (!randomFindNumber) {
          ddd = false
        }
      }

      const partisipants = [{ findname: `${userFindname}`, admin: "YES" }]
      const messages = []
      const pinned = []

      // const handleUpload = async (oneFile: File) => {
      //   let formData = new FormData()
      //   formData.append("file", oneFile)
      //   formData.append("upload_preset", "vbght5om")
      //   let url = new URL(
      //     `https://api.cloudinary.com/v1_1/${
      //       import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME
      //     }/image/upload`
      //   )
      //   return fetch(url, {
      //     method: "POST",
      //     body: formData,
      //   })
      //     .then(async (response) => {
      //       const resText = await response.json()
      //       return resText.secure_url
      //     })
      //     .catch((error) => {
      //       console.log(error)
      //     })
      // }

      const chanell = new Chanell({
        group: "chanell",
        username: chanellName,
        findname: findname,
        chanellDiscription: chanellDiscription,
        chanellUniqueCode: chanellUniqueCode,
        link: link,
        partisipants: partisipants,
        messages: messages,
        pinned: pinned,
        photoLink: photoLink,
        lastUpdated: new Date().getTime().toString(),
      })

      await chanell.save()
      let newUserChanellsList = [...user.chanellsList]
      newUserChanellsList.push({ findname: chanell.findname })
      user.chanellsList = newUserChanellsList
      await user.save()

      datatosend = {
        group: "chanell",
        username: chanell.username,
        findname: chanell.username,
        chanellDiscription: chanell.chanellDiscription,
        publicUniqueCode: chanell.publicUniqueCode,
        link: chanell.link,
        partisipants: chanell.partisipants,
        messages: chanell.messages,
        pinned: chanell.pinned,
        photoLink: chanell.photoLink,
        lastUpdated: chanell.lastUpdated,
      }

      res.send(["chanell created successfully", datatosend])
    } catch (error) {
      console.log(error)
      res.send(`Error on Backend`)
      return
    }
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
  updateChanellChat: async (req, res, next) => {
    try {
      const auth_token = req.body.auth_token
      const findname = req.body.findname
      const newMessage = req.body.newMessage

      const decodedUserInfo = jwt.verify(auth_token, process.env.AUTH_TOKEN_KEY)
      const userInfoObj = JSON.parse(decodedUserInfo.myobj)
      const user = await User.findOne({
        findname: userInfoObj.findname,
      })
      if (!user) {
        return res.send("Wrong Token")
      }
      const userFindname = user.findname

      const chanell = await Chanell.findOne({
        findname: findname,
      })

      for (let i = 0; i < chanell.partisipants.length; i++) {
        if (chanell.partisipants[i].findname == findname) {
          if (chanell.partisipants[i].admin != "yes") {
            return res.send("Not an Admin")
          } else {
            return
          }
        }
      }
      chanell.messages.push(newMessage)
      await chanell.save()

      datatosend = {
        messages: chanell.messages,
      }
      res.send(["chanell messages updated successfully", datatosend])
    } catch (error) {
      console.log(error)
      res.send(`Error on Backend`)
      return
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
