var main = require("./main");
var cameraController = require("./cameraController");
var windows = require("sdk/windows").browserWindows;
var { setTimeout } = require("sdk/timers");

exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
  let camera = cameraController.new();
  let config = {
    addr:"10.0.0.1",
    port:10000,
    beep:false,
    version: "1.0",
    shootMode: "movie",
  };
  camera.setup(config);
  camera.getEvent(function(res){
    console.log(res)
    results = res["result"]
    for( var key in results ) {
      if(results[key] != null ){ 
        console.log(key, results[key], "\n");
      }
    }
  },"1.3");
  camera.getSchemeList();
  /*
  camera.setShootMode("movie");
  camera.getAvailableShootMode();
  camera.startMovieRec();
  camera.getEvent();
  setTimeout(function(){
    camera.stopMovieRec(function(res){
      console.log(res);
    })
  },5000);
  */

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
