
import {g} from "./setup.js";
import { CHECKPOINT, deselect_all,findThisMeasure,findThisStaff,popIcons, popIconsPensieve,popIconsAroundZoneMeasure, changePathColor, staffSelection, measureSelection, measureContentSelection, staffContentSelection, resetBigBars, onTheScore } from "./tools.js";

import { revealFakePaste } from "./copy.js";


const lineGenerator = d3.line();
//#region DRAW
//---------------------------------------------------------------------//       
//                                 DRAW                                //      
//---------------------------------------------------------------------//

export function drawStart() {
    
    g.strokeCoords = [];
    g.timeStamp = Date.now();
    d3.select("#currentStroke").remove();
    d3.select(".lasso").remove();
    d3.select("#iconsBox").remove();
    
    

    d3.select("#drawingPlane")
        .append("path")
        .attr("id", "currentStroke")
        
    d3.select("#drawingPlane").style("z-index", 1000);
}

export function drawMove(event) {
    
    g.strokeCoords.push([event.x, event.y]);
    d3.select("#currentStroke").attr("d", lineGenerator(g.strokeCoords));
}

//#region TAP
//---------------------------------------------------------------------------//       
//                                  PEN TAP                                  //      
//---------------------------------------------------------------------------//

export function tapEnd(type,event,contactId){
    
    d3.select("#currentStroke").remove();
    g.strokeCoords = [];
    d3.select("#iconsBox").remove();
    deselect_all();
   
    if(g.maybeDontSelect === undefined){
        if(type=="score" && onTheScore(event) == true){
            if(g.penPoints[contactId].target.id=="osmdCanvasPage1"){
                
                resetBigBars();
                var staff = findThisStaff(g.penPoints[contactId].x.slice(-1)[0],g.penPoints[contactId].y.slice(-1)[0])
                
                var system = d3.select("#system_"+staff.attr("system"))
                var offset = system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                var offsetY = Number(offset[2]);
                
                if(staff.attr("key") == "sol"){
                    var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
                    var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
                
                    if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
                        
                    } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
                        
                        measureContentSelection(d3.select("#measure_"+staff.attr("measure")))
                        popIcons();
                    } else {
                        staffContentSelection(staff);
                        popIcons();
                        
                    }
                } else if (staff.attr("key") == "fa"){
                    var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
                    var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
                
                    if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
                        measureContentSelection(d3.select("#measure_"+staff.attr("measure")))
                        popIcons();
                    } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
                    
                    } else {
                    
                        staffContentSelection(staff);
                        popIcons();
                    }
                }
            } else if(g.penPoints[contactId].target.classList.contains("lines")){
                    
                    resetBigBars();
                    var staff = findThisStaff(g.penPoints[contactId].x.slice(-1)[0],g.penPoints[contactId].y.slice(-1)[0])
                    
                    var system = d3.select("#system_"+staff.attr("system"))
                    var offset = system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                    var offsetY = Number(offset[2]);
                    
                    staffContentSelection(staff);
                    popIcons(); 
                    
            } else if(g.penPoints[contactId].target.classList.contains("barLines")) {
                
                if(g.penPoints[contactId].element.classList.contains("selected")){
                
                    var color = g.selectedColor
                    d3.select(g.penPoints[contactId].target).classed("barlineSelected", true)
                    d3.select(g.penPoints[contactId].element).classed("selected", true).classed("unselected",false)
                    if(d3.select(event.target).style("stroke") != "none" && d3.select(event.target).style("stroke") != "undefined" && d3.select(event.target).style("stroke") != null && d3.select(event.target).style("stroke") != false){
                        d3.select(event.target).style("stroke", color);
                    } 
                    if(d3.select(event.target).style("fill") != "none" && d3.select(event.target).style("fill") != "undefined" && d3.select(event.target).style("fill") != null && d3.select(event.target).style("fill") != false){
                        d3.select(event.target).style("fill", color);
                    } 
                
                } else {
                    if(d3.select("#firstBar").empty()==false){
                        
                        d3.select("#firstBar").classed("selected",false).classed("unselected",true)
                        d3.select(d3.select("#firstBar").node().parentNode).classed("barlineSelected",false)
                        d3.select("#firstBar").attr("width",1).attr("x",Number(d3.select("#firstBar").attr("x"))+5).classed("big",false).style("stroke", "black").style("fill", "black").attr("id",null);
                     
                    } 
                       
                    d3.select(g.penPoints[contactId].target).classed("barlineSelected", true)
                    d3.select(g.penPoints[contactId].element).classed("selected", true).classed("unselected",false)
                    d3.select(event.target).style("fill", g.selectedColor).style("stroke", g.selectedColor).attr("id","firstBar")
                    
                    var x = Number(d3.select("#firstBar").attr("x"))
                    var y = Number(d3.select("#firstBar").attr("y"))
                    d3.select("#osmdCanvasPage1").append("img").attr("src","./css/blueBin.svg").attr("id","barLineBin").style("position","absolute")
                                .style("left",(x-10)+"px").style("top",(y-35)+"px").style("width","30px").style("height","30px")
                }
            } else {
            
                measureContentSelection(d3.select(g.penPoints[contactId].target).select(".measure"))
            
                popIconsAroundZoneMeasure();
                
            }
        }
    } else {
        delete g.maybeDontSelect;
    }
}

