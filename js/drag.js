import { g } from './setup.js';
import { CHECKPOINT, ERRORLOG, getStaffGap, findClosestNumber, createMultiplesArray, axisAndDirection, sourceFromId, idFromD3Element, smallBars, removeBars, popIcons } from './tools.js';

//#region draw CROSS
export function drawCross(contactId,crossSize) {
    var x = g.penPoints[contactId].x.slice(-1)[0] - g.defaultPensieveWidth;
    var y = g.penPoints[contactId].y.slice(-1)[0];
    var size = crossSize;
    var opacity = 0.5;
    var cross = d3.select("#osmdSvgPage1").append("g").attr("id","cross");
    
    cross.append("line")
            .style("stroke", "grey")
            .style("stroke-width", "1.5px")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style("opacity", opacity)
            .attr("x1", x-size)
            .attr("y1", y)
            .attr("x2", x+size)
            .attr("y2", y)

    cross.append("line")
            .style("stroke", "grey")
            .style("stroke-width", "1.5px")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style("opacity", opacity)
            .attr("x1", x)
            .attr("y1", y-size)
            .attr("x2", x)
            .attr("y2", y+size)
}

//#region CROSSED 
export function crossCrossed(contactId,crossSize) {
    var p = 2.5;
    var x = g.penPoints[contactId].x.slice(-1)[0];
    var y = g.penPoints[contactId].y.slice(-1)[0];
    var xs = g.penPoints[contactId].xstart;
    var ys = g.penPoints[contactId].ystart;

    if(math.distance([xs,ys-crossSize],[x,y])<p || math.distance([xs,ys+crossSize],[x,y])<p || math.distance([xs-crossSize,ys],[x,y])<p || math.distance([xs+crossSize,ys],[x,y])<p){
        return true
    } else {
        return false
    }
}   

