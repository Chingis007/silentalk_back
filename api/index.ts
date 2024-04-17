const express = require("express")
const cookieParser = require("cookie-parser")
const expressSession = require("express-session")
const passport = require("passport")
const { OAuth2Client } = require("google-auth-library")
const cors = require("cors")
const dotenv = require("dotenv").config()
const MemoryStore = require("memorystore")(expressSession)
const { WebSocketServer } = require("ws")
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
    "Access-Control-Allow-Origin,withCredentials,Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers,myAuthProp,myPhoneNumber"
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

function onSocketPreError(e: Error) {
  console.log(e)
}

function onSocketPostError(e: Error) {
  console.log(e)
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

wss.on("connection", (ws, req) => {
  ws.on("error", onSocketPostError)

  ws.on("message", (msg, isBinary) => {
    wss.clients?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg, { binary: isBinary })
      }
    })
  })

  ws.on("close", () => {
    console.log("Connection closed")
  })
})
