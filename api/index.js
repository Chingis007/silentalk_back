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
    var auth_token, userObject;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection.on("error", onSocketPostError);
                auth_token = req.url.slice(1);
                return [4 /*yield*/, verifyToken(auth_token)];
            case 1:
                userObject = _a.sent();
                connection.findname = userObject.findname;
                //     }
                //   }
                // }
                connection.on("message", function (msg) { return __awaiter(_this, void 0, void 0, function () {
                    var userFindname, user, numberToSendBack, allMsgsFromAllChatsToDelete, lastSeenCorrectionArray, i, chanell, newPartisipants, toMeasurePartisipants, curentLastSeen, p, l, allMsgsArray, k, oneMsgTime, h, oldUserChanells, j, n, oldUserChanells, y, msgOfRemoval_1, user, chanell, arrayOfDeletedMsgTimesAndIndexes, toDeleteArray, toDeleteArrayIndexes, i, i, arrayOfIndexes, quantity, maxQuantity, j, u, oldChanellMessages, k, allPartisipants, allClientsToSendUpdate_1, i, listOfClients, listOfActivePartisipants_1, listOfNotActivePartisipants_1, i, oldChanellPartisipants, i, user, chanell, i, i, allPartisipants, allClientsToSendUpdate_2, i, user, index, user, index, user, chanell, countWay, i, index, index, aaaa, dddd, k, allPartisipants, allClientsToSendUpdate_3, i, user, chanell, i, allPartisipants, allClientsToSendUpdate_4, i, user, i, _a;
                    var _b;
                    var _c, _d, _e, _f, _g;
                    return __generator(this, function (_h) {
                        switch (_h.label) {
                            case 0:
                                _h.trys.push([0, 42, , 43]);
                                userFindname = connection.findname;
                                msg = JSON.parse(msg);
                                if (!(msg.action == "removeDeleted")) return [3 /*break*/, 13];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 1:
                                user = _h.sent();
                                numberToSendBack = 0;
                                allMsgsFromAllChatsToDelete = msg.removeDeleted;
                                lastSeenCorrectionArray = [];
                                i = 0;
                                _h.label = 2;
                            case 2:
                                if (!(i < allMsgsFromAllChatsToDelete.length)) return [3 /*break*/, 8];
                                if (!(allMsgsFromAllChatsToDelete[i].chatType == "chanell")) return [3 /*break*/, 7];
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: allMsgsFromAllChatsToDelete[i].chatFindname
                                    })];
                            case 3:
                                chanell = _h.sent();
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
                                _h.label = 4;
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
                                _h.sent();
                                oldUserChanells = user.chanellsList;
                                for (j = 0; j < oldUserChanells.length; j++) {
                                    if (oldUserChanells[j].findname ==
                                        allMsgsFromAllChatsToDelete[i].chatFindname) {
                                        oldUserChanells[j].lastSeenMsg == String(numberToSendBack);
                                    }
                                    lastSeenCorrectionArray.push({
                                        findname: allMsgsFromAllChatsToDelete[i].chatFindname,
                                        number: numberToSendBack,
                                        type: "chanell"
                                    });
                                }
                                _h.label = 6;
                            case 6:
                                l++;
                                return [3 /*break*/, 4];
                            case 7:
                                i++;
                                return [3 /*break*/, 2];
                            case 8:
                                n = 0;
                                _h.label = 9;
                            case 9:
                                if (!(n < lastSeenCorrectionArray.length)) return [3 /*break*/, 12];
                                if (!(lastSeenCorrectionArray[n].type == "chanell")) return [3 /*break*/, 11];
                                oldUserChanells = structuredClone(user.chanellsList);
                                for (y = 0; y < oldUserChanells.length; y++) {
                                    if (oldUserChanells[y].findname ==
                                        lastSeenCorrectionArray[n].findname) {
                                        oldUserChanells[y].lastSeenMsg = String(Number(oldUserChanells[y].lastSeenMsg) -
                                            lastSeenCorrectionArray[n].number);
                                        break;
                                    }
                                }
                                user.chanellsList = oldUserChanells;
                                return [4 /*yield*/, user.save()];
                            case 10:
                                _h.sent();
                                _h.label = 11;
                            case 11:
                                n++;
                                return [3 /*break*/, 9];
                            case 12:
                                msgOfRemoval_1 = {
                                    action: "removeDeleted",
                                    mainInfo: lastSeenCorrectionArray
                                };
                                (_c = wss.clients) === null || _c === void 0 ? void 0 : _c.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (client.findname == connection.findname) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msgOfRemoval_1));
                                        }
                                    }
                                });
                                _h.label = 13;
                            case 13:
                                if (!(msg.action == "delete")) return [3 /*break*/, 18];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 18];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 14:
                                user = _h.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 15:
                                chanell = _h.sent();
                                arrayOfDeletedMsgTimesAndIndexes = __spreadArray([], msg.mainInfo.arrayOfObj, true);
                                toDeleteArray = [];
                                toDeleteArrayIndexes = [];
                                for (i = 0; i < arrayOfDeletedMsgTimesAndIndexes.length; i++) {
                                    toDeleteArray.push(arrayOfDeletedMsgTimesAndIndexes[i].time);
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
                                _h.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_1 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_1.push(allPartisipants[i].findname);
                                }
                                listOfClients = [];
                                listOfActivePartisipants_1 = [];
                                listOfNotActivePartisipants_1 = [];
                                (_d = wss.clients) === null || _d === void 0 ? void 0 : _d.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_1.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            listOfActivePartisipants_1.push(client.findname);
                                            client.send(JSON.stringify(msg));
                                        }
                                        else {
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
                                for (i = 0; i < allClientsToSendUpdate_1.length; i++) {
                                    if (!listOfActivePartisipants_1.includes(allClientsToSendUpdate_1[i])) {
                                        listOfNotActivePartisipants_1.push(allClientsToSendUpdate_1[i]);
                                    }
                                }
                                oldChanellPartisipants = __spreadArray([], chanell.partisipants, true);
                                for (i = 0; i < oldChanellPartisipants.length; i++) {
                                    if (listOfNotActivePartisipants_1.includes(oldChanellPartisipants[i].findname)) {
                                        (_b = oldChanellPartisipants[i].deleted).push.apply(_b, toDeleteArray);
                                    }
                                }
                                chanell.partisipants = oldChanellPartisipants;
                                chanell.markModified("partisipants");
                                return [4 /*yield*/, chanell.save()];
                            case 17:
                                _h.sent();
                                _h.label = 18;
                            case 18:
                                if (!(msg.action == "edit")) return [3 /*break*/, 22];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 22];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 19:
                                user = _h.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 20:
                                chanell = _h.sent();
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
                            case 21:
                                _h.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_2 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_2.push(allPartisipants[i].findname);
                                }
                                (_e = wss.clients) === null || _e === void 0 ? void 0 : _e.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_2.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _h.label = 22;
                            case 22:
                                if (!(msg.action == "mute")) return [3 /*break*/, 25];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 25];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 23:
                                user = _h.sent();
                                for (index = 0; index < user.chanellsList.length; index++) {
                                    if (user.chanellsList[index].findname == msg.findname) {
                                        user.chanellsList[index].muted = msg.mainInfo.time;
                                    }
                                }
                                user.markModified("chanellsList");
                                return [4 /*yield*/, user.save()];
                            case 24:
                                _h.sent();
                                _h.label = 25;
                            case 25:
                                if (!(msg.action == "unmute")) return [3 /*break*/, 28];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 28];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 26:
                                user = _h.sent();
                                for (index = 0; index < user.chanellsList.length; index++) {
                                    if (user.chanellsList[index].findname == msg.findname) {
                                        user.chanellsList[index].muted = "no";
                                    }
                                }
                                user.markModified("chanellsList");
                                return [4 /*yield*/, user.save()];
                            case 27:
                                _h.sent();
                                _h.label = 28;
                            case 28:
                                if (!(msg.action == "changeSmile")) return [3 /*break*/, 32];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 32];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 29:
                                user = _h.sent();
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
                                ];
                            case 30:
                                chanell = _h.sent();
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
                            case 31:
                                _h.sent();
                                allPartisipants = chanell.partisipants;
                                allClientsToSendUpdate_3 = [];
                                for (i = 0; i < allPartisipants.length; i++) {
                                    // @ts-ignore
                                    if (allPartisipants[i].findname == userFindname) {
                                        continue;
                                    }
                                    // @ts-ignore
                                    allClientsToSendUpdate_3.push(allPartisipants[i].findname);
                                }
                                (_f = wss.clients) === null || _f === void 0 ? void 0 : _f.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_3.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _h.label = 32;
                            case 32:
                                if (!(msg.action == "add")) return [3 /*break*/, 36];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 36];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 33:
                                user = _h.sent();
                                return [4 /*yield*/, Chanell.findOne({
                                        findname: msg.findname
                                    })];
                            case 34:
                                chanell = _h.sent();
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
                            case 35:
                                _h.sent();
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
                                // console.log(allClientsToSendUpdate)
                                (_g = wss.clients) === null || _g === void 0 ? void 0 : _g.forEach(function (client, index) {
                                    // @ts-ignore
                                    if (allClientsToSendUpdate_4.includes(client.findname)) {
                                        // console.log(client.readyState)
                                        if (client.readyState == true) {
                                            client.send(JSON.stringify(msg));
                                        }
                                    }
                                });
                                _h.label = 36;
                            case 36:
                                if (!(msg.action == "lastSeen")) return [3 /*break*/, 41];
                                if (!(msg.type == "chanell")) return [3 /*break*/, 41];
                                return [4 /*yield*/, User.findOne({
                                        findname: userFindname
                                    })];
                            case 37:
                                user = _h.sent();
                                if (!user) {
                                    return [2 /*return*/];
                                }
                                i = 0;
                                _h.label = 38;
                            case 38:
                                if (!(i < user.chanellsList.length)) return [3 /*break*/, 41];
                                if (!(user.chanellsList[i].findname == msg.findname)) return [3 /*break*/, 40];
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
                            case 39:
                                _h.sent();
                                return [3 /*break*/, 41];
                            case 40:
                                i++;
                                return [3 /*break*/, 38];
                            case 41: return [3 /*break*/, 43];
                            case 42:
                                _a = _h.sent();
                                ;
                                (function (error) {
                                    console.log(error);
                                    console.log("some error in msges");
                                });
                                return [3 /*break*/, 43];
                            case 43: return [2 /*return*/];
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
