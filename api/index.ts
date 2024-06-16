const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const expressSession = require("express-session")
const passport = require("passport")
const { OAuth2Client } = require("google-auth-library")
const cors = require("cors")
const dotenv = require("dotenv").config()
const MemoryStore = require("memorystore")(expressSession)
const { WebSocketServer } = require("ws")
const jwt = require("jsonwebtoken")
const User = require("../Models/User.model")
const Chanell = require("../Models/Chanell.model")

const app = express()

// "builds": [{ "src": "/index.js", "use": "@vercel/node" }],

app.get("/", (req, res) => {
  res.send("Express on Vercel")
})
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  )
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin,withCredentials,Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers,myAuthProp,myPhoneNumber,chatLink,chatType "
  )
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Private-Network", true)
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200)

  next()
})
// app.use(
//   cors()
//   // {
//   // origin: "*", змінив коли кукіси не сетались в браузері
//   // origin: "*",
//   // origin: true,
//   // credentials: true,
//   // }
// )
app.use(cookieParser("someSecret"))
// app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  expressSession({
    secret: "someSecret",
    resave: true,
    saveUninitialized: true,
    // setting the max age to longer duration
    // maxAge: 24 * 60 * 60 * 1000,
    store: new MemoryStore(),
  })
)

// Initialize DB
require("./initDB")()

// const ProductRoute = require("./Routes/Product.route")
const UserRoute = require("../Routes/User.route")
// const CookieRoute = require("./Routes/Cookie.route")
const GoogleRoute = require("../Routes/Google.route")
// const ItemRoute = require("./Routes/Item.route")
// app.use("/cookies", CookieRoute)
app.use("/google", GoogleRoute)
// app.use("/products", ProductRoute)
app.use("/users", UserRoute)
// app.use("/items", ItemRoute)

app.use(passport.initialize())
app.use(passport.session())
//404 handler and pass to error handler
// app.use((req, res, next) => {
//   /*
//   const err = new Error('Not found');
//   err.status = 404;
//   next(err);
//   */
//   // You can use the above code if your not using the http-errors module
//   next(createError(404, "Not found"))
// })

// app.use((req, res, next) => {
//   const origin = req.get("referer")
//   const isWhitelisted = whitelist.find((w) => origin && origin.includes(w))
//   if (isWhitelisted) {
//     res.setHeader("Access-Control-Allow-Origin", "*")
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     )
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,Content-Type,Authorization"
//     )
//     res.setHeader("Access-Control-Allow-Credentials", true)
//   }
//   // Pass to next layer of middleware
//   if (req.method === "OPTIONS") res.sendStatus(200)
//   else next()
// })

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})
const PORT = process.env.PORT || 80

const s = app.listen(PORT, () => {
  console.log("Server started on port " + PORT + "...")
})

function onSocketPreError(e) {
  console.log("onSocketPreError", e)
}

function onSocketPostError(e) {
  console.log("onSocketPostError", e)
}

const wss = new WebSocketServer({ noServer: true })