//#region MOVE
export function dragMove(contactId){
   
    var ssg = 5
  
    if(!g.penPoints[contactId].target.classList.contains("selected")){//we are moving an unselected single element
        
        if(g.penPoints[contactId].axis=="vertical"){
            
            if(axisAndDirection(contactId)[1]=="up"){ssg = -ssg;} 

            var y_continuous = g.penPoints[contactId].y.slice(-1)[0] - g.penPoints[contactId].ystart;//px
            var candidates = createMultiplesArray(ssg,30);
            var y_new = findClosestNumber(y_continuous,candidates);
           
            if(g.penPoints[contactId].target.classList.contains("noteHead") || g.penPoints[contactId].target.classList.contains("beam") || g.penPoints[contactId].target.classList.contains("stem")){//we are moving a staff
                var id = g.penPoints[contactId].target.getAttribute("shortId")
                var elementsToMove = d3.selectAll("[shortId='"+id+"']")
            } else {
                var elementsToMove = d3.select(g.penPoints[contactId].target)
            }
         
            elementsToMove.selectAll("path").each(function(){
                
                if(y_new != g.penPoints[contactId].y_discrete){

                    var elementId = d3.select(this.parentNode).attr("id");
                    var source = sourceFromId(elementId);
                  
                    var originStaffLine = source.staffLine;
                   
                    var staffLineDiff = y_new/(2*Math.abs(ssg))
                    
                    var staffLine = originStaffLine - staffLineDiff;
                    
                    if(d3.select(this).attr("transform")==null){
                        var oldx = 0;
                        var oldy = 0;
                        d3.select(this).attr('old_transform', `translate(${oldx},${oldy})`);
                    } else {
                        const translateValues = d3.select(this).attr("old_transform").match(/translate\(([^,]+),([^)]+)\)/);
                        var oldx = parseFloat(translateValues[1]);
                        var oldy = parseFloat(translateValues[2]);
                    }
                    d3.select(this).attr('transform', `translate(${oldx},${y_new+oldy})`)
                    
                    
                    if(staffLine <= 0 || staffLine >= 6){//to prevent unwanted semi-lines bars
                        if(staffLine % 1 === 0){
                            var bbox = d3.select(this.parentNode).node().getBBox();
                            smallBars(source,staffLine,elementId,ssg,false,bbox);
                        } 
                    } else {
                        removeBars(elementId)
                    }
                    
                    
                }
            })
            
            
        } else {//horizontal
           
            if(g.penPoints[contactId].target.classList.contains("noteHead") || g.penPoints[contactId].target.classList.contains("beam") || g.penPoints[contactId].target.classList.contains("stem")){//we are moving a staff
                var id = g.penPoints[contactId].target.getAttribute("shortId")
                var elementsToMove = d3.selectAll("[shortId='"+id+"']")
            } else {
                var elementsToMove = d3.select(g.penPoints[contactId].target)
            }
            elementsToMove.selectAll("path").each(function(){
                if(d3.select(this).attr("transform")==null){
                    
                    var oldx = 0;
                    var oldy = 0;
                    d3.select(this).attr('old_transform', `translate(${oldx},${oldy})`);
                } else {
                    
                    const translateValues = d3.select(this).attr("old_transform").match(/translate\(([^,]+),([^)]+)\)/);
                    var oldx = parseFloat(translateValues[1]);
                    var oldy = parseFloat(translateValues[2]);
                   
                }
                d3.select(this).attr('transform', `translate(${g.penPoints[contactId].x.slice(-1)[0]-g.penPoints[contactId].xstart+oldx},${oldy})`);
            })
        }

    } else {  //we are moving a selection
        
        if(g.penPoints[contactId].axis=="vertical"){
            if(axisAndDirection(contactId)[1]=="up"){ssg = -ssg;} 

            var y_continuous = g.penPoints[contactId].y.slice(-1)[0] - g.penPoints[contactId].ystart;//px
            var candidates = createMultiplesArray(ssg,30);
            var y_new = findClosestNumber(y_continuous,candidates);

            if(y_new != g.penPoints[contactId].y_discrete){

                if(d3.select("#pasteBox").empty()==false){
                    const translateValues = d3.select("#pasteBox").attr("old_transform").match(/translate\(([^,]+),([^)]+)\)/);
                    var oldx = parseFloat(translateValues[1]);
                    var oldy = parseFloat(translateValues[2]);
                    d3.select("#pasteBox").attr("transform",`translate(${oldx},${oldy+y_new})`)
                }

                d3.selectAll(".selected").selectAll("path").each(function(){
                
                    var elementId = d3.select(this.parentNode).attr("id");
                    var source = sourceFromId(elementId);
                    
                    var originStaffLine = source.staffLine;

                    var staffLineDiff = y_new/(2*Math.abs(ssg))
                    
                    var staffLine = originStaffLine - staffLineDiff;
                    
                    if(d3.select(this).attr("transform")==null){
                        var oldx = 0;
                        var oldy = 0;
                        d3.select(this).attr('old_transform', `translate(${oldx},${oldy})`);
                    } else {
                        const translateValues = d3.select(this).attr("old_transform").match(/translate\(([^,]+),([^)]+)\)/);
                        var oldx = parseFloat(translateValues[1]);
                        var oldy = parseFloat(translateValues[2]);
                    }
                    d3.select(this).attr('transform', `translate(${oldx},${y_new+oldy})`)
                    d3.selectAll(".matchRect").filter(function(){
                        return d3.select(this).attr("source")==elementId
                    }).attr('transform', `translate(${oldx},${y_new+oldy})`)
                    removeBars(elementId)
                    if(d3.select(this.parentNode).node().classList.contains("noteHead")){
                        if(staffLine <= 0 || staffLine >= 6){
                            if(staffLine % 1 === 0){
                                var bbox = d3.select(this.parentNode).node().getBBox();
                                smallBars(source,staffLine,elementId,ssg,true,bbox);
                            } 
                        } else {
                            removeBars(elementId)
                        }
                    }
                    
                    
                })
            }
            g.penPoints[contactId].y_discrete=y_new;
        } else {
           
            d3.selectAll(".selected").selectAll("path").each(function(){
                if(d3.select(this).attr("transform")==null){
                    
                    var oldx = 0;
                    var oldy = 0;
                    d3.select(this).attr('old_transform', `translate(${oldx},${oldy})`);
                } else {
                    
                    const translateValues = d3.select(this).attr("old_transform").match(/translate\(([^,]+),([^)]+)\)/);
                    var oldx = parseFloat(translateValues[1]);
                    var oldy = parseFloat(translateValues[2]);
                }
                d3.select(this).attr('transform', `translate(${g.penPoints[contactId].x.slice(-1)[0]-g.penPoints[contactId].xstart+oldx},${oldy})`);
            
            })
        }


        
    }
}
//#region END
export function dragEnd(contactId){
    
    if(d3.selectAll(".selected").empty()){
        d3.selectAll(".smallBar").style("stroke","black")
    } else {
        d3.selectAll(".smallBar").style("stroke",g.selectedColor)
       
    }
    d3.selectAll('[transform]').each(function(){
        const translateValues = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
        var oldx = parseFloat(translateValues[1]);
        var oldy = parseFloat(translateValues[2]);

        d3.select(this).attr('old_transform', `translate(${oldx},${oldy})`);
    });
    g.penPoints[contactId].y_discrete=null;
    if(d3.select("#pasteBox").empty()==false){
        d3.select("#pasteBox").style("pointer-events","all")
    }
    if(d3.select(".copied").empty()==false){
        popIcons();
        d3.select("#iconsBox").attr("transform","translate(180,-20)")
    }
}