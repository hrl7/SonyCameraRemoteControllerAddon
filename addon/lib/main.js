/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var camera = require('./cameraController.js');
const { Cc, Ci, Cu } = require("chrome");
const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
const mainWindow = wm.getMostRecentWindow("navigator:browser");
mainWindow.gBrowser.addEventListener("readystatechange",camera.buildIntoJs, true);
