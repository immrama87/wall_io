requirejs.config({
  baseUrl: "wallCanvas",
  packages: [
    {
      name: "wallCanvas/API",
      location: "api",
      main: "index"
    },
    {
      name: "wallCanvas/Wall",
      location: "Wall",
      main: "index"
    },
    {
      name: "wallCanvas/Wall/Animations",
      location: "Wall/Animations",
      main: "index"
    },
    {
      name: "wallCanvas/Sticky",
      location: "Sticky",
      main: "index"
    }
  ]
});

require(["wallCanvas/API"], function(API){
  window.wallCanvas = {
    api: new API()
  };
});
