import { g } from './setup.js';
import {generateStaffLines, generateBarLines} from './insert.js';


export function updateMeasuresIcons(system){

    var leftLimit = d3.select("#borderlineLeft").node().getBBox().x;  
    var rightLimit = d3.select("#borderlineRight").node().getBBox().x;
    var offsetXSystem = Number(system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);
    var offsetYSystem = Number(system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);
    var size = 30;
    system.selectAll(".measure").each(function(){
        if(d3.select(this).attr("transform") == null){
            var offsetXMeasure = 0; 
            var offsetYMeasure = 0;
        } else {
            var offsetXMeasure = Number(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1]);
            var offsetYMeasure = Number(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);
        }
        
        var leftX = d3.select(this).select(".staff").node().getBBox().x
        var rightX = leftX + d3.select(this).node().getBBox().width;
        var topY = d3.select(this).select(".staff").node().getBBox().y 

        if(rightX <= leftLimit - offsetXSystem - offsetXMeasure){
            if(d3.select(this).select(".icon").empty()){d3.select(this).append("image").attr("href","./css/measuresUp.svg").attr("class","icon");}
            d3.select(this).select(".icon").attr("x",rightX - size).attr("y",topY-size).attr("width",size).attr("height",size)

        } else if (leftX >= rightLimit - offsetXSystem - offsetXMeasure){
            if(d3.select(this).select(".icon").empty()){d3.select(this).append("image").attr("href","./css/measuresDown.svg").attr("class","icon");}
            d3.select(this).select(".icon").attr("x",leftX).attr("y",topY - size).attr("width",size).attr("height",size)

        } else if (rightX > leftLimit || leftX < rightLimit && !d3.select(this).select(".icon").empty()){
            d3.select(this).select(".icon").remove();
        }
        
    })
    
    if(system.selectAll(".barLineRight").filter(function(){return Math.round(parseFloat(d3.select(this).attr("x"))) == 1067}).node().getBoundingClientRect().x!=1625 && system.select(".resize").empty()){
        var top = system.select(".staff").node().getBBox().y;
        system.append("image").attr("href","./css/brownResize.svg").attr("class","resize").attr("x",rightLimit - size).attr("y",top - size).attr("width",size).attr("height",size).attr("number",system.attr("number"))
    }
        
}

export function moveBarline(event,contactId){
    
    var measureNum = d3.select(".big").node().parentNode.parentNode.getAttribute("number")
    var systemNum = d3.select(".big").node().parentNode.parentNode.parentNode.getAttribute("number")
    //--------------------------------------//
    //             BARLINE LEFT             //
    //--------------------------------------//
        if(d3.select(".big").node().classList.contains("barLineLeft")){
            var previousMeasure = d3.select("#measure_"+(measureNum-1))
            
            var extendBy = g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart;
            previousMeasure.selectAll(".lines").selectAll("path").each(function(){
                var path = d3.select(this);
                if(path.attr("originalPath") == null){
                    path.attr("originalPath", path.attr("d"))
                }
                var pathCommand = path.attr("originalPath");
                var commands = pathCommand.split("L");
                var startCommand = commands[0].substring(1); // Remove the "M"
                var endCommand = commands[1];
                var startX = parseFloat(startCommand.split(" ")[0]);
                var startY = parseFloat(startCommand.split(" ")[1]);
                var endX = parseFloat(endCommand.split(" ")[0]);
                var newEndX = endX + extendBy;
                var newPathCommand = "M" + startX + " " + startY + "L" + newEndX + " " + startY;
                path.attr("d", newPathCommand);
            })
           
            d3.selectAll(".measure").filter(function(){
                return Number(this.getAttribute("number")) >= measureNum && Number(this.parentNode.getAttribute("number")) == systemNum
            }).attr("transform",`translate(${g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart},0)`)
            if(d3.select("#barLineBin").attr("oldleft")==null){
                d3.select("#barLineBin").attr("oldleft",parseFloat(d3.select("#barLineBin").style("left")))
            }
            d3.select("#barLineBin").style("left",parseFloat(d3.select("#barLineBin").attr("oldleft"))+(g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart)+"px")
           
            if(g.touchPoints[contactId].x.slice(-1)[0] <= g.touchPoints[contactId].xstart){
               
                var lastMeasure = d3.select("#measure_"+(measureNum))
                var extendBy = g.touchPoints[contactId].xstart - g.touchPoints[contactId].x.slice(-1)[0];
                lastMeasure.selectAll(".lines").selectAll("path").each(function(){
                    var path = d3.select(this);
                    if(path.attr("originalPath") == null){
                        path.attr("originalPath", path.attr("d"))
                    }
                    var pathCommand = path.attr("originalPath");
                    var commands = pathCommand.split("L");
                    var startCommand = commands[0].substring(1); // Remove the "M"
                    var endCommand = commands[1];
                    var startX = parseFloat(startCommand.split(" ")[0]);
                    var startY = parseFloat(startCommand.split(" ")[1]);
                    var endX = parseFloat(endCommand.split(" ")[0]);
                    var newEndX = endX + extendBy;
                    var newPathCommand = "M" + startX + " " + startY + "L" + newEndX + " " + startY;
                    path.attr("d", newPathCommand);
                })
            }

        } else {
            //---------------------------------------//
            //             BARLINE RIGHT             //
            //---------------------------------------// 
            var previousMeasure = d3.select("#measure_"+(measureNum))
        
            var extendBy = g.touchPoints[contactId].x.slice(-1)[0] - g.touchPoints[contactId].xstart;
            previousMeasure.selectAll(".lines").selectAll("path").each(function(){
                var path = d3.select(this);
                if(path.attr("originalPath") == null){
                    path.attr("originalPath", path.attr("d"))
                }
                var pathCommand = path.attr("originalPath");
                var commands = pathCommand.split("L");
                var startCommand = commands[0].substring(1); // Remove the "M"
                var endCommand = commands[1];
                var startX = parseFloat(startCommand.split(" ")[0]);
                var startY = parseFloat(startCommand.split(" ")[1]);
                var endX = parseFloat(endCommand.split(" ")[0]);
                var newEndX = endX + extendBy;
                var newPathCommand = "M" + startX + " " + startY + "L" + newEndX + " " + startY;
                path.attr("d", newPathCommand);
            })
          
            d3.selectAll(".measure").filter(function(){
                return Number(this.getAttribute("number")) > measureNum && Number(this.parentNode.getAttribute("number")) == systemNum
            }).attr("transform",`translate(${g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart},0)`)

            d3.select(".big").attr("transform",`translate(${g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart},0)`)
            if(d3.select("#barLineBin").attr("oldleft")==null){
                d3.select("#barLineBin").attr("oldleft",parseFloat(d3.select("#barLineBin").style("left")))
            }
            d3.select("#barLineBin").style("left",parseFloat(d3.select("#barLineBin").attr("oldleft"))+(g.touchPoints[contactId].x.slice(-1)[0]-g.touchPoints[contactId].xstart)+"px")
        }


}