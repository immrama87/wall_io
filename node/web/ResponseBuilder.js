var statusMap = require("./StatusMap");

var ResponseBuilder = (function(){
  var status = undefined,
      headers = {},
      message = undefined,
      bodyJson = {};

  function setStatus(_status){
    if(statusMap.hasOwnProperty(_status)){
      status = _status;

      if(!message)
        message = statusMap[_status];
    }
  }

  function setHeader(header, value){
    if(header && value)
      headers[header] = value;
  }

  function setMessage(_message){
    if(_message)
      message = _message;
  }

  function setBodyPart(key, value){
    if(key && value)
      bodyJson[key] = value;
  }

  function build(res){
    if(status == undefined){
      status = 500;
      message = "The response could not be finalized. No status value was set.";
    }

    if(message != undefined && Object.keys(bodyJson).length > 0){
      if(bodyJson.hasOwnProperty('message')){
        bodyJson._message = bodyJson.message;
      }

      bodyJson.message = message;
      message = undefined;
    }

    if(message == undefined){
      message = JSON.stringify(bodyJson);
    }

    for(header in headers){
      res.setHeader(header, headers[header]);
    }

    res.status(status).end(message);
  }

  return {
    setStatus: setStatus,
    setHeader: setHeader,
    setMessage: setMessage,
    setBodyPart: setBodyPart,
    build: build
  };
});

module.exports = ResponseBuilder;
