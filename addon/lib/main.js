/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

 const { Cc, Ci, Cu } = require("chrome")
 const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 const mainWindow = wm.getMostRecentWindow("navigator:browser");
 const {XMLHttpRequest} = require("sdk/net/xhr");

 mainWindow.gBrowser.addEventListener("readystatechange", function(e) {
     let doc = e.originalTarget;
     let config  = {};
     var sonycameracontroller = {

       execute : function (method,params, id, listener) {
         let command = {
           method: method, 
           params: params, 
           id: id,
           version: config.version
         } 
         let jsonString = JSON.stringify(command);
         let request = new XMLHttpRequest();
         request.onload = function (e) {
           if (listener) {
             let response = JSON.parse(request.responseText);
             let url = response.result[0][0];
             listener(url,response);
           }
         };
         let url = "http://"+config.ipaddress+":"+config.port+"/sony/camera";
         request.open("POST", url, true);
         request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
         request.send(jsonString);   
       },
       setup : function(c,beep,fast) {
        if(sonycameracontroller.test() == -1)return ;
          
         config = c;
         beep = beep && true;
         fast = fast || false;
         sonycameracontroller.execute("startRecMode",[],1);
         sonycameracontroller.execute("setShootMode",["still"],3);
         if(beep)
           sonycameracontroller.execute("setBeepMode",["On"],4);
         else 
           sonycameracontroller.execute("setBeepMode",["Off"],4);
         if(fast)
           sonycameracontroller.execute("setPostviewImageSize",["2M"],2);
         else 
           sonycameracontroller.execute("setPostviewImageSize",["Original"],2);
       },

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


       test : function () {
        let whiteList = ["http://webservice.fabnavi.org", "https://webservice.fabnavi.org", "http://localhost:3000","https://localhost:3000"];
        if(whiteList.indexOf(doc.location.origin) == -1) return -1;
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
       }
     }


     if (doc.defaultView.frameElement) {
       return;
     }
     if (doc.readyState != "interactive") {
       return;
     }
     doc.wrappedJSObject.sonycameracontroller = Cu.cloneInto(sonycameracontroller, doc, {cloneFunctions: true});
     sonycameracontroller.test();

 }, true);
