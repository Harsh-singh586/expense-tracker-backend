const express = require("express");

const app = express();

const { Authentication } = require("./user/userAuth");
var user = new Authentication();

app.post("/register", (req, res) => {
  user.register(req, res);
});

app.post("/login", (req, res) => {
  user.login(req, res);
});

app.listen(3000);