//#region DOUBLE TAP
//---------------------------------------------------------------------------//       
//                                 DOUBLE TAP                                //      
//---------------------------------------------------------------------------//

export function doubletapEnd(event,contactId){
    deselect_all();
    d3.select("#currentStroke").remove();
    g.strokeCoords = [];
    d3.select("#iconsBox").remove();
    var staff = findThisStaff(g.penPoints[contactId].x.slice(-1)[0],g.penPoints[contactId].y.slice(-1)[0])
    var system_num = staff.attr("system")
    var system = d3.select("#system_"+system_num)
    var offset = system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
    var offsetY = Number(offset[2]);

    if(g.penPoints[contactId].target.id=="osmdCanvasPage1"){

        if(staff.attr("key") == "sol"){
            var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
            var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
        
            if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
            
            } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
                measureContentSelection(d3.select("#system_"+system_num).selectAll(".measure"))
                popIcons();
            } else {
                staffContentSelection(d3.select("#system_"+system_num).selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "sol"}));
                popIcons();
            }
        } else if (staff.attr("key") == "fa"){
            var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
            var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
        
            if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
                measureContentSelection(d3.select("#system_"+system_num).selectAll(".measure"))
                popIcons();
            } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
            
            } else {
                staffContentSelection(d3.select("#system_"+system_num).selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "fa"}));
                popIcons();
            }
        }
       
    } else if(g.penPoints[contactId].target.classList.contains("lines")){
        deselect_all();
        resetBigBars();

        if(staff.attr("key") == "sol"){
            staffContentSelection(d3.select("#system_"+system_num).selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "sol"}));
            popIcons();
        } else {
            staffContentSelection(d3.select("#system_"+system_num).selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "fa"}));
            popIcons();
        }
    }
        
    d3.select("#currentStroke").remove();
    g.strokeCoords = [];

}

//#region TRIPLE TAP
//---------------------------------------------------------------------------//       
//                                 TRIPLE TAP                                //      
//---------------------------------------------------------------------------//

export function tripletapEnd(event,contactId){
    deselect_all();
    d3.select("#currentStroke").remove();
    g.strokeCoords = [];
    d3.select("#iconsBox").remove();
    var staff = findThisStaff(g.penPoints[contactId].x.slice(-1)[0],g.penPoints[contactId].y.slice(-1)[0])
        var system_num = staff.attr("system")
        var system = d3.select("#system_"+system_num)
        var offset = system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
        var offsetY = Number(offset[2]);
    if(g.penPoints[contactId].target.id=="osmdCanvasPage1"){
        

        if(staff.attr("key") == "sol"){
            var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
            var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
        
            if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
            
            } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
                measureContentSelection(d3.selectAll(".measure"))
                popIcons();
            } else {
                staffContentSelection(d3.selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "sol"}));
                popIcons();
            }
        } else if (staff.attr("key") == "fa"){
            var y_top = staff.select(".staffLineTop").node().getBBox().y + offsetY
            var y_bottom = staff.select(".lines").node().getBBox().y + staff.select(".lines").node().getBBox().height + offsetY
        
            if(g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform < y_top){
                measureContentSelection(d3.selectAll(".measure"))
                popIcons();
            } else if (g.penPoints[contactId].y.slice(-1)[0]- g.globalOffsetY - g.ytransform > y_bottom){
            
            } else {
                staffContentSelection(d3.selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "fa"}));
                popIcons();
            }
        }
      
    } else if(g.penPoints[contactId].target.classList.contains("lines")){
        deselect_all();
        resetBigBars();

        if(staff.attr("key") == "sol"){
            staffContentSelection(d3.selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "sol"}));
            popIcons();
        } else {
            staffContentSelection(d3.selectAll(".staff").filter(function(){return d3.select(this).attr("key") == "fa"}));
            popIcons();
        }
    }
    d3.select("#currentStroke").remove();
    g.strokeCoords = [];

}

