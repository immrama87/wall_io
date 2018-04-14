const path = require("path");
const fs = require("fs");
const mime_types = require("mime-types");
const ResponseBuilder = require("./ResponseBuilder");

var Router = (function(express){
  var router = express.Router();

  function serveFile(filepath, filename, res){
    var responseBuilder = new ResponseBuilder();
    if(!fs.existsSync(filepath)){
      responseBuilder.setStatus(404);
      responseBuilder.setMessage("The file " + filename + " could not be found.");
      responseBuilder.build(res);
    }
    else {
      fs.readFile(filepath, "utf8", function(err, file){
        if(err){
          responseBuilder.setStatus(500);
          responseBuilder.setMessage(err);
          responseBuilder.build(res);
        }
        else {
          responseBuilder.setStatus(200);
          responseBuilder.setMessage(file);
          responseBuilder.setHeader("Content-Type", mime_types.lookup(filename) || "text/plain");
          responseBuilder.build(res);
        }
      });
    }
  }

  router.get("*", function(req,res,next){
    req.url = req.originalUrl;
    next();
  });

  router.get("/", function(req,res,next){
    req.url = "index.html";
    next();
  });

  router.get(/^(?!\/node_modules)/, function(req,res,next){
    var ext = req.url.substring(req.url.lastIndexOf(".")+1);
    var filename = req.url.substring(req.url.lastIndexOf("/")+1);
    req.url = path.join("web", ext, req.url);
    next();
  });

  router.get("*", function(req,res){
    var filename = req.url.substring(req.url.lastIndexOf("/")+1);
    var filepath = path.join(__dirname, "..", "..", req.url);
    serveFile(filepath, filename, res);
  });

  return router;
});

module.exports = Router;
