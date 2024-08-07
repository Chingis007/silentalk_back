const createError = require("http-errors")
const mongoose = require("mongoose")
const argon2 = require("argon2")
const User = require("../Models/User.model")
const Chanell = require("../Models/Chanell.model")
const Chat = require("../Models/Chat.model")
const Service = require("../Models/Service.model")
const generatePassword = require("secure-random-password")
const { AUTH_TOKEN_KEY } = process.env
const jwt = require("jsonwebtoken")
// import * as jose from "jose"

module.exports = {
  // findByFindname: async (req, res, next) => {
  //   const findname = req.params.findname
  //   const type = req.params.type
  //   if(type == "chanell"){
  //     }
  //     if(type == "user"){
  //       let user = await User.find({
  //         findname: findname
  //       })
  //       let objToSend = {

  //       }
  //       return res.send(["Back is good",])
  //   }
  // },
  GlobalSearch: async (req, res, next) => {
    const toSearchValue = req.params.toSearchValue
    let finalArray = []
    let chanell = await Chanell.find({
      $or: [
        {
          findname: { $regex: `${toSearchValue}`, $options: "i" },
        },
        {
          username: { $regex: `${toSearchValue}`, $options: "i" },
        },
      ],
    })
    let user = await User.find({
      $or: [
        {
          findname: { $regex: `${toSearchValue}`, $options: "i" },
        },
        {
          username: { $regex: `${toSearchValue}`, $options: "i" },
        },
      ],
    })
    chanell.forEach((element) => {
      finalArray.push({
        photoLink: element.photoLink,
        findname: element.findname,
        username: element.username,
        subscribers: element.partisipants.length,
        type: "chanell",
      })
    })
    user.forEach((element) => {
      let phoneNumber = ""
      if (element.publicNumber) {
        phoneNumber = element.phoneNumber
      } else {
        phoneNumber = ""
      }
      finalArray.push({
        photoLink: element.photoLink,
        findname: element.findname,
        username: element.username,
        phoneNumber: phoneNumber,
        bio: element.bio,
        type: "user",
      })
    })
    return res.send(finalArray)
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
        // for (let index = 0; index < userList.chatsList.length; index++) {
        //   const userFromChat = await User.findOne({
        //     findname: userList.chatsList[index].userFindname,
        //   })
        //   userList.chatsList[index].lastOnline == userFromChat.lastOnline
        // }
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
            photoLink: chanell.photoLink,
            lastUpdated: chanell.lastUpdated,
          })
        }
        for (let i = 0; i < user.chatsList.length; i++) {
          const chat = await Chat.findOne({
            findname: user.chatsList[i].findname,
          })

          allChanells.push({
            group: chat.group,
            findname: chat.findname,
            partisipants: chat.partisipants,
            messages: chat.messages,
            lastUpdated: chat.lastUpdated,
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
        let usersList = []
        let onlineList = []
        allChanells.forEach((chanell) => {
          if (chanell.group !== "service") {
            chanell.partisipants.forEach((partisipant) => {
              if (partisipant.findname !== user.findname) {
                // @ts-ignore
                if (!usersList.includes(partisipant.findname)) {
                  // @ts-ignore
                  usersList.push(partisipant.findname)
                }
              }
            })
          }
        })
        for (let index = 0; index < usersList.length; index++) {
          const user = await User.findOne({
            findname: usersList[index],
          })
          onlineList.push({
            findname: usersList[index],
            online: user.lastOnline,
          })
        }
        return res.send(["Back is good", userList, allChanells, onlineList])
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
        return res.send(["No token send"])
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
          return res.send(["Wrong Token"])
          throw new Error("Unauthorized")
        }
        // const userToResond = {
        //   botsList: user.botsList,
        //   chatsList: user.chatsList,
        //   groupsList: user.groupsList,
        //   servicesList: user.servicesList,
        //   chanellsList: user.chanellsList,
        //   phoneNumber: user.phoneNumber,
        //   username: user.username,
        // }
        const userToResond = {
          findname: user.findname,
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
              findname: user.findname,
              auth_token: auth_token,
            }
            if (req.body.chatLink && req.body.chatType) {
              req.body.auth_token = auth_token
              next()
            }
            res.send(["Logged Successfully", objToSend])
            return
          })
      }
    } catch (error) {}
  },
  findGoogleUserByNumberAndLoginIt: async (req, res, next) => {
    const phoneNumber = req.headers["myphonenumber"]
    const email = req.main_payload.email
    try {
      const user = await User.findOne({ email: email })
      if (!user) {
        const user = await User.findOne({ phoneNumber: phoneNumber })
        if (!user) {
          next()
        } else {
          res.send([
            "User Exists but given email is not attached to given account",
          ])
          return
        }
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
      const pictureUrl = req.main_payload.picture
      const email = req.main_payload.email
      const phoneNumber = req.headers["myphonenumber"]
      const userExist = await User.findOne({ email: email })
      if (!userExist) {
        const userExist = await User.findOne({ phoneNumber: phoneNumber })
        if (userExist) {
          res.send(["Error on google create"])
          return
        }
      } else {
        res.send(["Error on google create"])
        return
      }
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
        $or: [
          {
            findname: randNumberToString,
          },
          {
            username: randNumberToString,
          },
        ],
      })
      while (randomNameNumber) {
        randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        randNumberToString = randNumber.toString()
        randomNameNumber = await User.findOne({
          $or: [
            {
              findname: randNumberToString,
            },
            {
              username: randNumberToString,
            },
          ],
        })
      }
      const username = randNumberToString
      const user = new User({
        findname: username,
        username: username,
        password: newPassword,
        phoneNumber: phoneNumber,
        photoLink: pictureUrl,
        bio: "",
        publicNumber: true,
        lastOnline: new Date().getTime().toString(),
        email: email,
        servicesList: [
          {
            findname: "silentalk",
            archived: "no",
            muted: "no",
            pinned: "no",
            lastSeenMsg: "0",
          },
        ],
        groupList: [],
        chatsList: [],
        botsList: [],
        chanellsList: [],
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
    try {
      const phoneNumber = req.body.phoneNumber
      const password = req.body.password
      const oldUser = await User.findOne({
        phoneNumber: phoneNumber,
      })
      if (oldUser) {
        argon2
          .verify(user.password, password)
          .catch(() => {
            res.send([
              "User is already registered, but wrong password was entered",
            ])
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
              findname: user.findname,
              auth_token: auth_token,
            }
            res.send(["User Exists", objToSend])
            return
          })
      }
      const newPassword = await argon2.hash(password)
      let minm = 100000000
      let maxm = 999999999
      let randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
      let randNumberToString = randNumber.toString()
      let randomNameNumber = await User.findOne({
        $or: [
          {
            findname: randNumberToString,
          },
          {
            username: randNumberToString,
          },
        ],
      })
      while (randomNameNumber) {
        randNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm
        randNumberToString = randNumber.toString()
        randomNameNumber = await User.findOne({
          $or: [
            {
              findname: randNumberToString,
            },
            {
              username: randNumberToString,
            },
          ],
        })
      }
      const username = randNumberToString
      const user = new User({
        findname: username,
        username: username,
        password: newPassword,
        phoneNumber: phoneNumber,
        photoLink: "",
        bio: "",
        publicNumber: true,
        lastOnline: "",
        email: "",
        servicesList: [
          {
            findname: "silentalk",
            archived: "no",
            muted: "no",
            pinned: "no",
            lastSeenMsg: "0",
          },
        ],
        groupList: [],
        chatsList: [],
        botsList: [],
        chanellsList: [],
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
        findname: user.findname,
        auth_token: auth_token,
      }
      if (req.body.chatLink && req.body.chatType) {
        req.body.auth_token = auth_token
        next()
      }
      res.send(["Created Successfully", objToSend])
    } catch (error) {
      console.log(error)
      res.send(["Creation Failed"])
    }

    // if (req.body.email) {
    //   const phoneNumber = req.body.phoneNumber
    //   try {
    //     const user = await User.findOne({ phoneNumber: phoneNumber })
    //     if (user) {
    //       const password = req.body.password
    //       try {
    //         argon2
    //           .verify(user.password, password)
    //           .catch(() => {
    //             return res.send("User registred but wrong password")
    //           })
    //           .then((match) => {
    //             if (match) {
    //               const jwtOptions = {
    //                 expiresIn: "24h", // Expire token in 24 hours
    //               }
    //               const myobj = JSON.stringify(user)
    //               const auth_token = jwt.sign(
    //                 { myobj: myobj },
    //                 process.env.AUTH_TOKEN_KEY,
    //                 jwtOptions
    //               )
    //               // userWithToken = { ...user, auth_token: auth_token }
    //               const objToSend = {
    //                 phoneNumber: user._doc.phoneNumber,
    //                 username: user._doc.username,
    //                 auth_token: auth_token,
    //               }
    //               return res.send(["User Exists", objToSend])
    //               // return res.send(objToSend)
    //             } else {
    //               return res.send("User Exists, but wrong password")
    //             }
    //           })
    //       } catch (error) {
    //         return res.send("Errr occurred")
    //         console.log(error.message)
    //         if (error instanceof mongoose.CastError) {
    //           next(createError(400, "Invalid User id"))
    //           return
    //         }
    //         next(error)
    //       }
    //     } else {
    //       try {
    //         if (req.body.hasOwnProperty("password")) {
    //           //user from register
    //           req.body = {
    //             ...req.body,
    //             password: await argon2.hash(req.body.password),
    //           }
    //           let minm = 100000000
    //           let maxm = 999999999
    //           let randNumber =
    //             Math.floor(Math.random() * (maxm - minm + 1)) + minm
    //           let randNumberToString = randNumber.toString()
    //           let randomNameNumber = await User.findOne({
    //             username: randNumberToString,
    //           })
    //           while (randomNameNumber) {
    //             randNumber =
    //               Math.floor(Math.random() * (maxm - minm + 1)) + minm
    //             randNumberToString = randNumber.toString()
    //             randomNameNumber = await User.findOne({
    //               username: randNumberToString,
    //             })
    //           }
    //           const user = new User({
    //             username: randNumberToString,
    //             findname: randNumberToString,
    //             password: req.body.password,
    //             phoneNumber: req.body.phoneNumber,
    //             groupsList: req.body.groupsList,
    //             chanellsList: req.body.chanellsList,
    //             chatsList: req.body.chatsList,
    //             botsList: req.body.botsList,
    //           })
    //           const result = await user.save()
    //           const jwtOptions = {
    //             expiresIn: "24h", // Expire token in 24 hours
    //           }
    //           const myobj = JSON.stringify(user)
    //           const auth_token = jwt.sign(
    //             { myobj: myobj },
    //             process.env.AUTH_TOKEN_KEY,
    //             jwtOptions
    //           )
    //           // userWithToken = { ...user, auth_token: auth_token }
    //           const objToSend = {
    //             phoneNumber: user._doc.phoneNumber,
    //             username: user._doc.username,
    //             auth_token: auth_token,
    //           }
    //           res.send(["Created Successfully", objToSend])
    //         } else {
    //         }
    //       } catch (error) {
    //         console.log(error.message)
    //         if (error.name === "ValidationError") {
    //           next(createError(422, error.message))
    //           return
    //         }
    //         next(error)
    //       }
    //     }
    //   } catch {
    //     return res.send("Error in email registration validation")
    //   }
    // } else {
    //   return res.send("Email had not been send properly to server")
    // }

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
      // const pinned = []

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
        photoLink: photoLink,
        lastUpdated: new Date().getTime().toString(),
      })

      await chanell.save()
      let newUserChanellsList = [...user.chanellsList]
      newUserChanellsList.push({
        findname: chanell.findname,
        archived: "no",
        muted: "permanent",
        pinned: "no",
        lastSeenMsg: "0",
      })
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
  fetchChatByLink: async (req, res, next) => {
    const chatFindname = req.headers["chatFindname"]
    const chatType = req.headers["chattype"]
    switch (chatType) {
      case "chanell":
        const oldChanell = await Chanell.findOne({
          findname: chatFindname,
        })
        if (!oldChanell) {
          res.send(["No chanell matching this link"])
          break
        }
        const chanellFindname = oldChanell.findname
        const username = oldChanell.username
        res.send(["Chanell exists", chanellFindname, username])
        break
      case "service":
        break
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

      chanell.lastUpdated = new Date().getTime().toString()
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
    try {
      const auth_token = req.body.auth_token
      const chatFindname = req.body.chatFindname
      const chatType = req.body.chatType

      const decodedUserInfo = jwt.verify(auth_token, process.env.AUTH_TOKEN_KEY)
      const userInfoObj = JSON.parse(decodedUserInfo.myobj)
      const user = await User.findOne({
        findname: userInfoObj.findname,
      })
      if (!user) {
        res.send(["Wrong Token"])
        return
      }
      const userFindname = user.findname

      switch (chatType) {
        case "chanell":
          const chanell = await Chanell.findOne({
            findname: chatFindname,
          })
          for (let i = 0; i < chanell.partisipants.length; i++) {
            if (chanell.partisipants[i].findname == user.findname) {
              res.send(["User is already subscribed"], userFindname, auth_token)
              return
            }
          }
          let newUserChanellsList = [...user.chanellsList]
          newUserChanellsList.push({
            findname: chanell.findname,
            archived: "no",
            muted: "no",
            pinned: "no",
            lastSeenMsg: chanell.messages.length,
          })
          user.chanellsList = newUserChanellsList
          await user.save()
          let newChanellsPartisipantsList = [...chanell.partisipants]
          newChanellsPartisipantsList.push({
            findname: user.findname,
            admin: "no",
            deleted: [],
          })
          chanell.partisipants = newChanellsPartisipantsList
          await chanell.save()
          res.send(["User Updated", userFindname, auth_token])
          break
        case "service":
          break
      }
    } catch (error) {
      console.log(error)
      res.send(["Some Error"])
    }
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
