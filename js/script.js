import { insertMeasures } from './insert.js';
import {scoreInit} from './setup.js';

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }, false);
  


export function init(){


  // Check if the user agent string contains "Windows" (for PC)
  var isPC = /Windows/i.test(navigator.userAgent);
  if (isPC) {
    //console.log("Running on PC.");
    window.device = "PC";
  } else {
    //console.log("Running on iPad ?");
    window.device = "iPad";
  }
 
  
  scoreInit();
  
}


window.onload = init;