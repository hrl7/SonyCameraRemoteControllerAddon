var main = require("./main");
var cameraController = require("./cameraController");
var windows = require("sdk/windows").browserWindows;

exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
  let camera = cameraController.new();
  let config = {
    addr:"10.0.0.1",
    port:10000,
    beep:false,
    version: "1.0"
  };
  camera.setup(config);
  camera.setShootMode("movie");
  camera.getAvailableShootMode();
  camera.actTakePicture(function(res){
    console.log("Takepicture success");
    console.log(res);
  });
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  /*
  windows.open({
    url: "./controller.html",
    onOpen: function(window){
    }
  });
  */
};

require("sdk/test").run(exports);
