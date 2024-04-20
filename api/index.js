var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require("express");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var passport = require("passport");
var OAuth2Client = require("google-auth-library").OAuth2Client;
var cors = require("cors");
var dotenv = require("dotenv").config();
var MemoryStore = require("memorystore")(expressSession);
var WebSocketServer = require("ws").WebSocketServer;
var jwt = require("jsonwebtoken");
var User = require("../Models/User.model");
var Chanell = require("../Models/Chanell.model");
var app = express();
// "builds": [{ "src": "/index.js", "use": "@vercel/node" }],
app.get("/", function (req, res) {
    res.send("Express on Vercel");
});
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,withCredentials,Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers,myAuthProp,myPhoneNumber,chatLink,chatType ");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    res.setHeader("Access-Control-Max-Age", 7200);
    next();
});
// app.use(
//   cors()
//   // {
//   // origin: "*", змінив коли кукіси не сетались в браузері
//   // origin: "*",
//   // origin: true,
//   // credentials: true,
//   // }
// )
app.use(cookieParser("someSecret"));
// app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
    secret: "someSecret",
    resave: true,
    saveUninitialized: true,
    // setting the max age to longer duration
    // maxAge: 24 * 60 * 60 * 1000,
    store: new MemoryStore()
}));
// Initialize DB
require("./initDB")();
// const ProductRoute = require("./Routes/Product.route")
var UserRoute = require("../Routes/User.route");
// const CookieRoute = require("./Routes/Cookie.route")
var GoogleRoute = require("../Routes/Google.route");
// const ItemRoute = require("./Routes/Item.route")
// app.use("/cookies", CookieRoute)
app.use("/google", GoogleRoute);
// app.use("/products", ProductRoute)
app.use("/users", UserRoute);
// app.use("/items", ItemRoute)
app.use(passport.initialize());
app.use(passport.session());
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
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});
var PORT = process.env.PORT || 80;
var s = app.listen(PORT, function () {
    console.log("Server started on port " + PORT + "...");
});
function onSocketPreError(e) {
    console.log(e);
}
function onSocketPostError(e) {
    console.log(e);
}
var wss = new WebSocketServer({ noServer: true });
s.on("upgrade", function (req, socket, head) {
    socket.on("error", onSocketPreError);
    // perform auth
    if (!!req.headers["BadAuth"]) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
    }
    wss.handleUpgrade(req, socket, head, function (ws) {
        socket.removeListener("error", onSocketPreError);
        wss.emit("connection", ws, req);
    });
});
function verifyToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var decodedUserInfo, userInfoObj;
        return __generator(this, function (_a) {
            try {
                decodedUserInfo = jwt.verify(token, process.env.AUTH_TOKEN_KEY);
                userInfoObj = JSON.parse(decodedUserInfo.myobj);
                return [2 /*return*/, userInfoObj
                    // const user = await User.findOne({
                    //   email: userInfoObj.email,
                    // })
                ];
                // const user = await User.findOne({
                //   email: userInfoObj.email,
                // })
            }
            catch (error) {
                if (error.message === "jwt expired") {
                    //   wss.clients?.forEach((client) => {
                    //     if (client.readyState === WebSocket.OPEN) {
                    //       client.send({ error: "Token expired" })
                    //     }
                    //   })
                    //   console.log(error)
                    return [2 /*return*/, { token: "expired" }
                        // LOGIC FOR RELOGINING
                    ];
                    // LOGIC FOR RELOGINING
                }
                else {
                    // wss.clients?.forEach((client) => {
                    //   if (client.readyState === WebSocket.OPEN) {
                    //     client.send({ error: "Some token error" })
                    //   }
                    // })
                    return [2 /*return*/, { token: "bad" }];
                }
            }
            return [2 /*return*/];
        });
    });
}
wss.on("connection", function (connection, req) { return __awaiter(_this, void 0, void 0, function () {
    var cookies, tokenCookieString, i, oneCookieArray, auth_token, userObject;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection.on("error", onSocketPostError);
                cookies = req.headers.cookie;
                if (!cookies) return [3 /*break*/, 4];
                tokenCookieString = cookies.split(";");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < tokenCookieString.length)) return [3 /*break*/, 4];
                oneCookieArray = tokenCookieString[i].split("=");
                if (!(oneCookieArray[0].trim() == "auth_token")) return [3 /*break*/, 3];
                auth_token = oneCookieArray[1].trim();
                return [4 /*yield*/, verifyToken(auth_token)];
            case 2:
                userObject = _a.sent();
                connection.findname = userObject.findname;
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                connection.on("message", function (msg) { return __awaiter(_this, void 0, void 0, function () {
                    var userFindname, user, chanell, i, allPartisipants, allClientsToSendUpdate_1, i, _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 5, , 6]);
                                userFindname = connection.findname;
                                msg = JSON.parse(msg);
                                if (!(msg.type == "chanell")) return [3 /*break*/, 4];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname.findname
                                    })];
                            case 1:
                                user = _c.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 2:
                                chanell = _c.sent();
                                for (i = 0; i < chanell.partisipants.length; i++) {
                                    if (chanell.partisipants[i].findname == userFindname) {
                                        if (chanell.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                chanell.lastUpdated = new Date().getTime().toString();
                                chanell.messages.push(msg.newMessage);
                                return [4 /*yield*/, chanell.save()];
                            case 3:
                                _c.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_1 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    allClientsToSendUpdate_1.push(allPartisipants[i].findname);
                                }
                                // console.log(allClientsToSendUpdate)
                                (_b = wss.clients) === null || _b === void 0 ? void 0 : _b.forEach(function (client, index) {
                                    if (allClientsToSendUpdate_1.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _c.label = 4;
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                _a = _c.sent();
                                ;
                                (function (error) {
                                    console.log(error);
                                    console.log("some error in msges");
                                });
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
                connection.on("close", function () {
                    // console.log("Connection closed")
                });
                return [2 /*return*/];
        }
    });
}); });