//#region WRITE
//---------------------------------------------------------------------------//       
//                                    WRITE                                  //      
//---------------------------------------------------------------------------//

export function writeEnd(event,contactId){
    if(g.strokeCoords.length > 1){
        releaseInMeasureOrZone(event,"writing");
        g.timeStamp = null;
    } else {
        d3.select("#currentStroke").remove();
    }
    g.strokeCoords = [];
}

function releaseInMeasureOrZone(event,type){
    var x = g.strokeCoords[g.strokeCoords.length-1][0];
    var y = g.strokeCoords[g.strokeCoords.length-1][1];
    var path = d3.select("#currentStroke").attr("id", null)
    
    if(event.target.parentNode.classList.contains("free_zone_between_systems")){
        var offsetX = - (parseFloat(d3.select(event.target.parentNode.parentNode).style("left")) + parseFloat(d3.select(event.target.parentNode.parentNode.parentNode).style("left")))-g.defaultPensieveWidth;
        var offsetY = - (parseFloat(d3.select(event.target.parentNode.parentNode).style("top")) + parseFloat(d3.select(event.target.parentNode.parentNode.parentNode).style("top")));

        if(d3.select(event.target.parentNode).selectAll(".fzs_system").size() > 0){
            var translate = d3.select(event.target.parentNode).selectAll(".fzs_system").attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
            offsetX = offsetX - Number(translate[1]);
            offsetY = offsetY - Number(translate[2]);


            var staff = null;
            var distToStaff = Infinity;
            d3.select(event.target.parentNode).select(".fzs_system").selectAll(".staff").each(function(){
                var staff_Y = this.getBBox().y + this.getBBox().height/2;
                var newY = y+g.globalOffsetY+g.ytransform;
           
                if (math.abs(staff_Y - newY) <= distToStaff){
                    distToStaff = math.abs(staff_Y - newY);
                    staff = d3.select(this);
                }


            });

            var newParent = staff.append("g").attr("class",type).attr("transform","translate("+offsetX+","+offsetY+")");
            
        } else {
            var newParent = d3.select(event.target.parentNode).append("g").attr("class",type).attr("transform","translate("+offsetX+","+offsetY+")"); //on cherche à l'attacher à une mesure ou à une zone //?
        }
        newParent.node().appendChild(path.node());
    } else if (event.target.parentNode.id == "pensieve"){
        CHECKPOINT("pensieve")
        var newParent = d3.select("#pensieve").append("g").attr("class",type).attr("transform","translate(0,0)"); //on cherche à l'attacher à une mesure ou à une zone
        newParent.node().appendChild(path.node());
    } else {
        
        var systranslateY = -Number(d3.select("#system_"+findThisStaff(x,y).attr("system")).attr("transform").split(",")[1].slice(0,-1))
        var newParent = findThisStaff(x,y).append("g").attr("class",type).attr("transform","translate("+(- g.globalOffsetX - g.xtransform - g.defaultPensieveWidth)+","+(systranslateY- g.globalOffsetY - g.ytransform)+")"); //on cherche à l'attacher à une mesure ou à une zone
        newParent.node().appendChild(path.node());
    }

    if(type == "writing"){
        var ts = g.timeStamp;
        g.writingCoords[ts] = g.strokeCoords;
        newParent.attr("date",ts).attr("visibility","visible");
    }

}
//#region BAR AND SLIDER
//--------------------------------------------------------------------------------//       
//                                  BAR AND SLIDER                                //      
//--------------------------------------------------------------------------------//


