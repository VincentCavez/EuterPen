
import { g, scoreInit, scoreInitBefore, scoreInitAfter } from './setup.js';

import {drawStart, drawMove, writeEnd, lassoEnd, lassoFadeOut, hideEverythingExcept, strokeClassifier, verticalStrokeFadeOut, penSliderMove, tapEnd, doubletapEnd, tripletapEnd} from './draw.js';
import {drawCross, crossCrossed, dragMove, dragEnd} from './drag.js';
import {fakeEmptyScore, CHECKPOINT, ERRORLOG, deselect_all, getStaffGap, axisAndDirection, changePathColor, areTheseTwoFingersOnTheSameSystem, fingersOrientation, popIcons, updateJustThis, findThisMeasure, findThisStaff,graduallySelectMeasures, graduallySelectStaffs, systemOrZone, resetBigBars, onTheScore} from './tools.js';
import { insertMeasures, insertThreeMeasures } from './insert.js';
import { create_zone_between_systems, adjust_zone_between_systems, createGhostMeasure, moveGhostMeasure, releaseGhostMeasure, icon_zone_start,icon_zone_end, createGhostMedia ,moveGhostMedia, releaseGhostMedia, createGhostSystem, moveGhostSystem, releaseGhostSystem, collapseZone, selectPhotoWidget,photoWidget_start, photoWidget_move, photoWidget_end, capture_videoWidget, photoWidget_resize} from './freeZone.js';
import { updateMeasuresIcons, moveBarline } from './measures.js';
import { icon_selection_start,icon_selection_move,icon_selection_end } from './selection.js';
import { icon_match_start, icon_match_move,icon_match_end } from './search.js';
import { placePin, pin_start, pin_move, pin_end } from './play.js';
import { adjust_pensieve, close_pensieve, open_pensieve } from './pensieve.js';
import { duplicate_start, duplicate_move, duplicate_end, revealFakePaste } from './copy.js';
import { audioWidget_start, audioWidget_move, audioWidget_end } from './audio.js';
import { resizeMeasure, resizeSystem } from './modif.js';


/*
if (window.device == "PC"){
    window.addEventListener('pointerdown', handlePointerDown, false);
    window.addEventListener('pointermove', handlePointerMove, false);
    window.addEventListener('pointerup', handlePointerUp, false);



} else if (window.device == "iPad"){
    window.addEventListener('touchstart', handleTouchDown, false);
    window.addEventListener('touchmove', handleTouchMove, false);
    window.addEventListener('touchend', handleTouchEnd, false);
}
*/

window.addEventListener('pointerover', contactOver, false);
window.addEventListener('pointerdown', contactDown, false);
window.addEventListener('pointermove', contactMove, false);
window.addEventListener('pointerup', contactEnd, false);
window.addEventListener('pointerout', contactOut, false);



  
//---------------------------------------------------------------------//
//                                                                     //          
//                            POINTER EVENTS                           //
//                                                                     //         
//---------------------------------------------------------------------//

function contactDown(event) {
    event.preventDefault();
    if(event.pointerType !== "mouse"){
        var contactId=event.pointerId;
        
        if(event.pointerType === "pen"){
            //disableScroll();
            if(event.buttons != 32){
                penDown(event,contactId);
            } else {
                rubberDown(event,contactId);
            }

        } else if(event.pointerType === "touch"){
            //enableScroll();
            touchDown(event,contactId);
        }
    }
}


function contactMove(event) {
    event.preventDefault();
    if(event.pointerType !== "mouse"){
        var contactId=event.pointerId;
        
        if(event.pointerType === "pen" && g.penPoints[contactId]){
            if(event.buttons != 32){
                penMove(event,contactId);
            } else {
                rubberMove(event,contactId);
            }

        } else if(event.pointerType === "touch"){
            touchMove(event,contactId);
        }
    }
}


function contactEnd(event) {
    event.preventDefault();
    if(event.pointerType !== "mouse"){
        var contactId=event.pointerId;

        if(event.pointerType === "pen"){
            
            if(event.button != 5){
                penEnd(event,contactId);
            } else {
                rubberEnd(event,contactId);
            }

        } else if(event.pointerType === "touch"){
            touchEnd(event,contactId);
        }
    }
}

function contactOver(event) {
    event.preventDefault();
    if(event.pointerType !== "mouse"){
        var contactId=event.pointerId;
        
        if(event.pointerType === "pen"){
            //disableScroll();
          
            penOver(event,contactId);
          
        }
    }
}

function contactOut(event) {
    event.preventDefault();
    if(event.pointerType !== "mouse"){
        var contactId=event.pointerId;
        
        if(event.pointerType === "pen"){
            //disableScroll();
          
            penOut(event,contactId);
          
        }
    }
}

//---------------------------------------------------------------------//       
//                                  PEN                                //      
//---------------------------------------------------------------------//

