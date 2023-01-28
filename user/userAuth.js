const settings = require("../settings.json");
var randomstring = require("randomstring");
var MongoClient = require("mongodb").MongoClient;
const requiredColumn = ["username", "password", "name", "plan"];
const field = ["username", "password", "name", "plan", "email"];

class Authentication {
  async register(req, res) {
    var data = req.body;
    var keys = Object.keys(data);
    for (let item in keys) {
      if (!field.includes(keys[item])) {
        res.send({ status: "error", data: "Invalid Field" });
      }
    }

    for (let item in requiredColumn) {
      if (!keys.includes(requiredColumn[item])) {
        res.send({ status: "error", data: "Missing required Field" });
      }
    }
    if (data.hasOwnProperty("username") && data.hasOwnProperty("password")) {
      try {
        var date = new Date();
        var totalData = settings.tableInitialize.map((type) => {
          return {
            username: req.body.username,
            type: type,
            total: 0,
            month: date.getMonth()
          };
        });
        console.log(totalData);
        const dbClient = await MongoClient.connect(settings.database);
        const dbo = dbClient.db(settings.dbName);
        const addedData = await dbo.collection("userDetail").insertOne(data);
        const total = await dbo.collection("total").insertMany(totalData);
        res.send({ status: "ok", data: "User Added" });
      } catch (err) {
        console.log(err);
        res.send({ status: "error", data: err });
      }
    } else {
      res.send({ status: "error", data: "Username and Password Required" });
    }
  }

  async login(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
      res.send({ status: "error", data: "Username or Password missing" });
    }
    const dbClient = await MongoClient.connect(settings.database);
    const dbo = dbClient.db(settings.dbName);
    var result = await dbo
      .collection("userDetail")
      .findOne({ username: username, password: password });
    if (result) {
      var token = randomstring.generate(15);
      var refreshToken = randomstring.generate(15);
      var expire = 2;
      var date = new Date();
      date.setHours(date.getHours() + expire);
      const tokenData = await dbo
        .collection("userToken")
        .insertOne({
          token: token,
          refreshToken: refreshToken,
          expireTime: date
        });
      res.send({
        status: "ok",
        data: {
          username: username,
          token: token,
          refreshToken: refreshToken,
          expireTime: date
        }
      });
    } else {
      res.send({ status: "error", data: "Invalid Cred" });
    }
  }