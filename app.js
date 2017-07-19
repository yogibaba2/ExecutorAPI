var express= require("express");
http = require("http");
var bodyParser=require("body-parser");
var app=express();
const server = http.createServer(app);
const fileUpload = require('express-fileupload');

app.use(bodyParser.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var routes = require("./routes/routes.js")(app,server);

server.listen(3000,function(){
	console.log("Listening on port %s...", server.address().port);
});