//#region PEN DOWN
function penDown(event,contactId) {
    
    if(Date.now() - g.lastPenClick < 300){
        if(g.doublePenClick === undefined){
            g.context["pen"] = "pen_doubletap";
           
            g.doublePenClick = Date.now();
            g.lastPenClick = Date.now();
            g.penPoints[contactId] = {
                x: [event.clientX],
                y: [event.clientY],
                xstart: event.clientX,
                ystart: event.clientY,
                target: event.target.parentNode,
                element: event.target,
                y_discrete: null
            };
        } else {
           
            g.context["pen"] = "pen_tripletap";
            delete g.doublePenClick;
            g.lastPenClick = Date.now();
            g.penPoints[contactId] = {
                x: [event.clientX],
                y: [event.clientY],
                xstart: event.clientX,
                ystart: event.clientY,
                target: event.target.parentNode,
                element: event.target,
                y_discrete: null
            };
        } 
    } else {
        
        delete g.doublePenClick;
        if(g.xtransform === undefined){
            g.xtransform = - g.globalOffsetX;
            g.ytransform = - g.globalOffsetY;
        }
        g.lastPenClick = Date.now();
        g.canThisStrokeBeAnInsert = true;
        g.penPoints[contactId] = {
            x: [event.clientX],
            y: [event.clientY],
            xstart: event.clientX,
            ystart: event.clientY,
            target: event.target.parentNode,
            element: event.target,
            y_discrete: null
        };
        
        //we stay in tap mode because we don't know yet if it's a drag or a lasso, so we prepare for both
        g.context["pen"]="pen_tap";
       
        if(g.penPoints[contactId].target.id=="osmdCanvasPage1" && findThisMeasure(event.clientX,event.clientY).node().classList.contains("contentSelected")){
            g.context["pen"]="measure_tap";
            d3.select("#iconsBox").remove();
            g.penPoints[contactId].timestep = Date.now();
        } else if (g.penPoints[contactId].target.id=="osmdCanvasPage1" && findThisStaff(event.clientX,event.clientY).node().classList.contains("contentSelected")){
            g.context["pen"]="staff_tap"; 
            d3.select("#iconsBox").remove();
            g.penPoints[contactId].timestep = Date.now();
        } else if (g.penPoints[contactId].target.classList.contains("photoWidget")){
            g.context["pen"]="pen_photoWidget";
        } else if (d3.select(event.target).node().classList.contains("corner")){ 
            d3.select(".photoWidget").attr("oldtop",d3.select(".photoWidget").style("top")).attr("oldleft",d3.select(".photoWidget").style("left"))
            if(d3.select(event.target).node().classList.contains("lowerrightcorner")){
                g.context["pen"]="resize_photo_downright";
            } else {
                g.context["pen"]="resize_photo_upleft";
            }
        } else if (g.penPoints[contactId].target.id == "miniScore"){
            if(event.target.id=="engravingToggle"){
                if(d3.select(event.target).attr("hidden")=="no"){
                    g.context["pen"]="hideEngraving"
                } else {
                    g.context["pen"]="revealEngraving"
                }
            } else if (event.target.id=="handwritingToggle"){
                if(d3.select(event.target).attr("hidden")=="no"){
                    g.context["pen"]="hideHandwriting"
                } else {
                    g.context["pen"]="revealHandwriting"
                }
            } else if (event.target.id=="miniScoreClose"){
                g.context["pen"]="close_miniscore";
            } else {
                g.context["pen"]="pen_miniscore";
            }
        } else if (d3.select(event.target).attr("id") == "barLineBin"){
            g.context["pen"]="pen_barlinebin";
            d3.select("#barLineBin").attr("src","./css/darkblueBin.svg")
        } else if (g.penPoints[contactId].target.id == "photoToClose"){
            g.context["pen"]="select_photo";
        } else if(event.target.classList.contains("iconSelection")){
            g.context["pen"]="icon_selection";
            icon_selection_start(event,contactId);
        } else if(event.target.classList.contains("photoSelection")){
            d3.select("#photoToClose").remove();
            d3.select("#iconsBox").remove();
            d3.select("#bla").remove();
        } else if(g.penPoints[contactId].target.classList.contains("pin")){
            g.context["pen"]="pin";
            pin_start(event,contactId);
        } else if (g.penPoints[contactId].target.id == "choiceIcons"){
            g.context["pen"]="pen_slider_icons";
            if(event.clientY < d3.select("#choiceIcons").node().getBoundingClientRect().y + d3.select("#choiceIcons").node().getBoundingClientRect().height*2/5){
                if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_darkorange_basic.svg")
                } else {
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_darkblue_basic.svg")
                }
            } else {
                if(event.clientX < d3.select("#choiceIcons").node().getBoundingClientRect().x + d3.select("#choiceIcons").node().getBoundingClientRect().width/2){
                    if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_left.svg")
                    } else {
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_left.svg")
                    }
                } else {
                    if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_right.svg")
                    } else {
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_right.svg")
                    }
                }        
            }   
        } else if(d3.select(event.target).attr("href")=="./css/measuresDown.svg"){ 
            g.context["pen"]="pen_measuresDown";
        } else if(d3.select(event.target).attr("class")=="resize"){
            g.context["pen"]="resize_system";
            var num = d3.select(event.target.parentNode).attr("number")
            resizeSystem(num);
        } else if(g.penPoints[contactId].target.id == "pasteBox"){
            g.context["pen"]="confirm_paste";
            
        } else if(event.target.classList.contains("iconZone") || event.target.parentNode.parentNode.classList.contains("audioWidget") || event.target.parentNode.parentNode.classList.contains("pdfWidget")){//?
        
                g.context["pen"]="icon_zone";
                icon_zone_start(event,contactId);
                if(event.target.classList.contains("createMeasure")){
                    g.context["pen"]="icon_zone_measure";
                    createGhostMeasure(contactId);
                } else if(event.target.classList.contains("mic")){
                    g.context["pen"]="icon_zone_mic";
                    createGhostMedia("mic",contactId);
                } else if(event.target.classList.contains("camera")){
                    g.context["pen"]="icon_zone_camera";
                    createGhostMedia("camera",contactId);
                } else if(event.target.classList.contains("upload")){
                    g.context["pen"]="icon_zone_upload";
                    createGhostMedia("upload",contactId);
                } else if(event.target.classList.contains("url")){
                    g.context["pen"]="icon_zone_url";
                    createGhostMedia("url",contactId);
                } else if(event.target.classList.contains("createStaff")){
                    createGhostSystem(contactId);
                    g.context["pen"]="icon_zone_staff";
                } else if(event.target.classList.contains("collapse")){
                    d3.select(event.target).attr("href","./css/darkCollapse.svg")
                    g.context["pen"] = "icon_zone_collapse";
                }
            
        } else if(g.penPoints[contactId].target.classList.contains("matchBox")){
            g.context["pen"]="icon_match";
            icon_match_start(event,contactId);
        } else if(g.penPoints[contactId].target.classList.contains("barLines")){
            g.context["pen"]="pen_barLine";
            changePathColor(d3.select(document.elementFromPoint(event.clientX, event.clientY).parentNode),"black");
        } else {
            
          
            if(g.penPoints[contactId].target.classList.contains("noteHead") || g.penPoints[contactId].target.classList.contains("ledgerLine")){//note value
                if(!g.penPoints[contactId].target.classList.contains("selected")){
                    deselect_all();//?
                } 
               
                drawStart(event,contactId);
                g.selectionTargets = "pitches"
                drawCross(contactId,12);
            } else if (g.penPoints[contactId].target.classList.contains("stem") || g.penPoints[contactId].target.classList.contains("beam") || g.penPoints[contactId].target.classList.contains("flag") || g.penPoints[contactId].target.classList.contains("dot") || g.penPoints[contactId].target.classList.contains("rest")){//note rhythm
                if(!g.penPoints[contactId].target.classList.contains("selected")){
                    deselect_all();
                } 
                drawStart(event,contactId);
                g.selectionTargets = "durations"
            } else if (g.penPoints[contactId].target.classList.contains("accidental")){//node modifier
                if(!g.penPoints[contactId].target.classList.contains("selected")){
                    deselect_all();
                } 
                drawStart(event,contactId);
                g.selectionTargets = "accidentals"
                drawCross(contactId,12);
            } else if (g.penPoints[contactId].target.classList.contains("dynamic")){//articulation
                if(!g.penPoints[contactId].target.classList.contains("selected")){
                    deselect_all();
                } 
                drawStart(event,contactId);
                g.selectionTargets = "dynamics"
                drawCross(contactId,12);
            
            } else {
           
                if(d3.select(".selected").empty() == false){
                    g.maybeDontSelect = true;
                }
            
                deselect_all();
                changePathColor(d3.selectAll(".linkedMatch,.unlinkedMatch"), "black");
                d3.selectAll(".linkedMatch").classed("linkedMatch",false)
                d3.selectAll(".unlinkedMatch").classed("unlinkedMatch",false)
                d3.selectAll(".matchBox").remove();
                d3.selectAll(".matchRect").remove();
                drawStart(event,contactId);
                resetBigBars();
                
                g.selectionTargets = "global"
                g.context["pen"]="pen_write";
            }
            
            
        }
    }

}


