/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Cc, Ci} = require("chrome");
const {XMLHttpRequest} = require("sdk/net/xhr");


let config;

exports.test = function () {
 console.log("test");
 for(i in Cc){
    if(i.indexOf("observer") != -1)console.log(i);
 }
 let observer = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
 let httpObserver = {
    observe:function (subj,topic,data) {
     if(topic = "http-on-examine-response"){
     let ch = subj.QueryInterface(Ci.nsIHttpChannel);
      ch.setResponseHeader("Access-Control-Allow-Origin","http://webservice.fabnavi.org",false);
      ch.setResponseHeader("Access-Control-Allow-Methods","POST,GET",false);
         //"Access-Control-Allow-Origin","*",false));
    }}
 };
 observer.addObserver(httpObserver,"http-on-examine-response",false);
 console.log("loaded");
}

function execute(method, id, listener) {
  let command = {
    method: method, 
    params: [], 
    id: id,
    version: config.version
  } 
  let jsonString = JSON.stringify(command);
  let request = new XMLHttpRequest();
  request.onload = function (e) {
    if (listener) {
      let response = JSON.parse(request.responseText);
      let url = response.result[0][0];
      listener.taken(url,response);
    }
  };
  let url = "http://"+config.ipaddress+":"+config.port+"/sony/camera";
  request.open("POST", url, true);
  request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
  request.send(jsonString);   
}

exports.setup = function(c) {
  config = c;
  execute("startRecMode", 1);
}

exports.take = function(listener) {
  execute("actTakePicture", 2, listener);
}

exports.__exposedProps__ = {
  setup: "r",
  take: "r",
  test: "r"
}