export function strokeClassifier(){
    if(d3.select("#currentStroke").node().getBBox().width <= 30 && d3.select("#currentStroke").node().getBBox().height >= 200){//si c'est vertical
        g.potentialSystem = d3.select("#currentStroke").node().getBBox().y + d3.select("#currentStroke").node().getBBox().height/2;
        if(g.strokeCoords[g.strokeCoords.length-1][1] < d3.select("#currentStroke").node().getBBox().y + d3.select("#currentStroke").node().getBBox().height - 20){//et qu'on est remonté de plus de 20px
            return "slider";
        }
    } else if (math.distance(g.strokeCoords[0],g.strokeCoords[g.strokeCoords.length-1]) < 2*g.gap && d3.select("#currentStroke").node().getBBox().width >= 2*g.gap && d3.select("#currentStroke").node().getBBox().height >= 2*g.gap){
        return "lasso";
    } else if(g.maybePin == true && d3.select("#currentStroke").node().getBBox().height >= 200){
        return "pin";
    } else {
        return "stroke"
    }
}



export function verticalStrokeFadeOut() {
    var delay = 200;
  
    d3.select("#currentStroke").attr("id", "VFadeOut").style("stroke", "orange").style("fill","none")
    .transition()
      .duration(delay)
      .style("opacity", 0)
        .on("end", function() {
            d3.select("#VFadeOut").remove();
        });
       
    
}

export function penSliderMove(contactId){
    
    var step = 5000/d3.select("#currentStroke").node().getBBox().height;
    var offsetx = g.globalOffsetX + g.xtransform
    var offsety = g.globalOffsetY + g.ytransform
    var width = 50
    var height = 50
    var count = parseInt(d3.select("#sliderCounter").select("text").text());
  
    if(g.strokeCoords[g.strokeCoords.length-1][1] < g.lastRegisteredY - step){
        g.lastRegisteredY = g.strokeCoords[g.strokeCoords.length-1][1];
        var txt = "+"+(count+1)
        d3.select("#sliderCounter").attr("transform","translate("+(g.penPoints[contactId].x.slice(-1)[0] - offsetx - width - g.defaultPensieveWidth)+","+(g.penPoints[contactId].y.slice(-1)[0] - offsety-height)+")").select("text").text(txt);
        
    } else if (g.strokeCoords[g.strokeCoords.length-1][1] > g.lastRegisteredY + step){
        g.lastRegisteredY = g.strokeCoords[g.strokeCoords.length-1][1];
        var txt = "+"+math.max([count-1,0])
        d3.select("#sliderCounter").attr("transform","translate("+(g.penPoints[contactId].x.slice(-1)[0] - offsetx - width - g.defaultPensieveWidth)+","+(g.penPoints[contactId].y.slice(-1)[0] - offsety-height)+")").select("text").text(txt);
    }
}


//#region LASSO
//--------------------------------------------------------------------------------//       
//                                      LASSO                                     //      
//--------------------------------------------------------------------------------//

const pointInPolygon = function (point, vs) {
  
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    var x = point[0],
        y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0]- g.globalOffsetX - g.xtransform,
            yi = vs[i][1]- g.globalOffsetY - g.ytransform;
        var xj = vs[j][0]- g.globalOffsetX - g.xtransform,
            yj = vs[j][1]- g.globalOffsetY - g.ytransform;

        var intersect =
            yi > y != yj > y &&
            x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }

    return inside;
};




