const body_parser = require("body-parser");
const mime_types = require("mime-types");
const express = require("express");
const path = require("path");
const app = express();

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));

const BaseRouter = require("./node/web/BaseRouter");
app.use("*", new BaseRouter(express));

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
