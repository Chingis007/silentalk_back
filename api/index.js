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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var express = require("express");
var mongoose = require("mongoose");
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
var Chat = require("../Models/Chat.model");
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
    console.log("onSocketPreError", e);
}
function onSocketPostError(e) {
    console.log("onSocketPostError", e);
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
    var auth_token, userObject, user, allClientsToSendUpdate_1, i, chanell, i, chat, msg_1, error_1;
    var _this = this;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                connection.on("error", onSocketPostError);
                auth_token = req.url.slice(1);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 13, , 14]);
                return [4 /*yield*/, verifyToken(auth_token)];
            case 2:
                userObject = _b.sent();
                connection.findname = userObject.findname;
                return [4 /*yield*/, User.findOne({
                        findname: connection.findname
                    })
                    // console.log(user)
                ];
            case 3:
                user = _b.sent();
                // console.log(user)
                user.lastOnline = "online";
                user.markModified("lastOnline");
                return [4 /*yield*/, user.save()
                    // @ts-ignore
                ];
            case 4:
                _b.sent();
                allClientsToSendUpdate_1 = [];
                i = 0;
                _b.label = 5;
            case 5:
                if (!(i < user.chanellsList.length)) return [3 /*break*/, 8];
                return [4 /*yield*/, Chanell.findOne({
                        findname: user.chanellsList[i].findname
                    })];
            case 6:
                chanell = _b.sent();
                chanell.partisipants.forEach(function (partisipant) {
                    if (partisipant.findname !== connection.findname) {
                        // @ts-ignore
                        if (!allClientsToSendUpdate_1.includes(partisipant.findname)) {
                            // @ts-ignore
                            allClientsToSendUpdate_1.push(partisipant.findname);
                        }
                    }
                });
                _b.label = 7;
            case 7:
                i++;
                return [3 /*break*/, 5];
            case 8:
                i = 0;
                _b.label = 9;
            case 9:
                if (!(i < user.chatsList.length)) return [3 /*break*/, 12];
                return [4 /*yield*/, Chat.findOne({
                        findname: user.chatsList[i].findname
                    })];
            case 10:
                chat = _b.sent();
                chat.partisipants.forEach(function (partisipant) {
                    if (partisipant.findname !== connection.findname) {
                        // @ts-ignore
                        if (!allClientsToSendUpdate_1.includes(partisipant.findname)) {
                            // @ts-ignore
                            allClientsToSendUpdate_1.push(partisipant.findname);
                        }
                    }
                });
                _b.label = 11;
            case 11:
                i++;
                return [3 /*break*/, 9];
            case 12:
                msg_1 = {
                    type: "online",
                    action: "online",
                    mainInfo: { findname: connection.findname, time: "online" }
                };
                (_a = wss.clients) === null || _a === void 0 ? void 0 : _a.forEach(function (client, index) {
                    // @ts-ignore
                    if (allClientsToSendUpdate_1.includes(client.findname)) {
                        // console.log(client.readyState)
                        if (client.readyState == true) {
                            client.send(JSON.stringify(msg_1));
                        }
                    }
                });
                return [3 /*break*/, 14];
            case 13:
                error_1 = _b.sent();
                console.log("fuck, error:", error_1);
                return [3 /*break*/, 14];
            case 14:
                connection.on("message", function (msg) { return __awaiter(_this, void 0, void 0, function () {
                    var userFindname, user, numberToSendBack, allMsgsFromAllChatsToDelete, lastSeenCorrectionArray, i, chanell, newPartisipants, toMeasurePartisipants, curentLastSeen, p, l, allMsgsArray, k, oneMsgTime, h, oldUserChanells, j, n, oldUserChanells, y, msgOfRemoval_1, user, chanell, arrayOfDeletedMsgTimesAndIndexes, toDeleteArray, toDeleteArrayIndexes, i, i, arrayOfIndexes, quantity, maxQuantity, j, u, oldChanellMessages, k, allPartisipants, allClientsToSendUpdate_2, i, listOfClients, listOfActivePartisipants_1, listOfNotActivePartisipants_1, i, oldChanellPartisipants, i, user, chat, arrayOfDeletedMsgTimesAndIndexes, toDeleteArray, toDeleteArrayIndexes, i, i, arrayOfIndexes, quantity, maxQuantity, j, u, oldchatMessages, k, allPartisipants, allClientsToSendUpdate_3, i, listOfClients, listOfActivePartisipants_2, listOfNotActivePartisipants_2, i, oldchatPartisipants, i, user, chanell, i, i, allPartisipants, allClientsToSendUpdate_4, i, user, chat, i, i, allPartisipants, allClientsToSendUpdate_5, i, user, chanell, i, i, allPartisipants, allClientsToSendUpdate_6, i, user, chat, i, i, allPartisipants, allClientsToSendUpdate_7, i, user, index, user, index, user, chanell, countWay, i, index, index, aaaa, dddd, k, allPartisipants, allClientsToSendUpdate_8, i, user, chat, countWay, i, index, index, aaaa, dddd, k, allPartisipants, allClientsToSendUpdate_9, i, user, chanell, i, allPartisipants, allClientsToSendUpdate_10, i, chat, i, allPartisipants, allClientsToSendUpdate_11, i, userSend, userRecieve, chat, newUserChatsList1, newUserChatsList2, allPartisipants, allClientsToSendUpdate_12, i, user, i, user, i, _a;
                    var _b, _c;
                    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                    return __generator(this, function (_r) {
                        switch (_r.label) {
                            case 0:
                                _r.trys.push([0, 77, , 78]);
                                userFindname = connection.findname;
                                msg = JSON.parse(msg);
                                if (!(msg.action == "removeDeleted")) return [3 /*break*/, 13];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 1:
                                user = _r.sent();
                                numberToSendBack = 0;
                                allMsgsFromAllChatsToDelete = msg.removeDeleted;
                                lastSeenCorrectionArray = 
                                // : {
                                //   findname: string
                                //   number: number
                                //   type: string
                                // }[]
                                [];
                                i = 0;
                                _r.label = 2;
                            case 2:
                                if (!(i < allMsgsFromAllChatsToDelete.length)) return [3 /*break*/, 8];
                                if (!(allMsgsFromAllChatsToDelete[i].chatType == "chanell")) return [3 /*break*/, 7];
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: allMsgsFromAllChatsToDelete[i].chatFindname
                                    })];
                            case 3:
                                chanell = _r.sent();
                                newPartisipants = structuredClone(chanell.partisipants);
                                toMeasurePartisipants = structuredClone(chanell.partisipants);
                                curentLastSeen = void 0;
                                for (p = 0; p < user.chanellsList.length; p++) {
                                    if (user.chanellsList[p].findname ==
                                        allMsgsFromAllChatsToDelete[i].chatFindname) {
                                        curentLastSeen = Number(user.chanellsList[p].lastSeenMsg);
                                    }
                                }
                                l = 0;
                                _r.label = 4;
                            case 4:
                                if (!(l < toMeasurePartisipants.length)) return [3 /*break*/, 7];
                                if (!(toMeasurePartisipants[l].findname == userFindname)) return [3 /*break*/, 6];
                                allMsgsArray = structuredClone(chanell.messages);
                                for (k = 0; k < toMeasurePartisipants[l].deleted.length; k++) {
                                    oneMsgTime = Number(toMeasurePartisipants[l].deleted[k]);
                                    for (h = 0; h < allMsgsArray.length; h++) {
                                        if (Number(allMsgsArray[h].time) > oneMsgTime) {
                                            if (h <= curentLastSeen) {
                                                numberToSendBack++;
                                                break;
                                            }
                                        }
                                    }
                                    newPartisipants[l].deleted.shift();
                                }
                                chanell.partisipants = newPartisipants;
                                chanell.markModified("partisipants");
                                return [4 /*yield*/, chanell.save()];
                            case 5:
                                _r.sent();
                                oldUserChanells = user.chanellsList;
                                for (j = 0; j < oldUserChanells.length; j++) {
                                    if (oldUserChanells[j].findname ==
                                        allMsgsFromAllChatsToDelete[i].chatFindname) {
                                        oldUserChanells[j].lastSeenMsg == String(numberToSendBack);
                                    }
                                    lastSeenCorrectionArray.push(
                                    // @ts-ignore
                                    {
                                        findname: allMsgsFromAllChatsToDelete[i].chatFindname,
                                        number: numberToSendBack,
                                        type: "chanell"
                                    });
                                }
                                _r.label = 6;
                            case 6:
                                l++;
                                return [3 /*break*/, 4];
                            case 7:
                                i++;
                                return [3 /*break*/, 2];
                            case 8:
                                n = 0;
                                _r.label = 9;
                            case 9:
                                if (!(n < lastSeenCorrectionArray.length)) return [3 /*break*/, 12];
                                if (!(lastSeenCorrectionArray[n].type == "chanell")) return [3 /*break*/, 11];
                                oldUserChanells = structuredClone(user.chanellsList);
                                for (y = 0; y < oldUserChanells.length; y++) {
                                    if (oldUserChanells[y].findname ==
                                        // @ts-ignore
                                        lastSeenCorrectionArray[n].findname) {
                                        oldUserChanells[y].lastSeenMsg = String(Number(oldUserChanells[y].lastSeenMsg) -
                                            // @ts-ignore
                                            lastSeenCorrectionArray[n].number);
                                        break;
                                    }
                                }
                                user.chanellsList = oldUserChanells;
                                return [4 /*yield*/, user.save()];
                            case 10:
                                _r.sent();
                                _r.label = 11;
                            case 11:
                                n++;
                                return [3 /*break*/, 9];
                            case 12:
                                msgOfRemoval_1 = {
                                    action: "removeDeleted",
                                    mainInfo: lastSeenCorrectionArray
                                };
                                (_d = wss.clients) === null || _d === void 0 ? void 0 : _d.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (client.findname == connection.findname) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msgOfRemoval_1));
                                        }
                                    }
                                });
                                _r.label = 13;
                            case 13:
                                if (!(msg.action == "delete")) return [3 /*break*/, 23];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 18];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 14:
                                user = _r.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })
                                    // @ts-ignore
                                ];
                            case 15:
                                chanell = _r.sent();
                                arrayOfDeletedMsgTimesAndIndexes = __spreadArray([], msg.mainInfo.arrayOfObj, true);
                                toDeleteArray = [];
                                toDeleteArrayIndexes = [];
                                for (i = 0; i < arrayOfDeletedMsgTimesAndIndexes.length; i++) {
                                    // @ts-ignore
                                    toDeleteArray.push(arrayOfDeletedMsgTimesAndIndexes[i].time);
                                    // @ts-ignore
                                    toDeleteArrayIndexes.push(arrayOfDeletedMsgTimesAndIndexes[i].index);
                                }
                                for (i = 0; i < chanell.partisipants.length; i++) {
                                    if (chanell.partisipants[i].findname == userFindname) {
                                        if (chanell.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                arrayOfIndexes = [];
                                quantity = 0;
                                maxQuantity = toDeleteArray.length;
                                for (j = 0; j < chanell.messages.length;) {
                                    if (quantity == maxQuantity) {
                                        break;
                                    }
                                    for (u = 0; u < toDeleteArray.length; u++) {
                                        if (chanell.messages[j].time == toDeleteArray[u]) {
                                            // @ts-ignore
                                            arrayOfIndexes.push(j);
                                            quantity++;
                                        }
                                    }
                                    j++;
                                }
                                oldChanellMessages = __spreadArray([], chanell.messages, true);
                                for (k = arrayOfIndexes.length - 1; k >= 0; k--) {
                                    oldChanellMessages.splice(arrayOfIndexes[k], 1);
                                }
                                chanell.messages = oldChanellMessages;
                                chanell.markModified("messages");
                                return [4 /*yield*/, chanell.save()];
                            case 16:
                                _r.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_2 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_2.push(allPartisipants[i].findname);
                                } // @ts-ignore
                                listOfClients = [];
                                listOfActivePartisipants_1 = [];
                                listOfNotActivePartisipants_1 = [];
                                // @ts-ignore
                                (_e = wss.clients) === null || _e === void 0 ? void 0 : _e.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_2.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            // @ts-ignore
                                            listOfActivePartisipants_1.push(client.findname);
                                            client.send(JSON.stringify(msg));
                                        }
                                        else {
                                            // @ts-ignore
                                            listOfNotActivePartisipants_1.push(client.findname);
                                        }
                                    }
                                    // else {
                                    //   if (client.findname != userFindname) {
                                    //     console.log("client.findname", client.findname)
                                    //     listOfClients.push(client.findname)
                                    //   }
                                    // }
                                });
                                for (i = 0; i < allClientsToSendUpdate_2.length; i++) {
                                    if (!listOfActivePartisipants_1.includes(allClientsToSendUpdate_2[i])) {
                                        listOfNotActivePartisipants_1.push(allClientsToSendUpdate_2[i]);
                                    }
                                }
                                oldChanellPartisipants = __spreadArray([], chanell.partisipants, true);
                                for (i = 0; i < oldChanellPartisipants.length; i++) {
                                    if (listOfNotActivePartisipants_1.includes(
                                    // @ts-ignore
                                    oldChanellPartisipants[i].findname)) {
                                        (_b = oldChanellPartisipants[i].deleted).push.apply(_b, toDeleteArray);
                                    }
                                }
                                chanell.partisipants = oldChanellPartisipants;
                                chanell.markModified("partisipants");
                                return [4 /*yield*/, chanell.save()];
                            case 17:
                                _r.sent();
                                _r.label = 18;
                            case 18:
                                if (!(msg.type == "chat")) return [3 /*break*/, 23];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 19:
                                user = _r.sent();
                                return [4 /*yield*/, Chat.findOne({
                                        findname: msg.findname
                                    })
                                    // @ts-ignore
                                ];
                            case 20:
                                chat = _r.sent();
                                arrayOfDeletedMsgTimesAndIndexes = __spreadArray([], msg.mainInfo.arrayOfObj, true);
                                toDeleteArray = [];
                                toDeleteArrayIndexes = [];
                                for (i = 0; i < arrayOfDeletedMsgTimesAndIndexes.length; i++) {
                                    // @ts-ignore
                                    toDeleteArray.push(arrayOfDeletedMsgTimesAndIndexes[i].time);
                                    // @ts-ignore
                                    toDeleteArrayIndexes.push(arrayOfDeletedMsgTimesAndIndexes[i].index);
                                }
                                for (i = 0; i < chat.partisipants.length; i++) {
                                    if (chat.partisipants[i].findname == userFindname) {
                                        if (chat.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                arrayOfIndexes = [];
                                quantity = 0;
                                maxQuantity = toDeleteArray.length;
                                for (j = 0; j < chat.messages.length;) {
                                    if (quantity == maxQuantity) {
                                        break;
                                    }
                                    for (u = 0; u < toDeleteArray.length; u++) {
                                        if (chat.messages[j].time == toDeleteArray[u]) {
                                            // @ts-ignore
                                            arrayOfIndexes.push(j);
                                            quantity++;
                                        }
                                    }
                                    j++;
                                }
                                oldchatMessages = __spreadArray([], chat.messages, true);
                                for (k = arrayOfIndexes.length - 1; k >= 0; k--) {
                                    oldchatMessages.splice(arrayOfIndexes[k], 1);
                                }
                                chat.messages = oldchatMessages;
                                chat.markModified("messages");
                                return [4 /*yield*/, chat.save()];
                            case 21:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_3 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_3.push(allPartisipants[i].findname);
                                } // @ts-ignore
                                listOfClients = [];
                                listOfActivePartisipants_2 = [];
                                listOfNotActivePartisipants_2 = [];
                                // @ts-ignore
                                (_f = wss.clients) === null || _f === void 0 ? void 0 : _f.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_3.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            // @ts-ignore
                                            listOfActivePartisipants_2.push(client.findname);
                                            client.send(JSON.stringify(msg));
                                        }
                                        else {
                                            // @ts-ignore
                                            listOfNotActivePartisipants_2.push(client.findname);
                                        }
                                    }
                                    // else {
                                    //   if (client.findname != userFindname) {
                                    //     console.log("client.findname", client.findname)
                                    //     listOfClients.push(client.findname)
                                    //   }
                                    // }
                                });
                                for (i = 0; i < allClientsToSendUpdate_3.length; i++) {
                                    if (!listOfActivePartisipants_2.includes(allClientsToSendUpdate_3[i])) {
                                        listOfNotActivePartisipants_2.push(allClientsToSendUpdate_3[i]);
                                    }
                                }
                                oldchatPartisipants = __spreadArray([], chat.partisipants, true);
                                for (i = 0; i < oldchatPartisipants.length; i++) {
                                    if (listOfNotActivePartisipants_2.includes(
                                    // @ts-ignore
                                    oldchatPartisipants[i].findname)) {
                                        (_c = oldchatPartisipants[i].deleted).push.apply(_c, toDeleteArray);
                                    }
                                }
                                chat.partisipants = oldchatPartisipants;
                                chat.markModified("partisipants");
                                return [4 /*yield*/, chat.save()];
                            case 22:
                                _r.sent();
                                _r.label = 23;
                            case 23:
                                if (!(msg.action == "edit")) return [3 /*break*/, 31];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 27];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 24:
                                user = _r.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 25:
                                chanell = _r.sent();
                                for (i = 0; i < chanell.partisipants.length; i++) {
                                    if (chanell.partisipants[i].findname == userFindname) {
                                        if (chanell.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                for (i = 0; i < chanell.messages.length; i++) {
                                    if (String(chanell.messages[i].time) ==
                                        String(msg.mainInfo.msgObjToEdit.time)) {
                                        chanell.messages[i].comentary =
                                            msg.mainInfo.msgObjToEdit.currentEditTextInput;
                                    }
                                }
                                chanell.markModified("messages");
                                return [4 /*yield*/, chanell.save()];
                            case 26:
                                _r.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_4 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_4.push(allPartisipants[i].findname);
                                }
                                (_g = wss.clients) === null || _g === void 0 ? void 0 : _g.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_4.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 27;
                            case 27:
                                if (!(msg.type == "chat")) return [3 /*break*/, 31];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 28:
                                user = _r.sent();
                                return [4 /*yield*/, Chat.findOne({
                                        findname: msg.findname
                                    })];
                            case 29:
                                chat = _r.sent();
                                for (i = 0; i < chat.partisipants.length; i++) {
                                    if (chat.partisipants[i].findname == userFindname) {
                                        if (chat.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                for (i = 0; i < chat.messages.length; i++) {
                                    if (String(chat.messages[i].time) ==
                                        String(msg.mainInfo.msgObjToEdit.time)) {
                                        chat.messages[i].comentary =
                                            msg.mainInfo.msgObjToEdit.currentEditTextInput;
                                    }
                                }
                                chat.markModified("messages");
                                return [4 /*yield*/, chat.save()];
                            case 30:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_5 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_5.push(allPartisipants[i].findname);
                                }
                                (_h = wss.clients) === null || _h === void 0 ? void 0 : _h.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_5.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 31;
                            case 31:
                                if (!(msg.action == "pin")) return [3 /*break*/, 39];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 35];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 32:
                                user = _r.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 33:
                                chanell = _r.sent();
                                for (i = 0; i < chanell.partisipants.length; i++) {
                                    if (chanell.partisipants[i].findname == userFindname) {
                                        if (chanell.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                for (i = 0; i < chanell.messages.length; i++) {
                                    if (String(chanell.messages[i].time) ==
                                        String(msg.mainInfo.msgObjToPin.time)) {
                                        chanell.messages[i].pinned = !chanell.messages[i].pinned;
                                    }
                                }
                                chanell.markModified("messages");
                                return [4 /*yield*/, chanell.save()];
                            case 34:
                                _r.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_6 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_6.push(allPartisipants[i].findname);
                                }
                                (_j = wss.clients) === null || _j === void 0 ? void 0 : _j.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_6.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 35;
                            case 35:
                                if (!(msg.type == "chat")) return [3 /*break*/, 39];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 36:
                                user = _r.sent();
                                return [4 /*yield*/, Chat.findOne({
                                        findname: msg.findname
                                    })];
                            case 37:
                                chat = _r.sent();
                                for (i = 0; i < chat.partisipants.length; i++) {
                                    if (chat.partisipants[i].findname == userFindname) {
                                        if (chat.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                for (i = 0; i < chat.messages.length; i++) {
                                    if (String(chat.messages[i].time) ==
                                        String(msg.mainInfo.msgObjToPin.time)) {
                                        chat.messages[i].pinned = !chat.messages[i].pinned;
                                    }
                                }
                                chat.markModified("messages");
                                return [4 /*yield*/, chat.save()];
                            case 38:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_7 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_7.push(allPartisipants[i].findname);
                                }
                                (_k = wss.clients) === null || _k === void 0 ? void 0 : _k.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_7.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 39;
                            case 39:
                                if (!(msg.action == "mute")) return [3 /*break*/, 42];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 42];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 40:
                                user = _r.sent();
                                for (index = 0; index < user.chanellsList.length; index++) {
                                    if (user.chanellsList[index].findname == msg.findname) {
                                        user.chanellsList[index].muted = msg.mainInfo.time;
                                    }
                                }
                                user.markModified("chanellsList");
                                return [4 /*yield*/, user.save()];
                            case 41:
                                _r.sent();
                                _r.label = 42;
                            case 42:
                                if (!(msg.action == "unmute")) return [3 /*break*/, 45];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 45];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 43:
                                user = _r.sent();
                                for (index = 0; index < user.chanellsList.length; index++) {
                                    if (user.chanellsList[index].findname == msg.findname) {
                                        user.chanellsList[index].muted = "no";
                                    }
                                }
                                user.markModified("chanellsList");
                                return [4 /*yield*/, user.save()];
                            case 44:
                                _r.sent();
                                _r.label = 45;
                            case 45:
                                if (!(msg.action == "changeSmile")) return [3 /*break*/, 53];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 49];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 46:
                                user = _r.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })
                                    // for (let i = 0; i < chanell.partisipants.length; i++) {
                                    //   if (chanell.partisipants[i].findname == userFindname) {
                                    //     if (chanell.partisipants[i].admin != "yes") {
                                    //       return
                                    //     }
                                    //   }
                                    // }
                                    // @ts-ignore
                                ];
                            case 47:
                                chanell = _r.sent();
                                countWay = void 0;
                                for (i = 0; i < chanell.messages.length; i++) {
                                    if (String(chanell.messages[i].time) == String(msg.mainInfo.time)) {
                                        if (!msg.mainInfo.newEmotionArray.prevEmo.length) {
                                            chanell.messages[i].emotions.push({
                                                name: msg.mainInfo.newEmotionArray.newEmo[0].name,
                                                smile: msg.mainInfo.newEmotionArray.newEmo[0].smile,
                                                users: [userFindname],
                                                count: 1
                                            });
                                        }
                                        else {
                                            if (!msg.mainInfo.newEmotionArray.newEmo.length) {
                                                chanell.messages[i].emotions = [];
                                            }
                                            else {
                                                if (msg.mainInfo.newEmotionArray.prevEmo.length <
                                                    msg.mainInfo.newEmotionArray.newEmo.length) {
                                                    chanell.messages[i].emotions.push({
                                                        name: msg.mainInfo.emotion.name,
                                                        smile: msg.mainInfo.emotion.smile,
                                                        users: [userFindname],
                                                        count: 1
                                                    });
                                                    break;
                                                }
                                                else {
                                                    if (msg.mainInfo.newEmotionArray.prevEmo.length >
                                                        msg.mainInfo.newEmotionArray.newEmo.length) {
                                                        for (index = 0; index < chanell.messages[i].emotions.length; index++) {
                                                            if (chanell.messages[i].emotions[index].name ==
                                                                msg.mainInfo.emotion.name) {
                                                                chanell.messages[i].emotions.splice(index, 1);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (msg.mainInfo.newEmotionArray.prevEmo.length ==
                                                            msg.mainInfo.newEmotionArray.newEmo.length) {
                                                            for (index = 0; index < chanell.messages[i].emotions.length; index++) {
                                                                if (chanell.messages[i].emotions[index].name ==
                                                                    msg.mainInfo.emotion.name) {
                                                                    for (aaaa = 0; aaaa <
                                                                        msg.mainInfo.newEmotionArray.prevEmo.length; aaaa++) {
                                                                        if (msg.mainInfo.newEmotionArray.prevEmo[aaaa]
                                                                            .name == msg.mainInfo.emotion.name) {
                                                                            for (dddd = 0; dddd <
                                                                                msg.mainInfo.newEmotionArray.newEmo.length; dddd++) {
                                                                                if (msg.mainInfo.newEmotionArray.newEmo[dddd]
                                                                                    .name == msg.mainInfo.emotion.name) {
                                                                                    if (Number(msg.mainInfo.newEmotionArray.prevEmo[aaaa].count) <
                                                                                        Number(msg.mainInfo.newEmotionArray.newEmo[dddd].count)) {
                                                                                        countWay = "increase";
                                                                                    }
                                                                                    else {
                                                                                        countWay = "decrease";
                                                                                    }
                                                                                    break;
                                                                                }
                                                                            }
                                                                            break;
                                                                        }
                                                                    }
                                                                    if (countWay == "decrease") {
                                                                        chanell.messages[i].emotions[index].count--;
                                                                        k = chanell.messages[i].emotions[index].users.indexOf(userFindname);
                                                                        if (k !== -1) {
                                                                            chanell.messages[i].emotions[index].users.splice(k, 1);
                                                                        }
                                                                    }
                                                                    else {
                                                                        chanell.messages[i].emotions[index].count++;
                                                                        chanell.messages[i].emotions[index].users.push(userFindname);
                                                                    }
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                                chanell.markModified("messages");
                                return [4 /*yield*/, chanell.save()];
                            case 48:
                                _r.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_8 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_8.push(allPartisipants[i].findname);
                                }
                                (_l = wss.clients) === null || _l === void 0 ? void 0 : _l.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_8.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 49;
                            case 49:
                                if (!(msg.type == "chat")) return [3 /*break*/, 53];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 50:
                                user = _r.sent();
                                return [4 /*yield*/, Chat.findOne({
                                        findname: msg.findname
                                    })
                                    // for (let i = 0; i < chanell.partisipants.length; i++) {
                                    //   if (chanell.partisipants[i].findname == userFindname) {
                                    //     if (chanell.partisipants[i].admin != "yes") {
                                    //       return
                                    //     }
                                    //   }
                                    // }
                                    // @ts-ignore
                                ];
                            case 51:
                                chat = _r.sent();
                                countWay = void 0;
                                for (i = 0; i < chat.messages.length; i++) {
                                    if (String(chat.messages[i].time) == String(msg.mainInfo.time)) {
                                        if (!msg.mainInfo.newEmotionArray.prevEmo.length) {
                                            chat.messages[i].emotions.push({
                                                name: msg.mainInfo.newEmotionArray.newEmo[0].name,
                                                smile: msg.mainInfo.newEmotionArray.newEmo[0].smile,
                                                users: [userFindname],
                                                count: 1
                                            });
                                        }
                                        else {
                                            if (!msg.mainInfo.newEmotionArray.newEmo.length) {
                                                chat.messages[i].emotions = [];
                                            }
                                            else {
                                                if (msg.mainInfo.newEmotionArray.prevEmo.length <
                                                    msg.mainInfo.newEmotionArray.newEmo.length) {
                                                    chat.messages[i].emotions.push({
                                                        name: msg.mainInfo.emotion.name,
                                                        smile: msg.mainInfo.emotion.smile,
                                                        users: [userFindname],
                                                        count: 1
                                                    });
                                                    break;
                                                }
                                                else {
                                                    if (msg.mainInfo.newEmotionArray.prevEmo.length >
                                                        msg.mainInfo.newEmotionArray.newEmo.length) {
                                                        for (index = 0; index < chat.messages[i].emotions.length; index++) {
                                                            if (chat.messages[i].emotions[index].name ==
                                                                msg.mainInfo.emotion.name) {
                                                                chat.messages[i].emotions.splice(index, 1);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (msg.mainInfo.newEmotionArray.prevEmo.length ==
                                                            msg.mainInfo.newEmotionArray.newEmo.length) {
                                                            for (index = 0; index < chat.messages[i].emotions.length; index++) {
                                                                if (chat.messages[i].emotions[index].name ==
                                                                    msg.mainInfo.emotion.name) {
                                                                    for (aaaa = 0; aaaa <
                                                                        msg.mainInfo.newEmotionArray.prevEmo.length; aaaa++) {
                                                                        if (msg.mainInfo.newEmotionArray.prevEmo[aaaa]
                                                                            .name == msg.mainInfo.emotion.name) {
                                                                            for (dddd = 0; dddd <
                                                                                msg.mainInfo.newEmotionArray.newEmo.length; dddd++) {
                                                                                if (msg.mainInfo.newEmotionArray.newEmo[dddd]
                                                                                    .name == msg.mainInfo.emotion.name) {
                                                                                    if (Number(msg.mainInfo.newEmotionArray.prevEmo[aaaa].count) <
                                                                                        Number(msg.mainInfo.newEmotionArray.newEmo[dddd].count)) {
                                                                                        countWay = "increase";
                                                                                    }
                                                                                    else {
                                                                                        countWay = "decrease";
                                                                                    }
                                                                                    break;
                                                                                }
                                                                            }
                                                                            break;
                                                                        }
                                                                    }
                                                                    if (countWay == "decrease") {
                                                                        chat.messages[i].emotions[index].count--;
                                                                        k = chat.messages[i].emotions[index].users.indexOf(userFindname);
                                                                        if (k !== -1) {
                                                                            chat.messages[i].emotions[index].users.splice(k, 1);
                                                                        }
                                                                    }
                                                                    else {
                                                                        chat.messages[i].emotions[index].count++;
                                                                        chat.messages[i].emotions[index].users.push(userFindname);
                                                                    }
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                                chat.markModified("messages");
                                return [4 /*yield*/, chat.save()];
                            case 52:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_9 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_9.push(allPartisipants[i].findname);
                                }
                                (_m = wss.clients) === null || _m === void 0 ? void 0 : _m.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_9.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 53;
                            case 53:
                                if (!(msg.action == "add")) return [3 /*break*/, 60];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 57];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 54:
                                user = _r.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 55:
                                chanell = _r.sent();
                                for (i = 0; i < chanell.partisipants.length; i++) {
                                    if (chanell.partisipants[i].findname == userFindname) {
                                        if (chanell.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                chanell.lastUpdated = new Date().getTime().toString();
                                chanell.messages.push(msg.mainInfo);
                                return [4 /*yield*/, chanell.save()];
                            case 56:
                                _r.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_10 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_10.push(allPartisipants[i].findname);
                                }
                                // console.log(allClientsToSendUpdate)
                                (_o = wss.clients) === null || _o === void 0 ? void 0 : _o.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_10.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 57;
                            case 57:
                                if (!(msg.type == "chat")) return [3 /*break*/, 60];
                                return [4 /*yield*/, Chat.findOne({
                                        findname: msg.findname
                                    })];
                            case 58:
                                chat = _r.sent();
                                for (i = 0; i < chat.partisipants.length; i++) {
                                    if (chat.partisipants[i].findname == userFindname) {
                                        if (chat.partisipants[i].admin != "yes") {
                                            return [2 /*return*/];
                                        }
                                    }
                                }
                                chat.lastUpdated = new Date().getTime().toString();
                                chat.messages.push(msg.mainInfo);
                                return [4 /*yield*/, chat.save()];
                            case 59:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_11 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_11.push(allPartisipants[i].findname);
                                }
                                // console.log(allClientsToSendUpdate)
                                (_p = wss.clients) === null || _p === void 0 ? void 0 : _p.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_11.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 60;
                            case 60:
                                if (!(msg.action == "addNew")) return [3 /*break*/, 66];
                                if (!(msg.type == "chat")) return [3 /*break*/, 66];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 61:
                                userSend = _r.sent();
                                return [4 /*yield*/, User.findOne({
                                        findname: msg.reciever
                                    })];
                            case 62:
                                userRecieve = _r.sent();
                                chat = new Chat({
                                    group: "chat",
                                    findname: "".concat(userFindname).concat(msg.reciever),
                                    partisipants: [
                                        {
                                            admin: "yes",
                                            findname: userFindname,
                                            deleted: []
                                        },
                                        {
                                            admin: "yes",
                                            findname: msg.reciever,
                                            deleted: []
                                        },
                                    ],
                                    messages: [msg.mainInfo],
                                    lastUpdated: new Date().getTime().toString()
                                });
                                return [4 /*yield*/, chat.save()];
                            case 63:
                                _r.sent();
                                newUserChatsList1 = __spreadArray([], userSend.chatsList, true);
                                newUserChatsList1.push({
                                    photoLink: userRecieve.photoLink,
                                    userFindname: msg.reciever,
                                    username: msg.reciever,
                                    findname: "".concat(userFindname).concat(msg.reciever),
                                    archived: "no",
                                    muted: "no",
                                    pinned: "no",
                                    lastSeenMsg: "1"
                                });
                                userSend.chatsList = newUserChatsList1;
                                return [4 /*yield*/, userSend.save()];
                            case 64:
                                _r.sent();
                                newUserChatsList2 = __spreadArray([], userRecieve.chatsList, true);
                                newUserChatsList2.push({
                                    photoLink: userSend.photoLink,
                                    userFindname: userFindname,
                                    username: userFindname,
                                    findname: "".concat(userFindname).concat(msg.reciever),
                                    archived: "no",
                                    muted: "no",
                                    pinned: "no",
                                    lastSeenMsg: "0"
                                });
                                msg.photoLink = userSend.photoLink;
                                msg.username = userSend.username;
                                msg.userFindname = userSend.findname;
                                userRecieve.chatsList = newUserChatsList2;
                                return [4 /*yield*/, userRecieve.save()];
                            case 65:
                                _r.sent();
                                allPartisipants = chat.partisipants;
                                allClientsToSendUpdate_12 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_12.push(allPartisipants[i].findname);
                                }
                                // console.log(allClientsToSendUpdate)
                                (_q = wss.clients) === null || _q === void 0 ? void 0 : _q.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_12.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _r.label = 66;
                            case 66:
                                if (!(msg.action == "lastSeen")) return [3 /*break*/, 76];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 71];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 67:
                                user = _r.sent();
                                if (!user) {
                                    return [2 /*return*/];
                                }
                                i = 0;
                                _r.label = 68;
                            case 68:
                                if (!(i < user.chanellsList.length)) return [3 /*break*/, 71];
                                if (!(user.chanellsList[i].findname == msg.findname)) return [3 /*break*/, 70];
                                user.chanellsList[i].lastSeenMsg = msg.lastSeenMsg;
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
                                user.markModified("chanellsList");
                                return [4 /*yield*/, user.save()];
                            case 69:
                                _r.sent();
                                return [3 /*break*/, 71];
                            case 70:
                                i++;
                                return [3 /*break*/, 68];
                            case 71:
                                if (!(msg.type == "chat")) return [3 /*break*/, 76];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 72:
                                user = _r.sent();
                                if (!user) {
                                    return [2 /*return*/];
                                }
                                i = 0;
                                _r.label = 73;
                            case 73:
                                if (!(i < user.chatsList.length)) return [3 /*break*/, 76];
                                if (!(user.chatsList[i].findname == msg.findname)) return [3 /*break*/, 75];
                                user.chatsList[i].lastSeenMsg = msg.lastSeenMsg;
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
                                user.markModified("chatsList");
                                return [4 /*yield*/, user.save()];
                            case 74:
                                _r.sent();
                                return [3 /*break*/, 76];
                            case 75:
                                i++;
                                return [3 /*break*/, 73];
                            case 76: return [3 /*break*/, 78];
                            case 77:
                                _a = _r.sent();
                                ;
                                (function (error) {
                                    console.log(error);
                                    console.log("some error in msges");
                                });
                                return [3 /*break*/, 78];
                            case 78: return [2 /*return*/];
                        }
                    });
                }); });
                connection.on("close", function () { return __awaiter(_this, void 0, void 0, function () {
                    var user, allClientsToSendUpdate_13, i, chanell, i, chat, msg_2, error_2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 11, , 12]);
                                return [4 /*yield*/, User.findOne({
                                        findname: connection.findname
                                    })];
                            case 1:
                                user = _b.sent();
                                user.lastOnline = new Date().getTime().toString();
                                user.markModified("lastOnline");
                                return [4 /*yield*/, user.save()
                                    // @ts-ignore
                                ];
                            case 2:
                                _b.sent();
                                allClientsToSendUpdate_13 = [];
                                i = 0;
                                _b.label = 3;
                            case 3:
                                if (!(i < user.chanellsList.length)) return [3 /*break*/, 6];
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: user.chanellsList[i].findname
                                    })];
                            case 4:
                                chanell = _b.sent();
                                chanell.partisipants.forEach(function (partisipant) {
                                    if (partisipant.findname !== connection.findname) {
                                        // @ts-ignore
                                        if (!allClientsToSendUpdate_13.includes(partisipant.findname)) {
                                            // @ts-ignore
                                            allClientsToSendUpdate_13.push(partisipant.findname);
                                        }
                                    }
                                });
                                _b.label = 5;
                            case 5:
                                i++;
                                return [3 /*break*/, 3];
                            case 6:
                                i = 0;
                                _b.label = 7;
                            case 7:
                                if (!(i < user.chatsList.length)) return [3 /*break*/, 10];
                                return [4 /*yield*/, Chat.findOne({
                                        findname: user.chatsList[i].findname
                                    })];
                            case 8:
                                chat = _b.sent();
                                chat.partisipants.forEach(function (partisipant) {
                                    if (partisipant.findname !== connection.findname) {
                                        // @ts-ignore
                                        if (!allClientsToSendUpdate_13.includes(partisipant.findname)) {
                                            // @ts-ignore
                                            allClientsToSendUpdate_13.push(partisipant.findname);
                                        }
                                    }
                                });
                                _b.label = 9;
                            case 9:
                                i++;
                                return [3 /*break*/, 7];
                            case 10:
                                msg_2 = {
                                    type: "online",
                                    action: "online",
                                    mainInfo: {
                                        findname: connection.findname,
                                        time: new Date().getTime().toString()
                                    }
                                };
                                (_a = wss.clients) === null || _a === void 0 ? void 0 : _a.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_13.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg_2));
                                        }
                                    }
                                });
                                return [3 /*break*/, 12];
                            case 11:
                                error_2 = _b.sent();
                                return [3 /*break*/, 12];
                            case 12: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