export function lassoEnd(action,event) {
    d3.select("#currentStroke").attr("id",null).attr("class", "lasso")
    
    if(action == "unique_selection"){
        
        //----------------------------------------//
        //                PENSIEVE                //
        //----------------------------------------//
        if(onTheScore(event) == false){
            var pensieve = d3.select("#pensieve");


            if(g.selectionTargets == "global"){
                //global selection
                var musicalElements = pensieve.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.writing,.justEngraved")
               
            } else {
            
                if(g.selectionTargets == "pitches"){
                    var musicalElements = pensieve.selectAll(".noteHead, .accidental, .ledgerLine")

                } else if (g.selectionTargets == "durations"){
                    var musicalElements = pensieve.selectAll(".stem,.beam,.flag,.dot,.rest")

                } else if (g.selectionTargets == "accidentals"){
                    var musicalElements = pensieve.selectAll(".accidental")

                } else if (g.selectionTargets == "dynamics"){
                    var musicalElements = pensieve.selectAll(".dynamic")
                } 
                changePathColor(d3.selectAll(".unselected"),"black")
                
            }
        
            
            musicalElements.each(function(){
                var el=d3.select(this);
              
                if(!d3.select(".copy")){
                   
                    var point = [
                        el.node().getBBox().x,
                        el.node().getBBox().y,
                    ];
                    
                } else {
               
                    var translateX = Number(d3.select(this.parentNode.parentNode).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);//?
                    var translateY = Number(d3.select(this.parentNode.parentNode).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);//?
                 
                    var point = [
                        el.node().getBBox().x+translateX,
                        el.node().getBBox().y+translateY,
                    ];
                
                }

                
                if (pointInPolygon(point, g.strokeCoords)) {
                    el.classed("selected", true).classed("unselected", false);
                    changePathColor(el, g.selectedColor);
                }
            });

            if(d3.selectAll(".selected").size() > 0){
                popIconsPensieve();
            } else {
                console.log("no selection")
            }

        //----------------------------------------//
        //                  ZONE                  //
        //----------------------------------------//
        } else if(document.elementFromPoint(event.clientX,event.clientY).parentNode.classList.contains("free_zone_between_systems")) {
            var zone = d3.select(document.elementFromPoint(event.clientX,event.clientY).parentNode);

            if(g.selectionTargets == "global"){
                //global selection
                var musicalElements = zone.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.writing,.justEngraved")
            } else {
            
                if(g.selectionTargets == "pitches"){
                    var musicalElements = zone.selectAll(".noteHead, .accidental, .ledgerLine")

                } else if (g.selectionTargets == "durations"){
                    var musicalElements = zone.selectAll(".stem,.beam,.flag,.dot,.rest")

                } else if (g.selectionTargets == "accidentals"){
                    var musicalElements = zone.selectAll(".accidental")

                } else if (g.selectionTargets == "dynamics"){
                    var musicalElements = zone.selectAll(".dynamic")
                } 
                changePathColor(d3.selectAll(".unselected"),"black")
                
            }
            
            musicalElements.each(function(){
                var el=d3.select(this);
                
                if(!this.parentNode.parentNode.classList.contains("copy")){//?
                   
                    var point = [
                        el.node().getBBox().x, 
                        el.node().getBBox().y,
                    ];
                    
                } else {
                
                    var translateX = Number(d3.select(this.parentNode.parentNode).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);
                    var translateY = Number(d3.select(this.parentNode.parentNode).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);
                  
                    var point = [
                        el.node().getBBox().x+translateX,
                        el.node().getBBox().y+translateY,
                    ];
                

                }

                
                
                if (pointInPolygon(point, g.strokeCoords)) {
                    el.classed("selected", true).classed("unselected", false);
                    changePathColor(el, g.selectedColor);
                }
            });

            if(d3.selectAll(".selected").size() > 0){
                popIcons();
            } else {
                console.log("no selection")
               
            }

        //----------------------------------------//
        //            SYSTEM OR MARGIN            //
        //----------------------------------------//
        } else {
            var score = d3.select("#osmdSvgPage1")
        
            if(g.selectionTargets == "global"){
                //global selection
                var musicalElements = score.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.writing,.justEngraved")
            } else {
            
                if(g.selectionTargets == "pitches"){
                    var musicalElements = score.selectAll(".noteHead, .accidental, .ledgerLine")

                } else if (g.selectionTargets == "durations"){
                    var musicalElements = score.selectAll(".stem,.beam,.flag,.dot,.rest")

                } else if (g.selectionTargets == "accidentals"){
                    var musicalElements = score.selectAll(".accidental")

                } else if (g.selectionTargets == "dynamics"){
                    var musicalElements = score.selectAll(".dynamic")
                } 
                changePathColor(d3.selectAll(".unselected"),"black")
                
            }
        
            musicalElements.each(function(){
                var el=d3.select(this);
                // SYSTEME OU MARGE
              
                        var num = Number(d3.select(this.parentNode.parentNode).attr("system"))
                        var translateX = Number(d3.select("#system_"+num).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);
                        var translateY = Number(d3.select("#system_"+num).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);
                        if(!el.node().classList.contains("writing")){
                            translateX = translateX + g.defaultPensieveWidth
                            if(el.attr("transform") != null){
                                translateX += Number(el.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);
                                translateY += Number(el.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);
                            }
                        }
                        var point = [
                            el.node().getBBox().x+translateX,
                            el.node().getBBox().y+translateY,
                        ];
                        
                
                
                if (pointInPolygon(point, g.strokeCoords)) {
                    el.classed("selected", true).classed("unselected", false);
                    changePathColor(el, g.selectedColor);
                }
            });


            if(d3.selectAll(".selected").size() > 0){
                popIcons();
            } else {
                console.log("no selection")
             
            }
        


            //REFINING
           
            if(d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target).attr("id") != "osmdCanvasPage1" && d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target).attr("class") != "free_zone_between_systems" && !g.penPoints[Object.keys(g.penPoints)[0]].target.classList.contains("lines") && d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target).attr("id") != "pensieve"){
        

                d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target).classed("selected", true).classed("unselected",false)
                changePathColor(d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target), g.selectedColor);

                var shortId = d3.select(g.penPoints[Object.keys(g.penPoints)[0]].target).attr("shortId");
                var ledgers = d3.selectAll("[shortId='"+shortId+"']").filter(function(){
                    return d3.select(this).node().classList.contains("ledgerLine")
                
                }).classed("selected", true).classed("unselected",false)
                changePathColor(ledgers, g.selectedColor);
            
            }
            
            
            if(g.selectionTargets == "global") {
              
                d3.selectAll(".selected").each(function(){
                    d3.selectAll("[shortId='"+d3.select(this).attr("shortId")+"']").each(function(){
                        d3.select(this).classed("selected", true).classed("unselected", false);
                        changePathColor(d3.select(this), g.selectedColor);
                        ;
                    })
                })
              
            }
                 
        
        }
        
        g.strokeCoords = [];
    }
}

