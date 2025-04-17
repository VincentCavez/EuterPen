
import { g } from './setup.js';
import { CHECKPOINT, deselect_all, get_y_of_system } from './tools.js';
import {generateStaffLines, generateBarLines} from './insert.js';
import { createAudioWidget } from './audio.js';


export function adjust_pensieve(contactId){
    
    var touchDelta = (g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].x.slice(-2)[0]);
    deselect_all()
    d3.select("#iconsBox").remove()
    d3.select("#currentStroke").remove()

    var oldwidth = d3.select("#pensieveContainer").node().getBoundingClientRect().width
    var newwidth = d3.max([oldwidth + touchDelta,40])
    //to the right
    if(d3.select("#pensieve").node().getBoundingClientRect().width >= parseFloat(d3.select("#freeZonesContainer").style("left"))+g.defaultPensieveWidth && g.touchPoints[contactId].x.slice(-1)[0] -g.touchPoints[contactId].x.slice(-2)[0]>0){
   
        var oldy = parseFloat(d3.select("#osmdSvgPage1").attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
        d3.select("#osmdSvgPage1").attr("transform", "translate(" + (-g.globalOffsetX+newwidth-g.defaultPensieveWidth)+ "," + oldy + ")");
        d3.select("#freeZonesContainer").style("left",(newwidth-g.defaultPensieveWidth) + "px")

        g.futureXtransform = - g.globalOffsetX+newwidth-g.defaultPensieveWidth
        d3.select("#pensieveContainer").style("width",newwidth+"px")
        d3.select("#pensieveHandle").style("left",(newwidth-40)+"px")
        d3.select("#pensieveContainer").selectAll(".iconZone").each(function(){
            if(d3.select(this).node().classList.contains("collapse") || d3.select(this).node().classList.contains("createStaff") || d3.select(this).node().classList.contains("bin") || d3.select(this).node().classList.contains("createMeasure")){
                var oldx = Number(d3.select(this).attr("x"))
                d3.select(this).attr("x",oldx+touchDelta)
            }
        })
    } else {//to the left
        d3.select("#pensieveContainer").style("width",newwidth+"px")
        d3.select("#pensieveHandle").style("left",(newwidth-40)+"px")
       
        d3.select("#pensieveContainer").selectAll(".iconZone").each(function(){
            if(d3.select(this).node().classList.contains("collapse") || d3.select(this).node().classList.contains("createStaff")){
                d3.select(this).attr("x",newwidth-35)
            } else if(d3.select(this).node().classList.contains("bin") || d3.select(this).node().classList.contains("createMeasure")){ 
                d3.select(this).attr("x",newwidth-70)
            }
        })
        if(newwidth<=40){
            d3.select("#pensieveContainer").selectAll(".iconZone").transition().duration(200).style("opacity",0)
            d3.select(".separator").transition().duration(200).style("opacity",0)
            
        } else {
            d3.select("#pensieveContainer").selectAll(".iconZone").style("opacity",1)
            d3.select(".separator").transition().duration(200).style("opacity",1)
        }
       
    }
    


   
}

export function open_pensieve(){
    d3.select("#pensieveContainer").transition().duration(300).style("width",g.defaultPensieveWidth+"px")
    d3.select("#pensieveHandle").transition().duration(300).style("left",(g.defaultPensieveWidth-40)+"px")
    d3.select("#pensieveContainer").selectAll(".iconZone").each(function(){
        if(d3.select(this).node().classList.contains("collapse") || d3.select(this).node().classList.contains("createStaff")){
            d3.select(this).transition().duration(300).attr("x",g.defaultPensieveWidth-35).style("opacity",1)
        } else if(d3.select(this).node().classList.contains("bin") || d3.select(this).node().classList.contains("createMeasure")){ 
            d3.select(this).transition().duration(300).attr("x",g.defaultPensieveWidth-70).style("opacity",1)
        } else {
            d3.select(this).transition().duration(300).style("opacity",1)
        }
    })
    d3.select(".separator").transition().duration(300).style("opacity",1)

    if(parseFloat(d3.select("#freeZonesContainer").style("left"))<=0){
        var oldy = parseFloat(d3.select("#osmdSvgPage1").attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
        d3.select("#osmdSvgPage1").transition().duration(300).attr("transform", "translate(" + (-g.globalOffsetX)+ "," + oldy + ")");
        d3.select("#freeZonesContainer").transition().duration(300).style("left","0px")
        g.xtransform = - g.globalOffsetX;
        g.pensieveWidth = g.defaultPensieveWidth;
    }
}


export function close_pensieve(){
    
    d3.select("#pensieveHandle").transition().duration(300).style("left","0px")
    d3.select("#pensieveContainer").selectAll(".iconZone").each(function(){
        if(d3.select(this).node().classList.contains("collapse") || d3.select(this).node().classList.contains("createStaff")){
            d3.select(this).transition().duration(300).attr("x",40-35).style("opacity",0)
        } else if(d3.select(this).node().classList.contains("bin") || d3.select(this).node().classList.contains("createMeasure")){ 
            d3.select(this).transition().duration(300).attr("x",40-70).style("opacity",0)
        } else {
            d3.select(this).transition().duration(300).style("opacity",0)
        }
    })
    d3.select(".separator").transition().duration(300).style("opacity",0)
    d3.select("#pensieveContainer").transition().duration(300).style("width","40px")

}



