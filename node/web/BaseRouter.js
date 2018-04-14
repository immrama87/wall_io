const StaticRouter = require("./StaticRouter");

var Router = (function(express){
  var router = express.Router();

  router.all("*", function(req, res, next){
    req.url = req.originalUrl
    //TODO: Add session check

    next();
  });

  router.get("/", function(req, res, next){
    req.url = "/index.html";

    next();
  });

  router.use("**/*.*", new StaticRouter(express));

  return router;
});

module.exports = Router;