//#region PEN MOVE
function penMove(event,contactId) {
    
    g.penPoints[contactId].x.push(event.clientX);
    g.penPoints[contactId].y.push(event.clientY);
    if(g.context["pen"]=="measure_tap" &&  g.penPoints[contactId].y.length > 10 ){
        g.context["pen"]="measure_selection";
    } else if(g.context["pen"]=="staff_tap" && g.penPoints[contactId].y.length > 10 ){
        g.context["pen"]="staff_selection";
    } else if(g.context["pen"]=="measure_selection"){
        if(Date.now()-g.penPoints[contactId].timestep > 50){
            graduallySelectMeasures(g.penPoints[contactId].xstart,g.penPoints[contactId].ystart,event.clientX,event.clientY);
            g.penPoints[contactId].timestep = Date.now();
        }
    } else if(g.context["pen"]=="staff_selection"){
        if(Date.now()-g.penPoints[contactId].timestep > 50){
            graduallySelectStaffs(g.penPoints[contactId].xstart,g.penPoints[contactId].ystart,event.clientX,event.clientY);
            g.penPoints[contactId].timestep = Date.now();
        }
    } else if(g.context["pen"]=="resize_photo_downright"){
        photoWidget_resize(event,contactId,"downright");
    } else if(g.context["pen"]=="resize_photo_upleft"){
        photoWidget_resize(event,contactId,"upleft");
    } else if(g.context["pen"]=="pen_barlinebin"){
        if(document.elementFromPoint(event.clientX, event.clientY).id == "barLineBin"){
            d3.select("#barLineBin").attr("src","./css/darkblueBin.svg")
        } else {
            d3.select("#barLineBin").attr("src","./css/blueBin.svg")
        }
    } else if(g.context["pen"]=="pen_write"){
        drawMove(event,contactId);
        if(strokeClassifier()=="pin"){
            g.context["pen"]="pen_pin";
            d3.select("#currentStroke")
                .transition().duration(g.strokeColorShiftDuration)
                .style("fill", "none").style("stroke", "#01b801")
        } else if(strokeClassifier() == "slider"){
            g.context["pen"]="pen_slider";
            d3.select("#currentStroke")
                .transition().duration(g.strokeColorShiftDuration)
                .style("fill", "none").style("stroke", "darkorange")
            var sliderCounter = d3.select("#osmdSvgPage1").append("g").attr("id","sliderCounter").attr("transform", "translate("+(g.penPoints[contactId].x.slice(-1)[0] - 50 - g.defaultPensieveWidth)+","+(g.penPoints[contactId].y.slice(-1)[0]-50)+")")
            sliderCounter.append("circle").attr("cx", 25).attr("cy", 25).attr("r", 25)
                                        .attr("fill",g.paperColor).style("opacity", 0.8)

                                        
            sliderCounter.append("text").attr("x", 25).attr("y", 35)
                                        .attr("text-anchor", "middle").style("font-size", "25px").style("font-family","Arial").style("fill", "white")
                                        .text("+1")
            g.lastRegisteredY = g.penPoints[contactId].y.slice(-1)[0];
             
        } else if (strokeClassifier()=="lasso"){
            g.context["pen"]="pen_lasso";
            d3.select("#currentStroke")
                .transition().duration(g.strokeColorShiftDuration)
                .style("fill", "#92908e28").style("stroke", "blue")
        }
    } else if (g.context["pen"]=="pin"){
        pin_move(event,contactId);
    } else if (g.context["pen"]=="icon_selection_bin" || g.context["pen"]=="icon_selection_copy" || g.context["pen"]=="icon_selection_paste"|| g.context["pen"]=="icon_selection_play" || g.context["pen"]=="icon_selection_search" || g.context["pen"]=="icon_selection_beautify" || g.context["pen"]=="icon_selection_edit"){
        icon_selection_move(event,contactId);
    } else if (g.context["pen"]=="icon_zone_measure"){
        moveGhostMeasure(contactId);
    } else if (g.context["pen"]=="icon_zone_mic"){
        moveGhostMedia("mic",contactId);
    } else if (g.context["pen"]=="icon_zone_camera"){
        moveGhostMedia("camera",contactId);
    } else if (g.context["pen"]=="icon_zone_upload"){
        moveGhostMedia("upload",contactId);
    } else if (g.context["pen"]=="icon_zone_url"){
        moveGhostMedia("url",contactId);
    } else if (g.context["pen"]=="icon_zone_staff"){
        moveGhostSystem(contactId);
    } else if (g.context["pen"]=="icon_match"){
        icon_match_move(event,contactId);  
    } else if (g.context["pen"]=="pen_slider_icons"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "choiceIcons"){
            if(event.clientY < d3.select("#choiceIcons").node().getBoundingClientRect().y + d3.select("#choiceIcons").node().getBoundingClientRect().height*2/5){
                if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_darkorange_basic.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_left.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_right.svg"){
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_darkorange_basic.svg")
                } else {
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_darkblue_basic.svg")
                }
            } else {
                if(event.clientX < d3.select("#choiceIcons").node().getBoundingClientRect().x + d3.select("#choiceIcons").node().getBoundingClientRect().width/2){
                    if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_left.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_darkorange_basic.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_right.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_left.svg")
                    } else {
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_left.svg")
                    }
                } else {
                    if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_right.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_darkorange_basic.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_left.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_right.svg")
                    } else {
                        d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_right.svg")
                    }
                }        
            }    
        } else {
            if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_left.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_right.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_darkorange_basic.svg" || d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_basic.svg"){
                d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_basic.svg")
            } else {
                d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_basic.svg")
            }
            
        }
    } else if(g.context["pen"]=="pen_drag"){//we move the selection
        dragMove(contactId)

    } else if(g.context["pen"]=="pen_tap"){
        
        if(g.penPoints[contactId].target.classList.contains("selected")){
            
            if(crossCrossed(contactId,12) == false){
              
            } else {
                g.context["pen"]="pen_drag";
                g.penPoints[contactId].axis = axisAndDirection(contactId)[0];
                d3.select("#cross").remove();
                d3.select("#currentStroke").remove();
            }
            
            

        } else {//the target is not selected

            if(g.selectionTargets == "global"){
                if(Date.now()-g.lastPenClick>100){
                    g.context["pen"]="pen_lasso";
                    d3.select("#currentStroke")
                        .transition().duration(g.strokeColorShiftDuration)
                        .style("fill", "#92908e28").style("stroke", "blue")
                    d3.select("#cross").remove();
                }

            } else {//pen started on something
                
                if(math.distance([g.penPoints[contactId].xstart,g.penPoints[contactId].ystart],[g.penPoints[contactId].x.slice(-1)[0],g.penPoints[contactId].y.slice(-1)[0]])<12 && g.selectionTargets!="durations"){
                  
                    if(crossCrossed(contactId,12) == false){
                        drawMove(event);
                       
                    } else {
                        g.context["pen"]="pen_drag";
                        g.penPoints[contactId].axis = axisAndDirection(contactId)[0];
                        d3.select("#cross").remove();
                        d3.select("#currentStroke").remove();

                        deselect_all();
                        
                    }
                } else {
                    g.context["pen"]="pen_lasso";
                    d3.select("#currentStroke")
                        .transition().duration(g.strokeColorShiftDuration)
                        .style("fill", "#92908e28").style("stroke", "blue")
                    d3.select("#cross").remove();

                    deselect_all();
                    
                    hideEverythingExcept();
                    
                }
            }
        }


    } else if (g.context["pen"]=="pen_lasso"){
        g.maybePin = true;
        drawMove(event);
        if(g.selectionTargets == "global" && g.strokeCoords.length > 1){
            
            if (strokeClassifier()=="stroke"){
                g.context["pen"]="pen_write";
                d3.select("#currentStroke")
                    .transition().duration(g.strokeColorShiftDuration)
                    .style("fill", "none").style("stroke", g.pencilColor)
            }
        } 
    } else if (g.context["pen"]=="pen_pin"){
        drawMove(event);
        g.maybePin = false;

    } else if(g.context["pen"]=="pen_slider"){
        
        penSliderMove(contactId);
        drawMove(event);
    }

     
}
//#region PEN END
function penEnd(event,contactId) {
    if(g.penPoints[contactId].target.id == "pensieve"){
        var type = "pensieve";
    } else {
        var type = "score";//or zone
    }

    if(g.context["pen"]=="pen_write"){
        if(math.distance([Math.min(...g.penPoints[contactId].x),Math.min(...g.penPoints[contactId].y)],[Math.max(...g.penPoints[contactId].x),Math.max(...g.penPoints[contactId].y)])<3 && g.penPoints[contactId].y.length <= 10){
            tapEnd(type,event,contactId);
            d3.selectAll(".pin").remove();
          
        } else {
            writeEnd(event,contactId);
        }
    } else if (g.context["pen"]=="select_photo"){
        deselect_all();
        selectPhotoWidget(event,contactId);
    } else if (g.context["pen"]=="hideEngraving"){
        d3.select("#engravingToggle").attr("href","./css/blueEngraving.svg").attr("hidden","yes")
        d3.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").attr("visibility","hidden")
        d3.selectAll(".minisystem").style("fill","grey")
    } else if(g.context["pen"]=="revealEngraving"){
        d3.select("#engravingToggle").attr("href","./css/orangeEngraving.svg").attr("hidden","no")
        d3.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").attr("visibility","visible")
        d3.selectAll(".minisystem").style("fill","black")
    } else if(g.context["pen"]=="hideHandwriting"){
        d3.select("#handwritingToggle").attr("href","./css/blueHandwriting.svg").attr("hidden","yes")
        d3.selectAll(".writing,.miniwriting").attr("visibility","hidden")
    } else if(g.context["pen"]=="revealHandwriting"){
        d3.select("#handwritingToggle").attr("href","./css/orangeHandwriting.svg").attr("hidden","no")
        d3.selectAll(".writing,.miniwriting").attr("visibility","visible")
    } else if(g.context["pen"]=="pen_barlinebin"){
        if(document.elementFromPoint(event.clientX, event.clientY).id == "barLineBin"){
            d3.select("#barLineBin").remove();
            d3.select(".selected").remove();  
        } else {
            d3.select("#barLineBin").attr("src","./css/blueBin.svg")
        }
    } else if (g.context["pen"]=="pen_miniscore"){
        var sys_num = d3.select(document.elementFromPoint(event.clientX, event.clientY)).attr("system");
       
        var new_top = Number(d3.select("#system_"+sys_num).node().getBoundingClientRect().top) -30
        var new_top_miniscore = Number(d3.select("#system_"+sys_num).node().getBBox().y) -30


     
        d3.select("#osmdSvgPage1").transition().duration(1000).attr("transform", "translate(" + (g.xtransform ) + "," + (g.ytransform - new_top)+ ")");
       
        d3.select("#miniScore").transition().duration(1000).attr("transform", "translate(0," + new_top_miniscore+ ")");
        
        
        g.ytransform = g.ytransform - new_top;
       
    } else if (g.context["pen"]=="staff_tap" || g.context["pen"]=="measure_tap"){
        tapEnd(type,event,contactId);
    } else if (g.context["pen"]=="pen_doubletap" && onTheScore(event)){
        doubletapEnd(event,contactId);
    } else if (g.context["pen"]=="pen_tripletap" && onTheScore(event)){
        tripletapEnd(event,contactId);
    } else if (g.context["pen"]=="measure_selection" || g.context["pen"]=="staff_selection"){
        popIcons();
    } else if (g.context["pen"]=="pin"){
        pin_end(event,contactId);
    } else if (g.context["pen"]=="icon_selection_bin" || g.context["pen"]=="icon_selection_copy" || g.context["pen"]=="icon_selection_paste" || g.context["pen"]=="icon_selection_play" || g.context["pen"]=="icon_selection_search" || g.context["pen"]=="icon_selection_beautify" || g.context["pen"]=="icon_selection_edit"){
        icon_selection_end(event,contactId);
    } else if (g.context["pen"]=="icon_zone"){
        icon_zone_end(event,contactId)
    } else if (g.context["pen"]=="icon_zone_measure"){
        releaseGhostMeasure(event,contactId);
    } else if (g.context["pen"]=="icon_zone_mic"){
        releaseGhostMedia("mic",event,contactId);
    } else if (g.context["pen"]=="icon_zone_camera"){
        releaseGhostMedia("camera",event,contactId);
    } else if (g.context["pen"]=="icon_zone_upload"){
        releaseGhostMedia("upload",event,contactId);
    } else if (g.context["pen"]=="icon_zone_url"){
        releaseGhostMedia("url",event,contactId);
    } else if (g.context["pen"]=="icon_zone_staff"){
        releaseGhostSystem(event,contactId);
    } else if (g.context["pen"]=="icon_zone_collapse"){
        collapseZone(event,contactId);
    } else if (g.context["pen"]=="icon_match"){
        icon_match_end(event,contactId);
    } else if (g.context["pen"]=="confirm_paste"){
        d3.select("#pasteBox").remove();
        deselect_all();
    } else if (g.context["pen"]=="close_miniscore"){
        d3.select("#miniScore").remove();
      

    } else if(g.context["pen"]=="pen_tap"){
      
        if(g.selectionTargets == "global"){
          
            deselect_all();
            d3.select("#iconsBox").remove();  
            d3.select("#currentStroke").remove(); 
            changePathColor(d3.selectAll(".linkedMatch,.unlinkedMatch"), "black");
            d3.selectAll(".linkedMatch").classed("linkedMatch",false)
            d3.selectAll(".unlinkedMatch").classed("unlinkedMatch",false)
            d3.selectAll(".matchBox").remove();
            d3.selectAll(".matchRect").remove();
            d3.selectAll(".pin").remove();
            if(d3.select("#pasteBox").empty() == false){
                d3.select("#pasteBox").remove();
                d3.selectAll(".selected").remove();
            }
        } else {
            d3.select("#cross").remove();
            d3.select("#currentStroke").remove();
            updateJustThis(contactId);
        }
        
    } else if (g.context["pen"]=="pen_drag"){ 
        dragEnd(contactId);
    } else if (g.context["pen"]=="pen_lasso"){
        
        lassoEnd("unique_selection",event);
        lassoFadeOut();
       
    } else if (g.context["pen"]=="pen_slider"){

        var choiceIcons = d3.select("#osmdSvgPage1").append("g").attr("id","choiceIcons")
        choiceIcons.append("image").attr("href","./css/insertbox/insertbox_orange_basic.svg").attr("x", g.penPoints[contactId].xstart - 75/2 - g.defaultPensieveWidth).attr("y", d3.select("#currentStroke").node().getBBox().y-82).attr("width", 75)
       
    } else if (g.context["pen"]=="pen_slider_icons"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "choiceIcons"){
            if(event.clientY < d3.select("#choiceIcons").node().getBoundingClientRect().y + d3.select("#choiceIcons").node().getBoundingClientRect().height*2/5){
                if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_darkorange_basic.svg"){
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_blue_basic.svg")
                } else {
                    d3.select("#choiceIcons").select("image").attr("href","./css/insertbox/insertbox_orange_basic.svg")
                }
            } else {
                if(event.clientX < d3.select("#choiceIcons").node().getBoundingClientRect().x + d3.select("#choiceIcons").node().getBoundingClientRect().width/2){
                    //left, TODO
                } else {
                    if(d3.select("#choiceIcons").select("image").attr("href") == "./css/insertbox/insertbox_orange_right.svg"){
                        insertThreeMeasures(true);
                        d3.select("#sliderCounter").remove();
                        d3.select("#choiceIcons").remove();
                        verticalStrokeFadeOut();
                    } else {
                        insertThreeMeasures(false);
                        d3.select("#sliderCounter").remove();
                        d3.select("#choiceIcons").remove();
                        verticalStrokeFadeOut();
                    }
                  
                }  
            }
            
            
        }
    } else if(g.context["pen"]=="pen_pin"){
        placePin(contactId)
        pin_end(event,contactId);
    } else if(g.context["pen"]=="pen_barLine"){
        tapEnd(type,event,contactId);
    }
    
    delete g.penPoints[contactId];

    delete g.context["pen"];
    d3.select("#drawingPlane").style("z-index", null);
    
}