s.on("upgrade", (req, socket, head) => {
  socket.on("error", onSocketPreError)
  // perform auth
  if (!!req.headers["BadAuth"]) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
    socket.destroy()
    return
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    socket.removeListener("error", onSocketPreError)
    wss.emit("connection", ws, req)
  })
})
async function verifyToken(token) {
  try {
    const decodedUserInfo = jwt.verify(token, process.env.AUTH_TOKEN_KEY)
    const userInfoObj = JSON.parse(decodedUserInfo.myobj)
    return userInfoObj
    // const user = await User.findOne({
    //   email: userInfoObj.email,
    // })
  } catch (error) {
    if (error.message === "jwt expired") {
      //   wss.clients?.forEach((client) => {
      //     if (client.readyState === WebSocket.OPEN) {
      //       client.send({ error: "Token expired" })
      //     }
      //   })
      //   console.log(error)
      return { token: "expired" }
      // LOGIC FOR RELOGINING
    } else {
      // wss.clients?.forEach((client) => {
      //   if (client.readyState === WebSocket.OPEN) {
      //     client.send({ error: "Some token error" })
      //   }
      // })
      return { token: "bad" }
    }
  }
}
wss.on("connection", async (connection, req) => {
  connection.on("error", onSocketPostError)
  const auth_token = req.url.slice(1)
  // const cookies = req.headers.cookie
  // if (cookies) {
  //   const tokenCookieString = cookies.split(";")
  //   for (let i = 0; i < tokenCookieString.length; i++) {
  //     let oneCookieArray = tokenCookieString[i].split("=")
  //     if (oneCookieArray[0].trim() == "auth_token") {
  //       const auth_token = oneCookieArray[1].trim()
  const userObject = await verifyToken(auth_token)
  connection.findname = userObject.findname
  //     }
  //   }
  // }
  connection.on("message", async (msg) => {
    try {
      // msg = {
      //   type:"addMsgToChanell"
      //   findname:"12521512341"
      //   newMessage:{
      // img:"",
      // comentary:"",
      // emotions:[]
      //   }
      // }
      const userFindname = connection.findname
      msg = JSON.parse(msg)
      if (msg.action == "removeDeleted") {
        const user = await User.findOne({
          findname: userFindname,
        })
        let numberToSendBack = 0
        let allMsgsFromAllChatsToDelete = msg.removeDeleted
        let lastSeenCorrectionArray: {
          findname: string
          number: number
          type: string
        }[] = []
        for (let i = 0; i < allMsgsFromAllChatsToDelete.length; i++) {
          if (allMsgsFromAllChatsToDelete[i].chatType == "chanell") {
            const chanell = await Chanell.findOne({
              findname: allMsgsFromAllChatsToDelete[i].chatFindname,
            })
            let newPartisipants = structuredClone(chanell.partisipants)
            let toMeasurePartisipants = structuredClone(chanell.partisipants)
            let curentLastSeen
            for (let p = 0; p < user.chanellsList.length; p++) {
              if (
                user.chanellsList[p].findname ==
                allMsgsFromAllChatsToDelete[i].chatFindname
              ) {
                curentLastSeen = Number(user.chanellsList[p].lastSeenMsg)
              }
            }
            for (let l = 0; l < toMeasurePartisipants.length; l++) {
              if (toMeasurePartisipants[l].findname == userFindname) {
                let allMsgsArray = structuredClone(chanell.messages)
                for (
                  let k = 0;
                  k < toMeasurePartisipants[l].deleted.length;
                  k++
                ) {
                  let oneMsgTime = Number(toMeasurePartisipants[l].deleted[k])
                  for (let h = 0; h < allMsgsArray.length; h++) {
                    if (Number(allMsgsArray[h].time) > oneMsgTime) {
                      if (h <= curentLastSeen) {
                        numberToSendBack++
                        break
                      }
                    }
                  }
                  newPartisipants[l].deleted.shift()
                }
                chanell.partisipants = newPartisipants
                chanell.markModified("partisipants")
                await chanell.save()

                let oldUserChanells = user.chanellsList
                for (let j = 0; j < oldUserChanells.length; j++) {
                  if (
                    oldUserChanells[j].findname ==
                    allMsgsFromAllChatsToDelete[i].chatFindname
                  ) {
                    oldUserChanells[j].lastSeenMsg == String(numberToSendBack)
                  }
                  lastSeenCorrectionArray.push({
                    findname: allMsgsFromAllChatsToDelete[i].chatFindname,
                    number: numberToSendBack,
                    type: "chanell",
                  })
                }
              }
            }
          }
        }
        // console.log(lastSeenCorrectionArray)
        for (let n = 0; n < lastSeenCorrectionArray.length; n++) {
          if (lastSeenCorrectionArray[n].type == "chanell") {
            let oldUserChanells = structuredClone(user.chanellsList)
            for (let y = 0; y < oldUserChanells.length; y++) {
              if (
                oldUserChanells[y].findname ==
                lastSeenCorrectionArray[n].findname
              ) {
                oldUserChanells[y].lastSeenMsg = String(
                  Number(oldUserChanells[y].lastSeenMsg) -
                    lastSeenCorrectionArray[n].number
                )
                break
              }
            }
            user.chanellsList = oldUserChanells
            await user.save()
          }
        }
        let msgOfRemoval = {
          action: "removeDeleted",
          mainInfo: lastSeenCorrectionArray,
        }
        wss.clients?.forEach((client, index) => {
          // @ts-ignore
          if (client.findname == connection.findname) {
            // console.log(client.readyState)
            if (client.readyState == true) {
              client.send(JSON.stringify(msgOfRemoval))
            }
          }
        })
      }
      if (msg.action == "delete") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          const chanell = await Chanell.findOne({
            findname: msg.findname,
          })
          let arrayOfDeletedMsgTimesAndIndexes: any = [
            ...msg.mainInfo.arrayOfObj,
          ]
          let toDeleteArray: any = []
          let toDeleteArrayIndexes: any = []
          for (let i = 0; i < arrayOfDeletedMsgTimesAndIndexes.length; i++) {
            toDeleteArray.push(arrayOfDeletedMsgTimesAndIndexes[i].time)
            toDeleteArrayIndexes.push(arrayOfDeletedMsgTimesAndIndexes[i].index)
          }
          for (let i = 0; i < chanell.partisipants.length; i++) {
            if (chanell.partisipants[i].findname == userFindname) {
              if (chanell.partisipants[i].admin != "yes") {
                return
              } else {
                break
              }
            }
          }
          // chanell.lastUpdated = new Date().getTime().toString()
          // ЯКЩО ВИДАЛЕНО ОСТАННЄ ТО ЧАС МАЄ СТАТИ
          // ЯК ОСТАННЄ НЕ ДЕЛІТНУТЕ ПОВІДОМЛЕННЯ
          let arrayOfIndexes: number[] = []
          let quantity = 0
          let maxQuantity = toDeleteArray.length
          for (let j = 0; j < chanell.messages.length; ) {
            if (quantity == maxQuantity) {
              break
            }
            for (let u = 0; u < toDeleteArray.length; u++) {
              if (chanell.messages[j].time == toDeleteArray[u]) {
                arrayOfIndexes.push(j)
                quantity++
              }
            }
            j++
          }
          let oldChanellMessages = [...chanell.messages]
          for (let k = arrayOfIndexes.length - 1; k >= 0; k--) {
            oldChanellMessages.splice(arrayOfIndexes[k], 1)
          }
          chanell.messages = oldChanellMessages
          chanell.markModified("messages")
          await chanell.save()
          const allPartisipants = chanell.partisipants
          let allClientsToSendUpdate = []
          for (let i = 0; i < allPartisipants.length; i++) {
            // @ts-ignore
            if (allPartisipants[i].findname == userFindname) {
              continue
            }
            // @ts-ignore
            allClientsToSendUpdate.push(allPartisipants[i].findname)
          }
          let listOfClients: any = []
          let listOfActivePartisipants: any = []
          let listOfNotActivePartisipants: any = []
          wss.clients?.forEach((client: any, index) => {
            // @ts-ignore
            if (allClientsToSendUpdate.includes(client.findname)) {
              // console.log(client.readyState)
              if (client.readyState == true) {
                listOfActivePartisipants.push(client.findname)
                client.send(JSON.stringify(msg))
              } else {
                listOfNotActivePartisipants.push(client.findname)
              }
            }
            // else {
            //   if (client.findname != userFindname) {
            //     console.log("client.findname", client.findname)
            //     listOfClients.push(client.findname)
            //   }
            // }
          })
          for (let i = 0; i < allClientsToSendUpdate.length; i++) {
            if (!listOfActivePartisipants.includes(allClientsToSendUpdate[i])) {
              listOfNotActivePartisipants.push(allClientsToSendUpdate[i])
            }
          }
          let oldChanellPartisipants = [...chanell.partisipants]
          for (let i = 0; i < oldChanellPartisipants.length; i++) {
            if (
              listOfNotActivePartisipants.includes(
                oldChanellPartisipants[i].findname
              )
            ) {
              oldChanellPartisipants[i].deleted.push(...toDeleteArray)
            }
          }
          chanell.partisipants = oldChanellPartisipants
          chanell.markModified("partisipants")
          await chanell.save()
        }
      }
      if (msg.action == "edit") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          const chanell = await Chanell.findOne({
            findname: msg.findname,
          })

          for (let i = 0; i < chanell.partisipants.length; i++) {
            if (chanell.partisipants[i].findname == userFindname) {
              if (chanell.partisipants[i].admin != "yes") {
                return
              }
            }
          }
          for (let i = 0; i < chanell.messages.length; i++) {
            if (
              String(chanell.messages[i].time) ==
              String(msg.mainInfo.msgObjToEdit.time)
            ) {
              chanell.messages[i].comentary =
                msg.mainInfo.msgObjToEdit.currentEditTextInput
            }
          }
          chanell.markModified("messages")
          await chanell.save()

          const allPartisipants = chanell.partisipants
          let allClientsToSendUpdate = []
          for (let i = 0; i < allPartisipants.length; i++) {
            // @ts-ignore
            if (allPartisipants[i].findname == userFindname) {
              continue
            }
            // @ts-ignore
            allClientsToSendUpdate.push(allPartisipants[i].findname)
          }
          wss.clients?.forEach((client, index) => {
            // @ts-ignore
            if (allClientsToSendUpdate.includes(client.findname)) {
              // console.log(client.readyState)
              if (client.readyState == true) {
                client.send(JSON.stringify(msg))
              }
            }
          })
        }
      }
      if (msg.action == "mute") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          for (let index = 0; index < user.chanellsList.length; index++) {
            if (user.chanellsList[index].findname == msg.findname) {
              user.chanellsList[index].muted = msg.mainInfo.time
            }
          }
          user.markModified("chanellsList")
          await user.save()
        }
      }
      if (msg.action == "unmute") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          for (let index = 0; index < user.chanellsList.length; index++) {
            if (user.chanellsList[index].findname == msg.findname) {
              user.chanellsList[index].muted = "no"
            }
          }
          user.markModified("chanellsList")
          await user.save()
        }
      }
      if (msg.action == "changeSmile") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          const chanell = await Chanell.findOne({
            findname: msg.findname,
          })
          // for (let i = 0; i < chanell.partisipants.length; i++) {
          //   if (chanell.partisipants[i].findname == userFindname) {
          //     if (chanell.partisipants[i].admin != "yes") {
          //       return
          //     }
          //   }
          // }
          let countWay: any
          for (let i = 0; i < chanell.messages.length; i++) {
            if (String(chanell.messages[i].time) == String(msg.mainInfo.time)) {
              if (!msg.mainInfo.newEmotionArray.prevEmo.length) {
                chanell.messages[i].emotions.push({
                  name: msg.mainInfo.newEmotionArray.newEmo[0].name,
                  smile: msg.mainInfo.newEmotionArray.newEmo[0].smile,
                  users: [userFindname],
                  count: 1,
                })
              } else {
                if (!msg.mainInfo.newEmotionArray.newEmo.length) {
                  chanell.messages[i].emotions = []
                } else {
                  if (
                    msg.mainInfo.newEmotionArray.prevEmo.length <
                    msg.mainInfo.newEmotionArray.newEmo.length
                  ) {
                    chanell.messages[i].emotions.push({
                      name: msg.mainInfo.emotion.name,
                      smile: msg.mainInfo.emotion.smile,
                      users: [userFindname],
                      count: 1,
                    })
                    break
                  } else {
                    if (
                      msg.mainInfo.newEmotionArray.prevEmo.length >
                      msg.mainInfo.newEmotionArray.newEmo.length
                    ) {
                      for (
                        let index = 0;
                        index < chanell.messages[i].emotions.length;
                        index++
                      ) {
                        if (
                          chanell.messages[i].emotions[index].name ==
                          msg.mainInfo.emotion.name
                        ) {
                          chanell.messages[i].emotions.splice(index, 1)
                          break
                        }
                      }
                    } else {
                      if (
                        msg.mainInfo.newEmotionArray.prevEmo.length ==
                        msg.mainInfo.newEmotionArray.newEmo.length
                      ) {
                        for (
                          let index = 0;
                          index < chanell.messages[i].emotions.length;
                          index++
                        ) {
                          if (
                            chanell.messages[i].emotions[index].name ==
                            msg.mainInfo.emotion.name
                          ) {
                            for (
                              let aaaa = 0;
                              aaaa <
                              msg.mainInfo.newEmotionArray.prevEmo.length;
                              aaaa++
                            ) {
                              if (
                                msg.mainInfo.newEmotionArray.prevEmo[aaaa]
                                  .name == msg.mainInfo.emotion.name
                              ) {
                                for (
                                  let dddd = 0;
                                  dddd <
                                  msg.mainInfo.newEmotionArray.newEmo.length;
                                  dddd++
                                ) {
                                  if (
                                    msg.mainInfo.newEmotionArray.newEmo[dddd]
                                      .name == msg.mainInfo.emotion.name
                                  ) {
                                    if (
                                      Number(
                                        msg.mainInfo.newEmotionArray.prevEmo[
                                          aaaa
                                        ].count
                                      ) <
                                      Number(
                                        msg.mainInfo.newEmotionArray.newEmo[
                                          dddd
                                        ].count
                                      )
                                    ) {
                                      countWay = "increase"
                                    } else {
                                      countWay = "decrease"
                                    }
                                    break
                                  }
                                }
                                break
                              }
                            }
                            if (countWay == "decrease") {
                              chanell.messages[i].emotions[index].count--
                              let k =
                                chanell.messages[i].emotions[
                                  index
                                ].users.indexOf(userFindname)
                              if (k !== -1) {
                                chanell.messages[i].emotions[
                                  index
                                ].users.splice(k, 1)
                              }
                            } else {
                              chanell.messages[i].emotions[index].count++
                              chanell.messages[i].emotions[index].users.push(
                                userFindname
                              )
                            }
                            break
                          }
                        }
                      }
                    }
                  }
                }
              }
              break
            }
          }
          chanell.markModified("messages")
          await chanell.save()

          const allPartisipants = chanell.partisipants
          let allClientsToSendUpdate = []
          for (let i = 0; i < allPartisipants.length; i++) {
            // @ts-ignore
            if (allPartisipants[i].findname == userFindname) {
              continue
            }
            // @ts-ignore
            allClientsToSendUpdate.push(allPartisipants[i].findname)
          }
          wss.clients?.forEach((client, index) => {
            // @ts-ignore
            if (allClientsToSendUpdate.includes(client.findname)) {
              // console.log(client.readyState)
              if (client.readyState == true) {
                client.send(JSON.stringify(msg))
              }
            }
          })
        }
      }
      if (msg.action == "add") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          const chanell = await Chanell.findOne({
            findname: msg.findname,
          })
          for (let i = 0; i < chanell.partisipants.length; i++) {
            if (chanell.partisipants[i].findname == userFindname) {
              if (chanell.partisipants[i].admin != "yes") {
                return
              }
            }
          }
          chanell.lastUpdated = new Date().getTime().toString()
          chanell.messages.push(msg.mainInfo)
          await chanell.save()

          const allPartisipants = chanell.partisipants
          let allClientsToSendUpdate = []
          for (let i = 0; i < allPartisipants.length; i++) {
            // @ts-ignore
            if (allPartisipants[i].findname == userFindname) {
              continue
            }
            // @ts-ignore
            allClientsToSendUpdate.push(allPartisipants[i].findname)
          }
          // console.log(allClientsToSendUpdate)
          wss.clients?.forEach((client, index) => {
            // @ts-ignore
            if (allClientsToSendUpdate.includes(client.findname)) {
              // console.log(client.readyState)
              if (client.readyState == true) {
                client.send(JSON.stringify(msg))
              }
            }
          })
        }
      }
      if (msg.action == "lastSeen") {
        if (msg.type == "chanell") {
          const user = await User.findOne({
            findname: userFindname,
          })
          if (!user) {
            return
          }
          for (let i = 0; i < user.chanellsList.length; i++) {
            if (user.chanellsList[i].findname == msg.findname) {
              user.chanellsList[i].lastSeenMsg = msg.lastSeenMsg
              // let badas = [...user.chanellsList]
              // badas[i].lastSeenMsg = msg.lastSeenMsg
              // user.chanellsList = badas

              // await user.chanellsList.updateOne(
              //   { findname: userFindname },
              //   {
              //     $set: {
              //       chanellsList: badas,
              //     },
              //   },
              //   { session: null }
              // )
              user.markModified("chanellsList")
              await user.save()
              break
            }
          }
        }
      }
    } catch {
      ;(error) => {
        console.log(error)
        console.log("some error in msges")
      }
    }
  })

  connection.on("close", () => {
    // console.log("Connection closed")
  })
})
