const createError = require("http-errors")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../Models/User.model")
const clientId = require("../config/googleData").clientId
const clientSecreT = require("../config/googleData").clientSecret
const { OAuth2Client } = require("google-auth-library")
const dotenv = require("dotenv").config()
const nodemailer = require("nodemailer")
// const { google } = require("googleapis")
//module.exports = (passport) => {
//for passport
module.exports = {
  sendMail: async (req, res, next) => {
    try {
      function generateRandomNumber() {
        var minm = 1000
        var maxm = 9999
        return Math.floor(Math.random() * (maxm - minm + 1)) + minm
      }
      let newgencode = generateRandomNumber()
      // const oauth2Client = new google.auth.OAuth2(
      //   process.env.CLIENT_ID,
      //   process.env.CLIENT_SECRET,
      //   "https://developers.google.com/oauthplayground"
      // )

      // oauth2Client.setCredentials({
      //   refresh_token: process.env.REFRESH_TOKEN,
      // })

      // const accessToken = await new Promise((resolve, reject) => {
      //   oauth2Client.getAccessToken((err, token) => {
      //     if (err) {
      //       console.log("*ERR: ", err)
      //       reject()
      //     }
      //     resolve(token)
      //   })
      // })

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER_EMAIL,
          // accessToken,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
      })
      // req.body.to
      // andriy249h@gmail.com
      let mailOptions = {
        from: process.env.USER_EMAIL,
        to: req.body[0].to,
        // to: "andriy249h@gmail.com",
        // to: "livdima2002@gmail.com",
        // to: "karaulnekerell@gmail.com",
        subject: "Recovery password",
        // subject: "Точно не ТЦК",
        text: `Ur recovery code is: ${newgencode}`,
        // text: `Ви виграли два білети на Мадагаскар, вас очікують шалені пригоди від Містера Біста, і можливість прийняти участь в бомбезних змагання так би мовити не на життя, а на смерть.`,
        // attachments: [
        //   {
        //     path: "./media/NotPovistka.png",
        //   },
        // ],
      }
      await transporter.sendMail(mailOptions)
      const user = await User.findOne({
        email: req.body[0].to,
      })
      let date_ob = new Date()
      let date = ("0" + date_ob.getDate()).slice(-2)
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
      let year = date_ob.getFullYear()
      let hours = date_ob.getHours()
      let minutes = date_ob.getMinutes()
      let seconds = date_ob.getSeconds()
      let time =
        year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
      user.pinCodeVerifyString = `${newgencode} ${time}`
      await user.save()
      res.send("Awaiting code confirmation")
      return
    } catch (error) {
      console.error("ERROR: ", error)
    }
    next()
  },
  verify: async (req, res, next) => {
    try {
      const oAuth2Client = new OAuth2Client(
        process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
        process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_SECRET
      )

      const authHeader = req.headers["myauthprop"]
      const phoneNumber = req.headers["myphonenumber"]
      if (!authHeader) {
        next(createError.Unauthorized)
      }
      const token = authHeader
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (payload) {
        req.main_payload = payload
        // console.log(req.main_payload)
        res.userId = payload["sub"]
        req.phoneNumber = phoneNumber
        console.log(phoneNumber)
        console.log(req.phoneNumber)
        // res.send(payload)
        next()
      } else {
        next(createError.Unauthorized)
      }
    } catch (error) {
      console.log(error)
    }
  },
  // createOrLogin: async (req, res, next) => {
  //   username = req.username
  //   password = req.password
  //   let url = new URL(
  //     `${
  //       process.env.REACT_APP_SERVER_ENDPOINT
  //     }/users/check/:username/:password`
  //   )
  //   fetch(url, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       withCredentials: "true",
  //       "Access-Control-Allow-Origin": "*",
  //     },
  //   }).then(
  //     async (response) => {
  //       if (response.status === 200) {
  //         const resText = await response.text()
  //         if (resText === "User does not exist") {
  //           alert("User does not exist")
  //         } else {
  //           // document.cookie = `username=${data.username}; expires=Session; path=/;`
  //           // document.cookie = `password=${data.password}; expires=Session; path=/;`
  //           console.log(resText)
  //         }
  //       } else {
  //         alert("Server problem")
  //       }
  //     },
  //     function (error) {
  //       error.message //=> String
  //     }
  //   )
  // },

  //   passport.use(
  //     new GoogleStrategy(
  //       {
  //         clientID: clientId,
  //         clientSecret: clientSecreT,
  //         callbackURL: "https://image3-cqxc6u2isa-uc.a.run.app/google/callback",
  //       },
  //       (request, accessToken, refreshToken, profile, done) => {
  //         // find if a User exist with this email or not
  //         User.findOne({ email: profile.emails[0].value }).then(
  //           async (data) => {
  //             if (data) {
  //               // User exists
  //               // update data
  //               // I am skipping that part here, may Update Later
  //               return done(null, data)
  //             } else {
  //               // create a User
  //               try {
  //                 const user = new User({
  //                   username: profile.displayName,
  //                   email: profile.emails[0].value,
  //                   googleId: profile.id,
  //                   password: null,
  //                   provider: "google",
  //                   isVerified: true,
  //                   phoneNumber: "not provided",
  //                   cartList: [],
  //                   orderList: [],
  //                   buyHistory: "defPath",
  //                 })
  //                 const result = await user.save()
  //                 res.send(result.username)
  //               } catch (error) {
  //                 console.log(error.message)
  //                 if (error.name === "GoogleAuthError") {
  //                   next(createError(422, error.message))
  //                   return
  //                 }
  //                 next(error)
  //               }
  //             }
  //           }
  //         )
  //       }
  //     )
  //   )
  // passport.serializeUser(function (user, done) {
  //   done(null, user.id)
  // })

  // passport.deserializeUser(function (id, done) {
  //   User.findById(id, function (err, user) {
  //     done(err, user)
  //   })
  // })
}