function penOver(event) {
    var el = d3.select(event.target.parentNode);
    var authorizedClasses = ["noteHead","stem","beam","flag","accidental","dynamic","dot","rest","ledgerLine","timeSignature","clef","barLines"]
    if(!el.node().classList.contains("selected") && !event.target.classList.contains("selected") && authorizedClasses.includes(el.node().classList[0]) && !el.empty()){
      
        el.classed("hovered",true)
        el.selectAll("path,rect").each(function(){
            if(!this.classList.contains("selected")){
                if(d3.select(this).style("stroke") != "none" && d3.select(this).style("stroke") != "undefined" && d3.select(this).style("stroke") != null && d3.select(this).style("stroke") != false){
                    d3.select(this).style("stroke", g.pencilColor);
                } 
                if(d3.select(this).style("fill") != "none" && d3.select(this).style("fill") != "undefined" && d3.select(this).style("fill") != null && d3.select(this).style("fill") != false){
                    d3.select(this).style("fill", g.pencilColor);
                } 
                if(el.node().classList[0] == "barLines" && !event.target.classList.contains("big")){
                    d3.select(event.target).attr("width",10).attr("x",Number(d3.select(event.target).attr("x"))-5).classed("big",true)
                }
            }
        })
        
    }
    
 
}

function penOut(event) {
    
    var el = d3.select(event.target.parentNode);
    if(!el.empty()){
        if(el.node().classList.contains("hovered") && !el.node().classList.contains("selected") ){
        
            el.classed("hovered",false)
            el.selectAll("path,rect").each(function(){

                if(!event.target.classList.contains("selected")){
                    if(d3.select(this).style("stroke") != "none" && d3.select(this).style("stroke") != "undefined" && d3.select(this).style("stroke") != null && d3.select(this).style("stroke") != false){
                        d3.select(this).style("stroke", "black");
                    } 
                    if(d3.select(this).style("fill") != "none" && d3.select(this).style("fill") != "undefined" && d3.select(this).style("fill") != null && d3.select(this).style("fill") != false){
                        d3.select(this).style("fill", "black");
                    } 
                    if(el.node().classList[0] == "barLines" && event.target.classList.contains("big")){
                        d3.select(event.target).attr("width",1).attr("x",Number(d3.select(event.target).attr("x"))+5).classed("big",false)
                    }
                }
            })
        }
    }
   
}

