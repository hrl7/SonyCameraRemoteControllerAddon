/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Cc, Ci} = require("chrome");
const {XMLHttpRequest} = require("sdk/net/xhr");


let config;

exports.test = function () {
  let observer = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  let httpObserver = {
    observe:function (subj,topic,data) {
              if(topic = "http-on-examine-response"){
                let ch = subj.QueryInterface(Ci.nsIHttpChannel);
                ch.setResponseHeader("Access-Control-Allow-Origin","http://webservice.fabnavi.org",false);
                ch.setResponseHeader("Access-Control-Allow-Methods","POST,GET",false);
              }}
  };
  observer.addObserver(httpObserver,"http-on-examine-response",false);
}

function execute(method,params, id, listener) {
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
}

exports.setup = function(c) {
  config = c;
  execute("startRecMode",[],1);
  execute("setPostviewImageSize",["Original"],2);
  execute("setShootMode",["still"],3);
  execute("setBeepMode",["On"],4);
}



exports.zoomIn = function(listener){
  execute("actZoom",["in","1shot"],10,listener);
}

exports.zoomOut = function(listener){
  execute("actZoom",["out","1shot"],10,listener);
}

exports.zoomOutAll = function(listener){
  execute("actZoom",["out","start"],10,listener);
}

exports.take = function(listener) {
  execute("actTakePicture",[], 5, listener);
}

exports.setAFPos = function(x,y,listener) {
  execute("setTouchAFPosition",[(x*1.0).toString(),(y*1.0).toString()], 2, listener);
}

exports.__exposedProps__ = {
  setup: "r",
  take: "r",
  test: "r",
  zoomIn:"r",
  zoomOut:"r",
  zoomOutAll:"r",
  setTouchAFPosition:"r"
}
