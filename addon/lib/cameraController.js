function init(e) {
  var sonycameracontroller = {

    zoomIn : function  (listener){
               sonycameracontroller.execute("actZoom",["in","1shot"],10,listener);
             },

    zoomOut : function (listener){
                sonycameracontroller.execute("actZoom",["out","1shot"],10,listener);
              },

    zoomOutAll : function (listener){
                   sonycameracontroller.execute("actZoom",["out","start"],10,listener);
                 },

    take : function  (listener) {
             sonycameracontroller.execute("actTakePicture",[], 5, listener);
           },

    setAFPos : function (x,y,listener) {
                 sonycameracontroller.execute("setTouchAFPosition",[(x*1.0).toString(),(y*1.0).toString()], 2, listener);
               },

  }
}

function CameraController(doc){
  const {XMLHttpRequest} = require("sdk/net/xhr");
  const { Cc, Ci, Cu } = require("chrome");
  const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  let config  = {};
  let requestId = 0;
  let sonycameracontroller = {

    //---- Still Capture api
    actTakePicture : function  (listener) {
                       sonycameracontroller.execute("actTakePicture",[], listener);
                     },

    awaiyTakePicture: function (listener){
                        sonycameracontroller.execute("awaitTakePicture",[], listener);
                      },
    //---- Shoot mode api
    getAvailableShootMode : function (listener){
                              sonycameracontroller.execute("getAvailableShootMode",[]);
                            },

    getSupportedShootMode : function (listener){
                              sonycameracontroller.execute("getSupportedShootMode",[]);
                            },

    getShootMode : function (listener){
                     sonycameracontroller.execute("getShootMode",[],listener);
                   },

    setShootMode : function(shootMode, listener){
                     sonycameracontroller.execute("setShootMode",[shootMode],listener);
                   },

    //----- other

    initHeaderModifier: function () {
                          if(doc == null){
                            console.log("variable `doc` is not assigned"); 
                            return -1;
                          }
                          let whiteList = ["http://preview.fabnavi.org",
                              "https://preview.fabnavi.org",
                              "http://webservice.fabnavi.org",
                              "https://webservice.fabnavi.org",
                              "http://localhost:3000",
                              "https://localhost:3000"];
                          if(whiteList.indexOf(doc.location.origin) == -1){
                            console.log(doc.location+ " is not allowed origin");
                            return -1;
                          }
                          let observer = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
                          let httpObserver = {
                            observe:function (subj,topic,data) {
                                      if(topic == "http-on-examine-response"){
                                        let ch = subj.QueryInterface(Ci.nsIHttpChannel);
                                        ch.setResponseHeader("Access-Control-Allow-Origin","*",false);
                                        ch.setResponseHeader("Access-Control-Allow-Methods","POST,GET",false);
                                      }}
                          };
                          observer.addObserver(httpObserver,"http-on-examine-response",false);
                          return 0;
                        },

    init : function(){
             console.log("initilize cameracontroller");
             console.log("initialize header modifier :" + sonycameracontroller.initHeaderModifier());
           },

    execute : function (method, params, listener) {
                requestId++;
                let command = {
                  method: method, 
                  params: params, 
                  id: requestId,
                  version: config.version
                } 

                console.log("----command=-------");
                for(var key in command){
                  console.log(key,command[key]);
                }
                console.log("end of command=-------");
                let jsonString = JSON.stringify(command);
                let request = new XMLHttpRequest();
                request.onload = function (e) {
                  let response = JSON.parse(request.responseText);
                  console.log("Response------------");
                  console.log(request.responseText);
                  console.log("Response End------");

                  if (listener) {
                    let url = response.result[0][0];
                    listener(url,response);
                  }
                };
                let url = "http://"+config.addr+":"+config.port+"/sony/camera";
                request.open("POST", url, true);
                request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                request.send(jsonString);   
              },
    setup : function(c) {
              if(c == null) return config;
              config = c;
              config.beep = config.beep && true;
              config.fast = config.fast || false;
              if(config.beep)
                sonycameracontroller.execute("setBeepMode",["On"]);
              else 
                sonycameracontroller.execute("setBeepMode",["Off"]);
              if(config.fast)
                sonycameracontroller.execute("setPostviewImageSize",["2M"]);
              else 
                sonycameracontroller.execute("setPostviewImageSize",["Original"]);
            },
  };
  return sonycameracontroller;
}

function buildIntoJs(e){
  console.log("== Initialize");
  const {XMLHttpRequest} = require("sdk/net/xhr");
  const { Cc, Ci, Cu } = require("chrome");
  const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  let doc = e.originalTarget;
  let sonycameracontroller = CameraController(doc);
  if (doc.defaultView.frameElement) {
    return;
  }
  if (doc.readyState != "interactive") {
    return;
  }
  doc.wrappedJSObject.sonycameracontroller = Cu.cloneInto(sonycameracontroller, doc, {cloneFunctions: true});
  sonycameracontroller.init(); 
  console.log("== Finish");
}

exports.buildIntoJs= buildIntoJs;
exports.new =  CameraController;