//#region TOUCH DOWN
//---------------------------------------------------------------------//       
//                                TOUCH                                //      
//---------------------------------------------------------------------//

function touchDown(event,contactId) {
    g.lastTouchClick = Date.now();
    if(g.xtransform == undefined){
        g.xtransform = - g.globalOffsetX;
        g.ytransform = - g.globalOffsetY;
    }
    g.touchPoints[contactId] = {
        x: [event.clientX],
        y: [event.clientY],
        xstart: event.clientX,
        ystart: event.clientY,
        target: event.target.parentNode,
        contactDate: Date.now(),
    };
    
    if(Object.keys(g.touchPoints).length === 1){

        if(d3.select(".selected").empty()==false && d3.select(".matchBox").empty() == true){
           
            if(d3.selectAll(".barLines").filter(function(){return this.classList.contains("barlineSelected")}).empty()==false){
                g.context["touch"]="move_barLine";
                var sys_num = findThisMeasure(g.touchPoints[Object.keys(g.touchPoints)[0]].xstart,g.touchPoints[Object.keys(g.touchPoints)[0]].ystart).node().parentNode.id.split("_")[1];
                var button = d3.selectAll(".resize").filter(function(){return d3.select(this).attr("number") == sys_num})
                button.transition().duration(200).style("opacity",0)
                setTimeout(function(){
                    button.remove();
                },200)
                CHECKPOINT("barLine")
                d3.select("#barLineBin").transition().duration(200).style("opacity",0)
            } else {
                g.context["touch"]="duplicate_waiting_for_confirmation";
                setTimeout(function(){
                    if(g.context["touch"]=="duplicate_waiting_for_confirmation"){
                        g.context["touch"]="duplicate";
                        duplicate_start(event,contactId);
                    }
                },50)
                
                
                
            }
        } else if(d3.select(event.target.parentNode).attr("class") == "photoWidget"){
            g.context["touch"]="move_photoWidget";
            photoWidget_start(event,contactId);
        } else if(d3.select(event.target).attr("class") == "videoWidget"){
            g.context["touch"]="capture_videoWidget";
        } else if(d3.select(event.target.parentNode).attr("id") == "photoToOpen"){
            g.context["touch"]="open_photo";
            
        } else if(d3.select(event.target.parentNode).attr("id") == "pensieveHandle"){
            g.context["touch"]="adjust_pensieve";
            g.initialPensieveWidth = d3.select("#pensieve").node().getBBox().width;
            
        } else if(d3.select(event.target.parentNode).attr("class") == "audioWidget"){
            g.context["touch"]="move_audioWidget";
            audioWidget_start(event,contactId);
        } else {
            g.context["touch"]="pan";
            
        }
    } else if (Object.keys(g.touchPoints).length === 2){
        d3.select("#current_copy").remove();
        d3.select(".miniSignature").remove();
      
        g.context["touch"]="pan_or_zoom";
        
        g.initialDistance = math.distance([g.touchPoints[Object.keys(g.touchPoints)[0]].xstart,g.touchPoints[Object.keys(g.touchPoints)[0]].ystart],[g.touchPoints[Object.keys(g.touchPoints)[1]].xstart,g.touchPoints[Object.keys(g.touchPoints)[1]].ystart]);
        g.lastDistance = g.initialDistance;
        
        if(areTheseTwoFingersOnTheSameSystem(0,1)[0] == "yes" && d3.selectAll(".contentSelected").empty() == false ){
            var measuresNum = []
            d3.selectAll(".contentSelected").filter(function(){
                return d3.select(this).attr("class").includes("measure")
            }).each(function(){
                measuresNum.push(d3.select(this).attr("number"));
            })
            var uniq = [...new Set(measuresNum)];
            let numberArray = uniq.reduce( (acc, x ) => acc.concat(+x), [])
            
            if(uniq.includes(findThisMeasure(g.touchPoints[Object.keys(g.touchPoints)[0]].xstart,g.touchPoints[Object.keys(g.touchPoints)[0]].ystart).attr("number")) ){
                d3.select("#current_copy").remove();
                g.touchPoints[Object.keys(g.touchPoints)[0]].measures = [];
                g.touchPoints[Object.keys(g.touchPoints)[0]].measuresInitialSizes = [];
                for (var i = 0; i < numberArray.length; i++){
                    g.touchPoints[Object.keys(g.touchPoints)[0]].measures.push(document.querySelector(`.measure[number="${numberArray[i]}"]`));
                    g.touchPoints[Object.keys(g.touchPoints)[0]].measuresInitialSizes.push(document.querySelector(`.measure[number="${numberArray[i]}"]`).getBoundingClientRect().width);
                }
                g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove = [];
                var firstMeasureNum = d3.min(numberArray);
                var sys = d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measures[0].parentNode)
                sys.selectAll(".measure").each(function(){
                    if(Number(d3.select(this).attr("number")) > firstMeasureNum){
                        if(d3.select(this).attr("transform") != null){
                            d3.select(this).attr("oldtransform",d3.select(this).attr("transform"))
                        }
                        g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove.push(this);
                    }
                })

                g.context["touch"]="resize_measures";
                
            }
            
        }
        
       

    } else if(Object.keys(g.touchPoints).length === 3){

        if(areTheseTwoFingersOnTheSameSystem(0,1)[0] == "no"){
            // create a free zone between systems
            g.context["touch"]="adjust_zone_between_systems";
            var result = areTheseTwoFingersOnTheSameSystem(0,1);
            g.handledSystem = result[1];
            g.pointedSystem = result[2];
           
            create_zone_between_systems(g.handledSystem,g.pointedSystem);
              
        } 
       
    } else {

        g.context["touch"]="too_many_touch";
    }
}

