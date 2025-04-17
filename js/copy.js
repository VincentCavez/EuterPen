import {g} from './setup.js'
import { changePathColor, findThisStaff } from './tools.js';



export function duplicate_start(event,contactId){
    //---------------------------------------------------------------------// 
    //                                 LASSO                               //     
    //---------------------------------------------------------------------//
    if(d3.selectAll(".contentSelected").empty()){//selection lasso
        var copy = d3.select(".selected").node().parentNode.parentNode.cloneNode(true);
        d3.select(copy).select(".symbols").selectAll(".unselected").filter(function(){return !this.classList.contains("clef")}).remove()
        d3.select(copy).select("#insertBox").remove()
        d3.select("#drawingPlane").node().appendChild(copy);
        if(d3.select(copy).attr("transform") == null){
            d3.select(copy).attr("transform",`translate(${g.defaultPensieveWidth},0)`).attr("id","current_copy")
        } else {
            d3.select(copy).attr("id","current_copy")
        }
        d3.select(copy).selectAll(".lines,.vf-keysignature,.clef").selectAll("path").style("opacity",0.1)
        changePathColor(d3.select(copy).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine"),"black")
        
    } else {
        //---------------------------------------------------------------------// 
        //                                 STAFF                               //     
        //---------------------------------------------------------------------//
        if(d3.selectAll(".contentSelected").filter(function(){return this.classList.contains("measure")}).empty()){//selection staff
            var copy = d3.selectAll(".contentSelected").node().cloneNode(true);
            d3.select("#drawingPlane").node().appendChild(copy);
            if(d3.select(copy).attr("transform") == null){
                d3.select(copy).attr("transform",`translate(${g.defaultPensieveWidth},0)`).attr("id","current_copy")
            } else {
                d3.select(copy).attr("id","current_copy")
            }
            d3.select(copy).selectAll(".lines,.vf-keysignature,.clef").selectAll("path").style("opacity",0.1)
            changePathColor(d3.select(copy).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine"),"black")
       
        } else {
            //---------------------------------------------------------------------// 
            //                                MEASURE                              //     
            //---------------------------------------------------------------------//
            var copy = d3.selectAll(".contentSelected").filter(function(){return this.classList.contains("measure")}).node().cloneNode(true);
            
            d3.select(copy).selectAll(".measureNumber").remove()
            d3.select("#drawingPlane").node().appendChild(copy);
            if(d3.select(copy).attr("transform") == null){
                d3.select(copy).attr("transform",`translate(${g.defaultPensieveWidth},0)`).attr("id","current_copy")
            } else {
                var x = g.touchPoints[contactId].x.slice(-1)[0]
                var y = g.touchPoints[contactId].y.slice(-1)[0]
                if(d3.select(copy).attr("where") == "zone"){
                    
                        var X = x-g.touchPoints[contactId].xstart+parseFloat(d3.select(copy).attr("oldx"))
                        var Y = y-g.touchPoints[contactId].ystart+parseFloat(d3.select(copy).attr("oldy"))
                } else {
                        var X = g.defaultPensieveWidth+x-g.touchPoints[contactId].xstart
                        var Y = y-g.touchPoints[contactId].ystart
                }
                
                d3.select(copy).attr("id","current_copy").attr("transform",`translate(${X},${Y})`)
                
            }
            d3.select(copy).selectAll(".lines,.vf-keysignature,.clef,.barLines").selectAll("path,rect").style("opacity",0.1)
            changePathColor(d3.select(copy).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine"),"black")
            var initialX = d3.select(copy).node().getBBox().x+g.defaultPensieveWidth
            var initialY = d3.select(copy).selectAll(".staffLineTop").filter(function(){return d3.select(this.parentNode.parentNode).attr("key")=="sol"}).node().getBBox().y
            var stavebottom = d3.select(copy).selectAll(".staffLineBottom").filter(function(){return d3.select(this.parentNode.parentNode).attr("key")=="sol"}).node().getBBox().y
            var stavegap = d3.select(copy).selectAll(".staffLineTop").filter(function(){return d3.select(this.parentNode.parentNode).attr("key")=="fa"}).node().getBBox().y - stavebottom
            miniSignature(initialX,initialY,stavegap)
        }
    }
    d3.select("#drawingPlane").style("z-index",1000)
}

export function duplicate_move(event,contactId){
    var x = g.touchPoints[contactId].x.slice(-1)[0]
    var y = g.touchPoints[contactId].y.slice(-1)[0]
    if(d3.select("#current_copy").attr("where") != "pensieve"){
        if(d3.select("#current_copy").attr("where") == "zone"){
            var X = x-g.touchPoints[contactId].xstart+parseFloat(d3.select("#current_copy").attr("oldx"))
            var Y = y-g.touchPoints[contactId].ystart+parseFloat(d3.select("#current_copy").attr("oldy"))
        } else {
            var X = g.defaultPensieveWidth+x-g.touchPoints[contactId].xstart
            var Y = y-g.touchPoints[contactId].ystart
        }
        d3.select("#current_copy").attr("transform",`translate(${X},${Y})`)
        d3.select(".miniSignature").attr("transform",`translate(${x-g.touchPoints[contactId].xstart},${Y})`)
        
    } else {
        var oldx = parseFloat(d3.select("#current_copy").attr("oldx"))
        var oldy = parseFloat(d3.select("#current_copy").attr("oldy"))
        d3.select("#current_copy").attr("transform",`translate(${oldx+x-g.touchPoints[contactId].xstart},${oldy+y-g.touchPoints[contactId].ystart})`)
    }
   
    if(findThisStaff(x,y) != null){//score    
        if(d3.select("#current_copy").node().classList.contains("staff")){
            var staff = findThisStaff(x,y)
            
            if(staff.select("#insertBox").empty()){//targeting full staff
                if((staff_number != staff.attr("number") || staff_number == null ) && !staff.node().classList.contains("contentSelected")){
                    var staff_number = staff.attr("number")
                 
                    staff.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").style("opacity",0.1)
                    d3.selectAll(".staff").filter(function(){return !this.classList.contains("contentSelected") && this.getAttribute("number") != staff_number}).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").style("opacity",1)
                  
                }
            } else {//targeting staff with insertBox
                if(x >= staff.select("#insertBox").node().getBoundingClientRect().x && x <= staff.select("#insertBox").node().getBoundingClientRect().x+staff.select("#insertBox").node().getBoundingClientRect().width && y >= staff.select("#insertBox").node().getBoundingClientRect().y && y <= staff.select("#insertBox").node().getBoundingClientRect().y+staff.select("#insertBox").node().getBoundingClientRect().height){
                    d3.select("#insertBox").style("opacity",1)
                } else {
                    d3.select("#insertBox").style("opacity",0)
                }
                if((staff_number != staff.attr("number") || staff_number == null ) && !staff.node().classList.contains("contentSelected")){
                    var staff_number = staff.attr("number")
              
                    d3.selectAll(".staff").filter(function(){return !this.classList.contains("contentSelected") && this.getAttribute("number") != staff_number}).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").style("opacity",1)
                  
                }
            }
        } else if (d3.select("#current_copy").node().classList.contains("measure")){
            d3.selectAll(".staff").filter(function(){return !this.classList.contains("contentSelected")}).selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").style("opacity",1)
            
        } else {
            console.log("error")
        }
    }
   
    
}

export function duplicate_end(event,contactId){
    var x = g.touchPoints[contactId].x.slice(-1)[0]
    var y = g.touchPoints[contactId].y.slice(-1)[0]
    d3.select("#drawingPlane").style("z-index",0) 


    if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id=="pensieve"){//pensieve
      
        var copy = d3.select("#current_copy").node()
        d3.select("#pensieve").node().appendChild(copy);
        d3.select(copy).selectAll(".lines,.vf-keysignature,.clef,.barLines").selectAll("path,rect").transition().duration(200).style("opacity",1)
        var transform = d3.select(copy).attr("transform").split("(")[1].split(")")[0].split(",")
        d3.select(copy).attr("id",null).classed("copy",true).attr("where","pensieve").attr("oldx",transform[0]).attr("oldy",transform[1])
    } else if (document.elementFromPoint(event.clientX, event.clientY).parentNode.classList.contains("free_zone_between_systems")){//drawingPlane
        
        var copy = d3.select("#current_copy").node()
        d3.select("#fzs_4").node().appendChild(copy);
        x = x - g.defaultPensieveWidth
      
        var offsetX =  parseFloat(d3.select("#fzsContainer_4").style("left")) + parseFloat(d3.select("#freeZonesContainer").style("left"));
        var offsetY =  parseFloat(d3.select("#fzsContainer_4").style("top")) + parseFloat(d3.select("#freeZonesContainer").style("top"));
   
        d3.select(copy).selectAll(".lines,.vf-keysignature,.clef,.barLines").selectAll("path,rect").transition().duration(200).style("opacity",1)
        var transform = d3.select(copy).attr("transform").split("(")[1].split(")")[0].split(",")
        d3.select(copy).attr("id",null).classed("copy",true).attr("where","zone").attr("oldx",transform[0]).attr("oldy",transform[1])
        d3.select(copy).attr("transform",`translate(${x-offsetX-g.touchPoints[contactId].xstart+g.defaultPensieveWidth},${y-offsetY-g.touchPoints[contactId].ystart})`)
     
    } else {//score
        var staff = findThisStaff(x,y)
      
        var copy = d3.select("#current_copy").node()
        //STAFF :
        d3.select(copy).transition().duration(200).attr("transform","translate("+842+","+0+")")
        d3.select("#staff_13").selectAll(".symbols").remove()
        d3.select(copy).selectAll(".lines").remove()

        //LASSO :
        //d3.select(copy).transition().duration(200).attr("transform","translate("+732+","+0+")")
        //d3.select("#insertBox").remove()
        //d3.select(copy).selectAll(".lines").remove()
        
        //for the scenario where we drop the measure from a zone to the score:
        //d3.select(copy).remove()
        //d3.select("#measure_8").selectAll(".symbols").attr("visibility","visible")
       
        /*
        if(staff.select("#insertBox").empty()){
            staff.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine").remove()//?
            //d3.select("#iconsBox").remove()//?
        } 
        */

    } 
   
    d3.select(".miniSignature").selectAll(".barLines,.fakeline").style("opacity",0.2)
    d3.selectAll(".keyup,.keydown,.clefup,.clefdown,.timeup,.timedown").style("opacity",1)
    
}

//#region RHYTHMIC PASTE
export function hideStaffToFakeRhythmicPaste(){
    //var toHide = [3407,3417,3427,3437,3447,3457,3467,3477,3487,3497,3507,3517,3527,3537,3547,3557];
    var toHide = [3572,3590,3600,3610,3628,3648,3668,3688,3698,3718,3871,3881,3891,3901,3911]
    d3.selectAll(".noteHead,.stem,.beam,.accidental,.ledgerLine").filter(function(){
        return toHide.includes(parseInt(d3.select(this).attr("shortId")))
    }).style("opacity",0).style("pointer-events","none").attr("class","hiddenNotes")
}
  

export function magicPaste(){
    d3.selectAll(".selected").style("opacity",0).style("pointer-events","none")
    changePathColor(d3.selectAll(".hiddenNotes"),g.selectedColor)

    d3.selectAll(".hiddenNotes").filter(function(){
        //return [3407,3417,3427,3437].includes(parseInt(d3.select(this).attr("shortId")))
        return [3572,3590,3600,3610,3628].includes(parseInt(d3.select(this).attr("shortId")))
    }).transition().duration(200).style("opacity",1)

    d3.selectAll(".hiddenNotes").filter(function(){
        //return [3447,3457,3467,3477].includes(parseInt(d3.select(this).attr("shortId")))
        return [3648,3668,3688,3698,3718].includes(parseInt(d3.select(this).attr("shortId")))
    }).transition().delay(100).duration(200).style("opacity",1)

    d3.selectAll(".hiddenNotes").filter(function(){
        //return [3487,3497,3507,3517].includes(parseInt(d3.select(this).attr("shortId")))
        return [3871,3881,3891,3901,3911].includes(parseInt(d3.select(this).attr("shortId")))
    }).transition().delay(200).duration(200).style("opacity",1)
  
}

export function hideStaffToFakeInsert(){
    insertRectangle()
    var toHide = [4227,4237,4247,4257,4267,4277,4287,4297];
    
    d3.selectAll(".noteHead,.stem,.beam,.accidental,.ledgerLine").filter(function(){
        return toHide.includes(parseInt(d3.select(this).attr("shortId")))
    }).style("opacity",0).style("pointer-events","none").attr("class","hiddenNotes")
}










export function insertRectangle(){
    var paste_x = d3.select("#vf-auto4227").node().getBoundingClientRect().x
    var paste_y = d3.select("#vf-auto4227").node().getBoundingClientRect().y - 5
    var paste_width = 163
    var paste_height = 50
 
    var paste_box = d3.select("#staff_23").append("g").attr("id","insertBox").attr("transform","translate("+888+","+1039+")").style("opacity",0)
    paste_box.append("rect").attr("id","pasteRectangle")
            .attr("x",0).attr("y",0).attr("width",paste_width).attr("height",paste_height)
            .attr("fill","#A5B7FF").attr("stroke","#2B50E7").style("fill-opacity",0.3)
            .attr("stroke-width",3).attr("rx",10).attr("ry",10).style("stroke-dasharray","8.5,8.5").style("stroke-linecap","round")
}

export function hideStaffToFakePaste(){
    pasteRectangle()
    var toHide = [4227,4237,4247,4257,4267,4277,4287,4297];
    d3.selectAll(".noteHead,.stem,.beam,.accidental,.ledgerLine").filter(function(){
        return toHide.includes(parseInt(d3.select(this).attr("shortId")))
    }).style("opacity",0).style("pointer-events","none").attr("class","hiddenNotes")
}

export function pasteRectangle(){
    var paste_width = 163
    var paste_height = 65
    var paste_box = d3.select("#staff_23").append("g").attr("id","pasteBox").attr("transform","translate("+888+","+1039+")").style("opacity",0).style("pointer-events","none").attr("old_transform","translate(888,1039)")
    paste_box.append("rect").attr("id","pasteRectangle")
            .attr("x",0).attr("y",0).attr("width",paste_width).attr("height",paste_height)
            .attr("fill","#A5B7FF").attr("stroke","#2B50E7").style("fill-opacity",0.2)
            .attr("stroke-width",3).attr("rx",10).attr("ry",10).style("stroke-dasharray","8.5,8.5").style("stroke-linecap","round")
    paste_box.append("image").attr("href","./css/PASTE.svg").attr("x",(paste_width/2-25)).attr("y",(paste_height/2-5)).attr("width",50).attr("height",10)
}

export function revealFakePaste(){
    var parent = d3.select(".copied").node().parentNode //symbols group
    
    d3.selectAll(".copied").each(function(){
        var copy = d3.select(this).node().cloneNode(true);
        parent.appendChild(copy);
        d3.select(copy).attr("transform","translate("+172+","+0+")").classed("selected",false).classed("paste",true).style("opacity",0).classed("unselected",true)
    
    })
    changePathColor(d3.selectAll(".paste"),g.selectedColor)
    d3.select("#pasteBox").transition().duration(200).style("opacity",1)
    d3.selectAll(".paste").transition().duration(200).style("opacity",1)
    d3.selectAll(".paste").classed("selected",true).classed("unselected",false).classed("paste",false)

}



export function putSelectionInPasteBox(){
    var parent = d3.select(".selected").node().parentNode //symbols group
    g.copy = true
    d3.selectAll(".selected").each(function(){
        var copy = d3.select(this).node().cloneNode(true);
        parent.appendChild(copy);
        d3.select(copy).attr("transform","translate("+172+","+0+")").classed("selected",false).classed("paste",true).style("opacity",0).classed("unselected",true)
    
    })
    
}

export function overwriteSelection(){
    d3.selectAll(".selected").remove()

    d3.selectAll(".copied").each(function(){
        var copy = d3.select(this).node().cloneNode(true);
        d3.select(this).node().parentNode.appendChild(copy);
        d3.select(copy).attr("transform","translate("+172+","+0+")").classed("selected",true).classed("paste",false).style("opacity",1).classed("unselected",false)
        changePathColor(d3.select(copy),g.selectedColor)
    })
   
}

//#region PITCH PASTE

export function pastePitches(){
    var octave = ["C","D","E","F","G","A","B"];
    var copy = [];
    var heights = [];
    var shortIds = [];
    d3.selectAll(".copied").filter(function(){
        return this.classList.contains("noteHead")
    }).each(function(){
        copy.push(d3.select(this))
        shortIds.push(parseInt(d3.select(this).attr("shortId")))
    })

    shortIds.forEach(function(id){
        d3.selectAll("[shortId='"+id+"']").filter(function(){
            return this.classList.contains("stem")
        }).each(function(){
            var path = d3.select(this).select("path").attr("d")
            let components = path.match(/[ML]|[\d.]+/g);
            heights.push(Number(components[5])-Number(components[2]))
        })
    })
    
    var diffList = [];
    d3.selectAll(".selected").filter(function(){
        return this.classList.contains("noteHead")
    }).each(function(d,i){
        var copyIndex = octave.indexOf(copy[i].attr("pitch"))
        var pasteIndex = octave.indexOf(d3.select(this).attr("pitch"))

        var diff = pasteIndex - copyIndex
        diffList.push(diff)
        d3.select(this).attr("pitch",copy[i].attr("pitch")).attr("transform",`translate(${0},${diff*g.gap/2})`)
    })

    var beamAnchors = []
    d3.selectAll(".selected").filter(function(){
        return this.classList.contains("stem")
    }).each(function(d,i){
        
            
        d3.select(this).attr("transform",`translate(${0},${diffList[i]*g.gap/2})`)
        d3.select(this).select("path").attr("d",function(){
            var path = d3.select(this).attr("d")
            let components = path.match(/[ML]|[\d.]+/g);
            components[5] = Number(components[2])+heights[i]

            if(i==0 || i==3 || i==4 || i==7){
                beamAnchors.push([Number(components[1]),components[5]+diffList[i]*g.gap/2])//the translation is directly taken into account
            }

            return "M"+components[1]+" "+components[2]+" L"+components[4]+" "+components[5]


        })
    })
    
    d3.selectAll(".selected").filter(function(){
        return this.classList.contains("beam")
    }).each(function(d,i){
        var j = i*2
        var x1 = beamAnchors[j][0]
        var y1 = beamAnchors[j][1]

        var x2 = x1
        var y2 = y1 - 5

        var x3 = beamAnchors[j+1][0]
        var y3 = beamAnchors[j+1][1] - 5

        var x4 = x3
        var y4 = y3 + 5

        d3.select(this).select("path").attr("d","M"+x1+" "+y1+" L"+x2+" "+y2+" L"+x3+" "+y3+" L"+x4+" "+y4+" Z")
    })
        
}


//#region mini SIGNATURE


export function miniSignature(measure_x,y,stave_gap){
   
    var color = "black";
    var gap = 10;
    var width = 110;
    var height = 8*gap + stave_gap
    var x = measure_x - width;

    var ms = d3.select("#drawingPlane").append("g").attr("class","miniSignature")

    var barLines = ms.append("g").attr("class","barLines").style("opacity",0.1)
    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none")
            .attr("x",x).attr("y",y).attr("width",1).attr("height",height).attr("class","barLineLeft")

    for (let j = 0; j < 2; j++){
        for(var i = 0; i < 5; i++){
            ms.append("path").attr("stroke-width",1).attr("stroke",color).attr("stroke-dasharray","none").style("opacity",0.1).attr("class","fakeline")
                .attr("d","M"+x+" "+(y+j*(4*gap+stave_gap)+gap*i)+" H"+(x+width))
        }

    }
    var offsetX = measure_x - 158
    var offsetY = y - 94
    var smalloffset = 55

    var keyup = d3.select("#staff_1").select(".vf-keysignature").node().cloneNode(true)
    d3.select(keyup).attr("class","keyup").attr("transform","translate("+offsetX+","+offsetY+")").style("opacity",0.1)
    ms.node().appendChild(keyup)

    var keydown = d3.select("#staff_4").select(".vf-keysignature").node().cloneNode(true)
    d3.select(keydown).attr("class","keydown").attr("transform","translate("+offsetX+","+(offsetY-keydown.getBBox().y+stave_gap-smalloffset)+")").style("opacity",0.1)
    ms.node().appendChild(keydown)
    
    var timeup = d3.select("#staff_1").select(".timeSignature").node().cloneNode(true)
    d3.select(timeup).attr("class","timeup").attr("transform","translate("+offsetX+","+offsetY+")").style("opacity",0.1)
    ms.node().appendChild(timeup)

    var timedown = d3.select("#staff_4").select(".timeSignature").node().cloneNode(true)
    d3.select(timedown).attr("class","timedown").attr("transform","translate("+offsetX+","+(offsetY-timedown.getBBox().y+stave_gap-smalloffset)+")").style("opacity",0.1)
    ms.node().appendChild(timedown)
    
    var clefup = d3.select("#staff_1").select(".clef").node().cloneNode(true)
    d3.select(clefup).attr("class","clefup").attr("transform","translate("+offsetX+","+offsetY+")").style("opacity",0.1)
    ms.node().appendChild(clefup)

    var clefdown = d3.select("#staff_4").select(".clef").node().cloneNode(true)
    d3.select(clefdown).attr("class","clefdown").attr("transform","translate("+offsetX+","+(offsetY-clefdown.getBBox().y+stave_gap-smalloffset)+")").style("opacity",0.1)
    ms.node().appendChild(clefdown)
  
}


