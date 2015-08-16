function CameraController(doc){
  const {XMLHttpRequest} = require("sdk/net/xhr");
  const { Cc, Ci, Cu } = require("chrome");
  const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  let config  = {};
  let requestId = 0;
  let sonycameracontroller = {


    //---- Transferring images api
    getSchemeList : function ( listener, version ){
                 sonycameracontroller.execute("getSchemeList", [], listener, version, "sony/avContent");
                    },
    //---- Event notification api
    getEvent : function ( listener, version ) {
                 sonycameracontroller.execute("getEvent", [false], listener, version);
               },
    //---- Self-timer api

    //---- Movie Recording api
    startMovieRec: function ( listener, version ) {
                     sonycameracontroller.execute("startMovieRec",[], listener, version);
                   },

    stopMovieRec: function ( listener , version) {
                    sonycameracontroller.execute("stopMovieRec",[], listener, version);
                  },
    //---- Still Capture api
    actTakePicture : function  (listener, version) {
                       sonycameracontroller.execute("actTakePicture",[], listener, version);
                     },

    awaiyTakePicture: function (listener, version){
                        sonycameracontroller.execute("awaitTakePicture",[], listener, version);
                      },
    //---- Shoot mode api
    getAvailableShootMode : function (listener, version){
                              sonycameracontroller.execute("getAvailableShootMode",[], listener, version);
                            },

    getSupportedShootMode : function (listener, version){
                              sonycameracontroller.execute("getSupportedShootMode",[], listener, version);
                            },

    getShootMode : function (listener, version){
                     sonycameracontroller.execute("getShootMode",[],listener, version);
                   },

    setShootMode : function(shootMode, listener, version){
                     sonycameracontroller.execute("setShootMode",[shootMode],listener, version);
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

    execute : function (method, params, listener, version, endpoint) {
                requestId++;
                endpoint = endpoint || "sony/camera";
                let command = {
                  method: method, 
                  params: params, 
                  id: requestId,
                  version: version || config.version
                } 

                let jsonString = JSON.stringify(command);
                let url = "http://"+config.addr+":"+config.port+"/" + endpoint;
                let request = new XMLHttpRequest();
                request.onload = function (e) {
                console.log("----command=-------");
                for(var key in command){
                  console.log(key,command[key]);
                }
                console.log("end of command=-------");
                  let response = JSON.parse(request.responseText);
                  console.log("Response------------");
                  console.log("URL:::: ===> "+url);
                  console.log(request.responseText);
                  console.log("Response End------");

                  if (listener) {
                    console.log("calling listener#########");
                    listener(response);
                    console.log("end of calling listener#########");
                  }
                };
                request.open("POST", url, true);
                request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                request.send(jsonString);   
              },
    setup : function(c) {
              if(c == null) return config;
              config = c;


              sonycameracontroller.execute("setBeepMode",[config.beep ? "On" : "Off"]);
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