//#region TOUCH MOVE
function touchMove(event,contactId) {
   
    if(g.touchPoints[contactId] != undefined){//if we deleted touchPoints because of a canceled event, we don't want to save new points
        g.touchPoints[contactId].x.push(event.clientX);
        g.touchPoints[contactId].y.push(event.clientY);
    }
      
    if(g.context["touch"] == "move_barLine"){
        moveBarline(event,contactId);
    } else if(g.context["touch"] == "move_audioWidget"){
        audioWidget_move(event,contactId);
    } else if(g.context["touch"] == "move_photoWidget"){
        photoWidget_move(event,contactId);
    } else if(g.context["touch"] == "duplicate_waiting_for_confirmation"){
        
    } else if(g.context["touch"] == "duplicate"){
        duplicate_move(event,contactId);
    } else if(g.context["touch"] == "adjust_pensieve"){
        adjust_pensieve(contactId);
    } else if(g.context["touch"] == "pan"){

        // ------------------------- PAN inside a zone -------------------------
        if(g.touchPoints[contactId].target.classList.contains("free_zone_between_systems")){
            if(d3.select(g.touchPoints[contactId].target).selectAll(".fzs_system").size() == 0){//?
                d3.select(g.touchPoints[contactId].target).selectAll(".writing").each(function(){
                    var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                 
                    d3.select(this).attr("transform", "translate(" + (Number(oldTransform[1])+ g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0]) + "," + (Number(oldTransform[2])+ g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0]) + ")")
                })
            } else {
                d3.select(g.touchPoints[contactId].target).selectAll(".fzs_system").each(function(){
                    var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                  
                    d3.select(this).attr("transform", "translate(" + (Number(oldTransform[1])+ g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0]) + "," + (Number(oldTransform[2])+ g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0]) + ")")
                })
            }
          
            d3.select(g.touchPoints[contactId].target.parentNode).selectAll(".audioWidget,.pdfWidget").each(function(){
                var oldLeft = parseFloat(d3.select(this).style("left"))
                var oldTop = parseFloat(d3.select(this).style("top"))
               
                d3.select(this).style("left", oldLeft + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0] + "px")
                d3.select(this).style("top", oldTop + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0] + "px")
            })
           
        } else {
            // ------------------------- PAN of the score -------------------------
           
            if(g.defaultPensieveWidth+g.xtransform+10000+g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart <= d3.select("#pensieve").node().getBoundingClientRect().width){
           
                var newwidth = g.defaultPensieveWidth+(g.xtransform+g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart+10000)
                if(newwidth < 40){
                    d3.select("#pensieve").selectAll(".iconZone").transition().duration(200).style("opacity",0)    
                } else {
                    d3.select("#osmdSvgPage1").attr("transform", "translate(" + (g.xtransform + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart) + "," + (g.ytransform + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart) + ")");
                    d3.select("#freeZonesContainer").style("left",(g.xtransform + g.globalOffsetX + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart) + "px").style("top",g.ytransform + g.globalOffsetY + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart + "px")
                
                    d3.select("#pensieveContainer").style("width",newwidth+"px")
                    d3.select("#pensieveHandle").style("left",(newwidth-40)+"px")
                    d3.select("#pensieveContainer").selectAll(".iconZone").each(function(){
                        if(d3.select(this).node().classList.contains("collapse") || d3.select(this).node().classList.contains("createStaff")){
                            d3.select(this).attr("x",newwidth-35)
                        } else if(d3.select(this).node().classList.contains("bin") || d3.select(this).node().classList.contains("createMeasure")){ 
                            d3.select(this).attr("x",newwidth-70)
                        }
                    })
                
                }
                
               // ------------------------- PAN de la partition UNIQUEMENT ------------------------- 
            } else {
                d3.select("#osmdSvgPage1").attr("transform", "translate(" + (g.xtransform + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart) + "," + (g.ytransform + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart) + ")");
                d3.select("#freeZonesContainer").style("left",(g.xtransform + g.globalOffsetX + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart) + "px").style("top",(g.ytransform + g.globalOffsetY + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart) + "px")
            }
        }
    
    
    
    } else if(g.context["touch"] == "pan_or_zoom" && Object.keys(g.touchPoints).length > 1){

        if(event.isPrimary == false){
            if(g.touchPoints[contactId].target.classList.contains("free_zone_between_systems")){
                if(d3.select(g.touchPoints[contactId].target).selectAll(".fzs_system").size() == 0){
                    d3.select(g.touchPoints[contactId].target).selectAll(".writing").each(function(){
                        var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                        
                        d3.select(this).attr("transform", "translate(" + (Number(oldTransform[1])+ g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0]) + "," + (Number(oldTransform[2])+ g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0]) + ")")
                    })
                } else {
                    d3.select(g.touchPoints[contactId].target).selectAll(".fzs_system").each(function(){
                        var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                        
                        d3.select(this).attr("transform", "translate(" + (Number(oldTransform[1])+ g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0]) + "," + (Number(oldTransform[2])+ g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0]) + ")")
                    })
                }
                
                d3.select(g.touchPoints[contactId].target.parentNode).selectAll(".audioWidget,.pdfWidget").each(function(){
                    var oldLeft = parseFloat(d3.select(this).style("left"))
                    var oldTop = parseFloat(d3.select(this).style("top"))
                    
                    d3.select(this).style("left", oldLeft + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].x.slice(-2)[0] + "px")
                    d3.select(this).style("top", oldTop + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].y.slice(-2)[0] + "px")
                })
                
            } else {
                d3.select("#osmdSvgPage1").attr("transform", "translate(" + (g.xtransform + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart) + "," + (g.ytransform + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart) + ")");
                d3.select("#freeZonesContainer").style("position","absolute").style("left",g.xtransform + g.globalOffsetX + g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart + "px").style("top",g.ytransform + g.globalOffsetY + g.touchPoints[contactId].y.slice(-1)[0] - g.touchPoints[contactId].ystart + "px")
            }
        
        }
            
    } else if(g.context["touch"] == "resize_measures"){
      
        var currentDistance = math.distance([g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0],g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0]],[g.touchPoints[Object.keys(g.touchPoints)[1]].x.slice(-1)[0],g.touchPoints[Object.keys(g.touchPoints)[1]].y.slice(-1)[0]]);
        var zoomLevel = currentDistance / ( g.initialDistance  );  
        var zoomGap = (currentDistance - g.initialDistance);
        var n = g.touchPoints[Object.keys(g.touchPoints)[0]].measures.length;
       
        g.lastDistance = currentDistance;

        for(var i = 0; i < g.touchPoints[Object.keys(g.touchPoints)[0]].measures.length; i++){
            const measure = g.touchPoints[Object.keys(g.touchPoints)[0]].measures[i];
            const initial = g.touchPoints[Object.keys(g.touchPoints)[0]].measuresInitialSizes[i];
            resizeMeasure(measure,{ width: initial+zoomGap/n });
        }
   
        if(n == 1){
            for(var i = 0; i < g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove.length; i++){
                if(d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("oldtransform") != null){
                    var oldtransform = Number(d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                    var oldbox = Number(d3.select("#iconsBox").attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                } else {
                    var oldtransform = 0;
                }
                d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("transform", "translate(" + (oldtransform + zoomGap) + ",0)");
            }
            if(d3.select("#iconsBox").attr("oldtransform") != null){
                var oldtransform = Number(d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                var oldbox = Number(d3.select("#iconsBox").attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                d3.select("#iconsBox").attr("transform", "translate(" + (oldbox + zoomGap/2) + ",0)");
            } else {
                var oldtransform = 0;
                d3.select("#iconsBox").attr("transform", "translate(" + zoomGap/2 + ",0)");
            }
        } else {
            for(var i = 0; i < g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove.length; i++){
                if(d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("oldtransform") != null){
                    var oldtransform = Number(d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                    var oldbox = Number(d3.select("#iconsBox").attr("oldtransform").split("(")[1].split(")")[0].split(",")[0]);
                    d3.select("#iconsBox").attr("transform", "translate(" + (oldbox + zoomGap/n) + ",0)");
                } else {
                    var oldtransform = 0;
                    d3.select("#iconsBox").attr("transform", "translate(" + zoomGap/n + ",0)");
                }
                d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measuresToMove[i]).attr("transform", "translate(" + (oldtransform + (i+1)/n*zoomGap) + ",0)");
                
            }
        }
           
            
        
        
    } else if(g.context["touch"] == "pan_system"){
        
        if(event.isPrimary == false){
            var systemToMove = d3.select("#system_"+g.pointedSystem);
            systemToMove.attr("transform", "translate(" + (g.systemOldTransformX + g.touchPoints[Object.keys(g.touchPoints)[1]].x.slice(-1)[0] - g.touchPoints[Object.keys(g.touchPoints)[1]].xstart) + ","+g.systemOldTransformY+")");
            d3.select("#iconsBox").attr("transform", "translate(" + (g.systemOldTransformX + g.touchPoints[Object.keys(g.touchPoints)[1]].x.slice(-1)[0] - g.touchPoints[Object.keys(g.touchPoints)[1]].xstart) + ",0)");
            updateMeasuresIcons(systemToMove);

        }
    } else if(g.context["touch"] == "adjust_zone_between_systems"){
     
        adjust_zone_between_systems(g.handledSystem,g.pointedSystem);
    } else if(g.context["touch"] == "adjust_zone_between_measures"){
    }
    
}

//#region TOUCH END
function touchEnd(event,contactId) {
    
    if (Object.keys(g.touchPoints).length === 1){
        if(g.context["touch"] == "pan" || g.context["touch"] == "pan_or_zoom"){
            g.xtransform = g.xtransform + g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0] - g.touchPoints[Object.keys(g.touchPoints)[0]].xstart;
            g.ytransform = g.ytransform + g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] - g.touchPoints[Object.keys(g.touchPoints)[0]].ystart;
            g.pensieveWidth = d3.select("#pensieveContainer").node().getBoundingClientRect().width;
        } else if(g.context["touch"] == "move_barLine"){
            var sys = d3.select("#system_"+findThisMeasure(g.touchPoints[Object.keys(g.touchPoints)[0]].xstart,g.touchPoints[Object.keys(g.touchPoints)[0]].ystart).attr("system"));
            updateMeasuresIcons(sys);
            d3.select("#barLineBin").transition().duration(200).style("opacity",1)
        } else if(g.context["touch"] == "move_audioWidget"){
            audioWidget_end(event,contactId);
        } else if(g.context["touch"] == "move_photoWidget"){
            //photoWidget_end(event,contactId);
        } else if (g.context["touch"] == "capture_videoWidget"){
            capture_videoWidget(event,contactId);
        } else if(g.context["touch"] == "open_photo"){
            d3.select("#photoToOpen").transition().duration(200).style("left",1055.3+"px").style("top",300+"px").style("height",200+"px").style("width",280+"px")
            d3.select("#photoToOpen").transition().delay(200).style("overflow","visible").attr("id","photoToClose")
        } else if(g.context["touch"] == "duplicate"){
            duplicate_end(event,contactId);
        } else if(g.context["touch"] == "adjust_pensieve"){
            if(Date.now() - g.lastTouchClick < 200){
                if(d3.select("#pensieveContainer").node().getBoundingClientRect().width > 40){
                    close_pensieve();
                } else {
                    open_pensieve();
                }                
            
            } else {
                g.xtransform = g.futureXtransform;
                g.pensieveWidth = d3.select("#pensieveContainer").node().getBoundingClientRect().width;
            }


        }

        g.touchPoints = {};
        delete g.context["touch"];
        
    } else if(Object.keys(g.touchPoints).length === 2){
        
        if(g.context["touch"] != "pan_or_zoom"){
            var sys = d3.select(g.touchPoints[Object.keys(g.touchPoints)[0]].measures[0].parentNode);
            updateMeasuresIcons(sys);
            delete g.context["touch"];
            d3.select("#drawingPlane").style("z-index",0)
            d3.select("#iconsBox").attr("oldtransform",d3.select("#iconsBox").attr("transform"))
            
        } 
        delete g.touchPoints[contactId];
        
  
    } else if (Object.keys(g.touchPoints).length === 3){
        //triple_touch_end(event,contactId)
        g.touchPoints = {}
        delete g.context["touch"];
       
    } else {
        g.touchPoints = {};
        delete g.context["touch"];
    }
    
   

}