3

//#region HIDE, FADE OUT
export function hideEverythingExcept(){
    
    var color = g.paperColor;
    
    d3.selectAll(".engraved,.selected").selectAll("path, rect").filter(function(){return !this.parentNode.classList.contains("writing")}).style("stroke", color).style("fill", color);
    d3.selectAll(".writing").selectAll("path").style("stroke", color);

    if(g.selectionTargets == "pitches"){
        d3.selectAll(".noteHead, .ledgerLine, .accidental").filter(function(){return d3.select(this).node().classList.contains("engraved")})
        .selectAll("path").style("stroke", "black").style("fill", "black");

    } else if(g.selectionTargets == "durations"){
        d3.selectAll(".stem, .beam, .flag, .dot, .rest").filter(function(){return d3.select(this).node().classList.contains("engraved")})
        .selectAll("path").style("stroke", "black").style("fill", "black");
        
    } else if(g.selectionTargets == "accidentals"){
        d3.selectAll(".accidental").filter(function(){return d3.select(this).node().classList.contains("engraved")})
        .selectAll("path").style("stroke", "black").style("fill", "black");
    
    } else if(g.selectionTargets == "dynamics"){
        d3.selectAll(".dynamic").filter(function(){return d3.select(this).node().classList.contains("engraved")})
        .selectAll("path").style("stroke", "black").style("fill", "black");
    }

   
        
}

export function lassoFadeOut() {
    var delay = 500;
  
    d3.select(".lasso").attr("id", "lassoFadeOut")
    .transition()
      .duration(delay)
      .style("opacity", 0)
        .on("end", function() {
            d3.select("#lassoFadeOut").remove();
        });
       
    
}





























/*
export function lassoOrV(){
    var i = g.strokeCoords.length - 1;
    
    
   
    var h = 3*5;
    var d = 3*7;//plus ou moins
    
    var pathExtract=[];
   
    var pathLength = 0.0;
    var currentLength = 0.0;
    var lastPoint = g.strokeCoords[i];
    for(var j = i; j >= 0; j--){
        currentLength = math.distance(lastPoint,g.strokeCoords[j]);
        if(pathLength + currentLength > 40){
            break;
        } else {
            pathExtract.push(g.strokeCoords[j]);
            pathLength += currentLength;
        }
       
    }
 
    const [ymin,index] = pathExtract.reduce(([min,index],[x,y],i) => {
        if(y > min){
            return [y, i];
          } else {
            return [min, index];
          }
        }, [-Infinity, -1]);
        //math.max(min, y), -Infinity);
     
    if(ymin - lastPoint[1] > h && math.distance(pathExtract[pathExtract.length-1],pathExtract[index]) + math.distance(pathExtract[index],pathExtract[0]) < 2*d+3 && math.distance(pathExtract[pathExtract.length-1],pathExtract[0])<1.1*h){//dist(pinit,pmin) + dist(pmin,p) 
       

        return true;
    } else {
        return false;
    }

     
}
*/