//---------------------------------------------------------------------//       
//                               RUBBER                                //      
//---------------------------------------------------------------------//

function rubberDown(event,contactId) {
    if(g.xtransform == undefined){
        g.xtransform = - g.globalOffsetX;
        g.ytransform = - g.globalOffsetY;
    }
    g.lastPenClick = Date.now();
    g.canThisStrokeBeAnInsert = true;
    g.penPoints[contactId] = {
        x: [event.clientX],
        y: [event.clientY],
        xstart: event.clientX,
        ystart: event.clientY,
        target: event.target.parentNode,
        y_discrete: null
    };

    

    if(d3.selectAll(".selected").size() > 0){
        g.context["pen"]="instant_rubber";
        d3.selectAll(".selected").remove();
        d3.select(".lasso").remove();
        d3.select("#iconsBox").remove()
        d3.selectAll(".contentSelected").classed("contentSelected",false)
    } else {
        g.context["pen"]="rubber";
        var currentTarget = document.elementFromPoint(event.clientX, event.clientY).parentNode;
        if(currentTarget.classList.contains("writing")){
            d3.select(currentTarget).remove();
        }
    }
}

function rubberMove(event,contactId) {

    g.penPoints[contactId].x.push(event.clientX);
    g.penPoints[contactId].y.push(event.clientY);
    
    if(g.context["pen"]=="rubber"){
        d3.selectAll(".writing").each(function(){  
            var currentTarget = d3.select(this).node();
            
            if(event.clientX > currentTarget.getBBox().x && event.clientX < currentTarget.getBBox().x + currentTarget.getBBox().width && event.clientY > currentTarget.getBBox().y && event.clientY < currentTarget.getBBox().y + currentTarget.getBBox().height){
                d3.select(currentTarget).remove();
            }
        })
    }
}

function rubberEnd(event,contactId) {

    delete g.penPoints[contactId];

    delete g.context["pen"];
}


function disableScroll() {
    document.body.classList.add("stop-scrolling");
}

function enableScroll() {
    document.body.classList.remove("stop-scrolling");
}