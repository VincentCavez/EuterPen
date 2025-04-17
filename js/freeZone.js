
import { g } from './setup.js';
import { CHECKPOINT, deselect_all, get_y_of_system } from './tools.js';
import {generateStaffLines, generateBarLines, generateThreeBarLines, generateFakeStaffLines} from './insert.js';
import { createAudioWidget } from './audio.js';

//#region SYSTEM ZONE
export function create_zone_between_systems(HandledSysNum,PointedSysNum){
    g.customYstart = g.touchPoints[Object.keys(g.touchPoints)[1]].ystart;
}

export function adjust_zone_between_systems(HandledSysNum,PointedSysNum){
   
    var n = math.abs(HandledSysNum-PointedSysNum)
    var touchDelta = (g.touchPoints[Object.keys(g.touchPoints)[1]].y.slice(-1)[0]-g.touchPoints[Object.keys(g.touchPoints)[1]].y.slice(-2)[0]);
    deselect_all()
    d3.select("#iconsBox").remove()
    d3.select("#currentStroke").remove()

    if(HandledSysNum < PointedSysNum){
      
       
        if(touchDelta >= 0 || (touchDelta < 0 && totalHeightofZonesBetweenFingers(HandledSysNum,PointedSysNum) > 0)){
        //--------------------------------------------------------- downward ---------------------------------------------------------
        
              
            d3.selectAll(".free_zone_between_systems").filter(function(){
                return Number(d3.select(this).attr("number")) > HandledSysNum;
            }).each(function(d,i){
                var num = Number(d3.select(this).attr("number"));
                var oldtop = parseFloat(d3.select(this.parentNode).style("top"))
                var oldheight = d3.select(this).select("rect").node().getBoundingClientRect().height;
                var newheight = d3.max([oldheight+touchDelta/(2*n),0])
                if(num <= PointedSysNum){
                    d3.select("#fzsContainer_"+num).style("height",newheight+"px")
                    d3.select("#fzsContainer_"+num).style("top",oldtop+i*touchDelta/(2*n)+"px")
                    repositionWidgets(num,newheight)
                } else {
                    d3.select("#fzsContainer_"+num).style("top",oldtop+(touchDelta/2)+"px")
                }
                    
               
            })
        
            d3.selectAll(".system").filter(function(){
                return Number(d3.select(this).attr("number")) > HandledSysNum;
            }).each(function(d,i){
                var oldx = parseFloat(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[1])
                var oldy = parseFloat(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
                if(Number(d3.select(this).attr("number")) <= PointedSysNum){
                    d3.select(this).attr("transform","translate("+oldx+","+(oldy+(i+1)*touchDelta/(2*n))+")")
                } else {
                    d3.select(this).attr("transform","translate("+oldx+","+(oldy+touchDelta/2)+")")
                }
                
              
            })

            
        //--------------------------------------------------------- upward ---------------------------------------------------------
        } 


    }

   
}

export function end_zone_between_systems(){

    g.listOfY_ZonesAndSystems = [];
    d3.selectAll(".system").each(function(){
        var num = Number(d3.select(this).attr("number"));
        var t = Number(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2]);

        var correspondingFZ = d3.select("#fzs_"+num);
      
        var y_zone = parseFloat(d3.select("#fzsContainer_"+num).style("top"))
       
        var h_zone = Number(correspondingFZ.select("rect").attr("height"));
        
        g.listOfY_ZonesAndSystems.push([y_zone,h_zone,t])
    })
   
}
//#region TOOLS
function totalHeightofZonesBetweenFingers(HandledSysNum,PointedSysNum){
    var totalHeight = 0;
    d3.selectAll(".free_zone_between_systems").filter(function(){
        return Number(d3.select(this).attr("number")) > HandledSysNum && Number(d3.select(this).attr("number")) <= PointedSysNum;
    }).each(function(){
        totalHeight += d3.select(this).select("rect").node().getBoundingClientRect().height;
    })
    return totalHeight;
}

export function totalHeightofZones(){
    var totalHeight = 0;
    d3.selectAll(".free_zone_between_systems").each(function(){
        totalHeight += d3.select(this).select("rect").node().getBoundingClientRect().height;
    })
    return totalHeight;
}


function findClosestZone(event){
    var closestZone = null;
    var closestDistance = Infinity;
    
    d3.selectAll(".free_zone_between_systems").each(function(){

        var bbox = this.parentNode.getBoundingClientRect();
        var distance = Math.abs(event.clientY - bbox.top);
        
        if (distance < closestDistance) {
            closestZone = d3.select(this);
            closestDistance = distance;
        }
        
    });
    
    return closestZone;
}

export function collapseZone(event,contactId){
    var zone = d3.select(g.penPoints[contactId].target)
    zone.select(".collapse").attr("href","./css/brownCollapse.svg")
    var duration = 200;
    if(zone.selectAll(":not(rect):not(image):not(line)").empty()){
        var wedge = 0;
    } else {
        var wedge = 10;
    }
    var shift = zone.node().parentNode.getBoundingClientRect().height-wedge;
    
    var num = Number(zone.attr("number"))
    d3.select("#fzsContainer_"+num).transition().duration(duration).style("height",(wedge+5)+"px").selectAll(".pdfWidget,.audioWidget,image").style("display","none")
    d3.select("#fzsContainer_"+num).select("rect").transition().duration(duration).style("height",(wedge)+"px")

    d3.selectAll(".free_zone_between_systems").filter(function(){
        return Number(d3.select(this).attr("number")) > num;
    }).each(function(){
        var oldtop = parseFloat(d3.select(this.parentNode).style("top"))
        d3.select("#fzsContainer_"+Number(d3.select(this).attr("number"))).transition().duration(duration).style("top",(oldtop-shift)+"px")
    })

    d3.selectAll(".system").filter(function(){
        return Number(d3.select(this).attr("number")) >= num;
    }).each(function(){
        var oldy = parseFloat(d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
        d3.select(this).transition().duration(duration).attr("transform","translate(0,"+(oldy-shift)+")")
    })
    
}


//#region MEASURE in zone
export function createGhostMeasure(contactId){
    var zone = d3.select(g.penPoints[contactId].target)

    zone.select(".createMeasure").attr("href","./css/darkMeasure.svg")
    var x = g.penPoints[contactId].x.slice(-1)[0] 
    var y = g.penPoints[contactId].y.slice(-1)[0] 
    var gap = 10
    
    var measure = d3.select("#drawingPlane").append("g").attr("class","fzs_measure_moving").attr("transform","translate("+x+","+y+")")
    var barLineHeight = 135;
    var measureWidth = 450
    generateThreeBarLines(measure,0,0,measureWidth,barLineHeight)
    for(var i = 0; i < 2; i++){
        var staff = measure.append("g").attr("class","staff");  
        var y_staff = i*(barLineHeight-4*gap)
        generateFakeStaffLines(staff,0,y_staff,110,gap,0)
    }
    for(var i = 0; i < 2; i++){
        var staff = measure.append("g").attr("class","staff");  
        var y_staff = i*(barLineHeight-4*gap)
        generateStaffLines(staff,110,y_staff,(measureWidth-110),gap,0)
    }
    
}


export function moveGhostMeasure(contactId){
 
    var x = g.penPoints[contactId].x.slice(-1)[0] 
    var y = g.penPoints[contactId].y.slice(-1)[0] 
   
    d3.select(".fzs_measure_moving").attr("transform","translate("+x+","+y+")")
}

export function releaseGhostMeasure(event,contactId){
    var zone = d3.select(g.penPoints[contactId].target)
    
    zone.select(".createMeasure").attr("href","./css/brownMeasure.svg")
 
    if(zone.attr("id")=="pensieve"){
        var thisnum = 1;
        zone.selectAll(".pensine_measure").each(function(){
            thisnum += 1;
        })
        var x = g.penPoints[contactId].x.slice(-1)[0]
        var y = g.penPoints[contactId].y.slice(-1)[0]
       
        zone.node().appendChild(d3.select(".fzs_measure_moving").node());
        zone.select(".fzs_measure_moving").attr("class","pensieve_measure").attr("number",thisnum)
       
    } else {
        var thisnum = 1;
        zone = findClosestZone(event)
        zone.selectAll(".fzs_measure").each(function(){
            thisnum += 1;
        })
        var x = g.penPoints[contactId].x.slice(-1)[0] - g.defaultPensieveWidth
        var y = g.penPoints[contactId].y.slice(-1)[0]
        var offsetX =  parseFloat(d3.select(zone.node().parentNode).style("left")) + parseFloat(d3.select(zone.node().parentNode.parentNode).style("left"));
        var offsetY =  parseFloat(d3.select(zone.node().parentNode).style("top")) + parseFloat(d3.select(zone.node().parentNode.parentNode).style("top"));
        zone.node().appendChild(d3.select(".fzs_measure_moving").node());
        zone.select(".fzs_measure_moving").attr("class","fzs_measure").attr("number",thisnum).attr("transform","translate("+(x-offsetX)+","+(y-offsetY)+")")
    }
}

//#region SYSTEM in zone
export function createGhostSystem(contactId){
    var zone = d3.select(g.penPoints[contactId].target)

    zone.select(".createStaff").attr("href","./css/darkbrownStaff.svg")
    var x = g.penPoints[contactId].x.slice(-1)[0] 
    var y = g.penPoints[contactId].y.slice(-1)[0] 
    var gap = 10
    
    var measure = d3.select("#drawingPlane").append("g").attr("class","fzs_system_moving").attr("transform","translate("+x+","+y+")")
    var barLineHeight = 135;
    var measureWidth = 10000;
    for(var i = 0; i < 2; i++){
        var key = i==0?"sol":"fa"
        var staff = measure.append("g").attr("class","staff").attr("key",key);  
        var y_staff = i*(barLineHeight-4*gap)
        generateStaffLines(staff,0,y_staff,measureWidth,gap,0)
    }
    
}


export function moveGhostSystem(contactId){
 
    var x = g.penPoints[contactId].x.slice(-1)[0] 
    var y = g.penPoints[contactId].y.slice(-1)[0] 
   
    d3.select(".fzs_system_moving").attr("transform","translate("+x+","+y+")")
}

export function releaseGhostSystem(event,contactId){
    var zone = d3.select(g.penPoints[contactId].target)
    zone.select(".createStaff").attr("href","./css/brownStaff.svg")

    if(zone.attr("id")=="pensieve"){
        var thisnum = 1;
        zone.selectAll(".pensieve_system").each(function(){
            thisnum += 1;
        })
        var x = g.penPoints[contactId].x.slice(-1)[0] 
        var y = g.penPoints[contactId].y.slice(-1)[0] 
       
        zone.node().appendChild(d3.select(".fzs_system_moving").node());
        zone.select(".fzs_system_moving").attr("class","pensieve_system").attr("number",thisnum)
    } else {

        var thisnum = 1;
        zone = findClosestZone(event)
        zone.selectAll(".pensieve_system").each(function(){
            thisnum += 1;
        })
    
        var x = g.penPoints[contactId].x.slice(-1)[0] - g.defaultPensieveWidth 
        var y = g.penPoints[contactId].y.slice(-1)[0]
        var offsetX =  parseFloat(d3.select(zone.node().parentNode).style("left")) + parseFloat(d3.select(zone.node().parentNode.parentNode).style("left"));
        var offsetY =  parseFloat(d3.select(zone.node().parentNode).style("top")) + parseFloat(d3.select(zone.node().parentNode.parentNode).style("top"));
        
        
        zone.node().appendChild(d3.select(".fzs_system_moving").node());
        zone.select(".fzs_system_moving").attr("class","pensieve_system").attr("number",thisnum).attr("transform","translate(0,0)").attr("transform","translate("+(x-offsetX)+","+(y-offsetY)+")")
    }
}







//#region MEDIA
export function createGhostMedia(icon,contactId){
    d3.select("#drawingPlane").style("z-index",1000)
    var zone = d3.select(g.penPoints[contactId].target)
    var size_icon = 40
    if(icon=="mic"){
        zone.select(".mic").attr("href","./css/darkbrownMic.svg")
        var size_w = 400
        var size_h = 80;
        var x = g.penPoints[contactId].x.slice(-1)[0] - size_w
        var y = g.penPoints[contactId].y.slice(-1)[0] - size_h
        var ghost = d3.select("#drawingPlane").append("g").attr("class","media_ghost").attr("transform","translate("+x+","+y+")")
        ghost.append("rect").attr("x",0).attr("y",0).attr("width",size_w).attr("height",size_h).attr("stroke","darkorange").attr("stroke-width",4).attr("fill","orange").attr("opacity",0.3)
                            .attr("rx",10).attr("ry",10)
       
        ghost.append("image").attr("href","./css/orangeMic.svg").attr("width",size_icon).attr("height",size_icon).attr("x",(size_w-size_icon)/2).attr("y",(size_h-size_icon)/2)
        

    } else if(icon=="camera"){
        zone.select(".camera").attr("href","./css/darkbrownCamera.svg")
        var size_w = 280
        var size_h = 200;
        var x = g.penPoints[contactId].x.slice(-1)[0] - size_w
        var y = g.penPoints[contactId].y.slice(-1)[0] - size_h
        var ghost = d3.select("#drawingPlane").append("g").attr("class","media_ghost").attr("transform","translate("+x+","+y+")")
        ghost.append("rect").attr("x",0).attr("y",0).attr("width",size_w).attr("height",size_h).attr("stroke","green").attr("stroke-width",4).attr("fill","#3fb503").attr("opacity",0.3)
                            .attr("rx",10).attr("ry",10)
        
        ghost.append("image").attr("href","./css/greenCamera.svg").attr("width",40).attr("height",40).attr("x",(size_w-size_icon)/2).attr("y",(size_h-size_icon)/2)
        

    } else if(icon=="upload"){
        zone.select(".upload").attr("href","./css/darkbrownUpload.svg") 
        var size_w = 200
        var size_h = 200
       

        var x = g.penPoints[contactId].x.slice(-1)[0] - size_w
        var y = g.penPoints[contactId].y.slice(-1)[0] - size_h
        var ghost = d3.select("#drawingPlane").append("g").attr("class","media_ghost").attr("transform","translate("+x+","+y+")")
        ghost.append("rect").attr("x",0).attr("y",0).attr("width",size_w).attr("height",size_h).attr("stroke","#595397").attr("stroke-width",4).attr("fill","#847fb8").attr("opacity",0.3)
                            .attr("rx",10).attr("ry",10).attr("stroke-dasharray","8,8")
     

    } else if(icon=="url"){
        zone.select(".url").attr("href","./css/darkbrownUrl.svg")
        var size_w = 200
        var size_h = 200;
        var x = g.penPoints[contactId].x.slice(-1)[0] - size_w
        var y = g.penPoints[contactId].y.slice(-1)[0] - size_h
        var ghost = d3.select("#drawingPlane").append("g").attr("class","media_ghost").attr("transform","translate("+x+","+y+")")
        ghost.append("rect").attr("x",0).attr("y",0).attr("width",size_w).attr("height",size_h).attr("stroke","gray").attr("stroke-width",4).attr("fill","white").attr("opacity",0.4)
                            .attr("rx",10).attr("ry",10)
        ghost.append("rect").attr("x",10).attr("y",10).attr("width",size_w-20).attr("height",20).attr("stroke","gray").attr("stroke-width",4).attr("fill","white").attr("opacity",0.4)
                            .attr("rx",10).attr("ry",10)
        ghost.append("image").attr("href","./css/grayUrl.svg").attr("width",60).attr("height",60).attr("x",(size_w-60)/2).attr("y",(size_h-60)/2)
     
    }
    
    
    
}

export function moveGhostMedia(icon,contactId){
    if(icon=="mic"){
        var size_w = 400
        var size_h = 80;
    } else if(icon=="camera"){
        var size_w = 280
        var size_h = 200;
    } else if(icon=="upload"){
        var size_w = 200
        var size_h = 200
    } else if(icon=="url"){
        var size_w = 200
        var size_h = 200;
    }
    var x = g.penPoints[contactId].x.slice(-1)[0] - size_w
    var y = g.penPoints[contactId].y.slice(-1)[0] - size_h

    d3.select(".media_ghost").attr("transform","translate("+x+","+y+")")
}

export function releaseGhostMedia(icon,event,contactId){
    d3.select("#drawingPlane").style("z-index",0)
    var zone = d3.select(g.penPoints[contactId].target)
    var parent = d3.select(g.penPoints[contactId].target.parentNode)

    if(zone.attr("class")=="free_zone_between_systems"){
        var num = Number(zone.attr("number"))
        var x = g.penPoints[contactId].x.slice(-1)[0] - (parseFloat(d3.select(event.target.parentNode.parentNode).style("left")) + parseFloat(d3.select(event.target.parentNode.parentNode.parentNode).style("left"))) ;
        var y = g.penPoints[contactId].y.slice(-1)[0] - (parseFloat(d3.select(event.target.parentNode.parentNode).style("top")) + parseFloat(d3.select(event.target.parentNode.parentNode.parentNode).style("top"))) 
    } else {
        
        var num = -1;
        var x = g.penPoints[contactId].x.slice(-1)[0]
        var y = g.penPoints[contactId].y.slice(-1)[0]
    }
    
    if(icon=="mic"){
        var size_w = 400
        var size_h = 80;
        x = x - size_w;
        y = y - size_h;
        d3.select(".media_ghost").attr("class","micWidget")
        zone.select(".mic").attr("href","./css/brownMic.svg")
        
    } else if(icon=="camera"){
        var size_w = 280
        var size_h = 200;
        x = x - size_w;
        y = y - size_h;
        d3.select(".media_ghost").attr("class","cameraWidget").transition().duration(700).style("opacity",0).remove()
        zone.select(".camera").attr("href","./css/brownCamera.svg")
        createVideoWidget(num,x,y)
        
    } else if(icon=="upload"){
        var size_w = 200
        var size_h = 200
        var w_num = d3.selectAll(".audioWidget,.pdfWidget,.photoWidget").size()
     
        var fileinput = parent.append("input").attr("type","file").attr("id","fileInput_"+w_num).attr("style","display: none;").attr("accept",".pdf, .mp3, .wav, .png, .jpg, .jpeg")
        fileinput.node().click()
        fileinput.node().addEventListener('change', function() {
            d3.select(".media_ghost").remove()
          
            if(this.files[0].type == "application/pdf"){
                x = x - 400;
                y = y - 200;
                createPdfWidget(num,this.files[0],x,y)
            } else if(this.files[0].type == "audio/mpeg"){
                x = x - size_w;
                y = y - size_h;
                createAudioWidget(num,this.files[0],x,y)
            } else {
                x = x - 280;
                y = y - 200;
                createPhotoWidget(num,this.files[0],x,y)
            }
            zone.select(".upload").attr("href","./css/brownUpload.svg")
        });
    } else if(icon=="url"){
        var size_w = 200
        var size_h = 200;
        x = x - size_w;
        y = y - size_h;
        zone.select(".url").attr("href","./css/brownUrl.svg")
        d3.select(".media_ghost").attr("class","urlWidget")
    }
    
   
}


//#region photo widget
export function createPhotoWidget(num,file,x,y){
    var size = 30
    var size_w = 280
    var size_h = 200;
    var y_photo = parseFloat(d3.select("#fzsContainer_"+num).style("top"))
  
    if(num == -1){
        var fzs_container = d3.select("#pensieveContainer")
        
    } else {
        x = x - g.defaultPensieveWidth
        var fzs_container = d3.select("#fzsContainer_"+num)
    }
    var pw_num = fzs_container.selectAll(".photoWidget").size()+1
    var test = fzs_container.append("div").style("width",size_w+size+"px").style("height",size_h+size+"px").attr("class","photoWidget").attr("id","pw_"+pw_num).style("z-index",1).style("overflow","hidden")
                        .style("position","absolute").style("left",x+"px").style("top",y+"px")

    d3.select("#osmdCanvasPage1").append("img").attr("src","./css/blackBin.svg").style("width",size+"px").style("height",size+"px").style("left",(36+x+size_w-4)+"px").style("top",(y_photo+y)+"px").style("position","absolute").attr("class","photoBin")
    
    test.append("img").attr("src",URL.createObjectURL(file)).attr("width",size_w+"px").attr("height",size_h+"px").style("position","absolute").style("top",(size-4)+"px").style("left",0)
   
    var svg = test.append("svg").style("width","280px").style("height",200+(size-4)+"px").style("position","absolute")
  
    svg.append("rect").attr("x",0).attr("y",size-4).style("width","20px").style("height","20px").classed("upperleftcorner",true).classed("corner",true)
    svg.append("rect").attr("x",260).attr("y",180+(size-4)).style("width","20px").style("height","20px").classed("lowerrightcorner",true).classed("corner",true)

}

export function selectPhotoWidget(event,contactId){
    var bla = d3.select("#photoToClose").node().cloneNode(true)
    bla.id = "bla"
    d3.select("#photoToClose").node().parentNode.appendChild(bla)
    d3.select("#bla").select("img").remove()
    d3.select("#bla").style("width","280px").style("height","200px").append("svg").style("width","100%").style("height","100%").attr("id","selectedPhoto")
    .append("rect").style("position","absolute").style("width","280px").style("height","200px").style("fill","rgb(165, 183, 255)").style("opacity",0.5).style("top",0).style("left",0)
    popIconsPhoto()
   
}

export function photoWidget_start(event,contactId){
    var x = g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0] 
    var y = g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] 
    var w = parseFloat(d3.select(event.target.parentNode).style("width"))
    var h = parseFloat(d3.select(event.target.parentNode).style("height"))
    var x_bin = parseFloat(d3.select(event.target.parentNode).style("left")) - g.defaultPensieveWidth
    var y_bin = parseFloat(d3.select(event.target.parentNode).style("top")) 
    
    d3.select("#osmdContainer").node().appendChild(event.target.parentNode)
    d3.select(event.target.parentNode).style("left",(x-w/2)+"px").style("top",(y-h/2)+"px")
   
    d3.select(".photoBin").style("left",(x_bin+size_w-4)+"px").style("top",y_bin+"px")

}

export function photoWidget_move(event,contactId){
    var size_w = 280
    var x = g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0]
    var y = g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] 
    var w = parseFloat(d3.select(event.target.parentNode).style("width"))
    var h = parseFloat(d3.select(event.target.parentNode).style("height"))
    var x_bin = parseFloat(d3.select(event.target.parentNode).style("left")) - g.defaultPensieveWidth
    var y_bin = parseFloat(d3.select(event.target.parentNode).style("top")) 
     
    d3.select(event.target.parentNode).style("left",(x-w/2)+"px").style("top",(y-h/2)+"px")
   d3.select(".photoBin").style("left",(x_bin+size_w-4)+"px").style("top",y_bin+"px")

}

export function photoWidget_end(event,contactId){
    var x = g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0]
    var y = g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] 
    var w = parseFloat(d3.select(event.target.parentNode).style("width"))
    var h = parseFloat(d3.select(event.target.parentNode).style("height"))
 
}

export function photoWidget_resize(event,contactId,corner){
    var offset = 26
    var size_w = 280
    if(corner == "upleft"){
        var top = g.penPoints[Object.keys(g.penPoints)[0]].y.slice(-1)[0]
        var left = g.penPoints[Object.keys(g.penPoints)[0]].x.slice(-1)[0]
        var oldtop = parseFloat(d3.select(".photoWidget").attr("oldtop"))
        var oldleft = parseFloat(d3.select(".photoWidget").attr("oldleft"))
        d3.select(".photoWidget").style("left",left+"px").style("top",top+"px").style("width",(280-(oldleft-left))+"px").style("height",(200-(oldtop-top))+"px")
        d3.select(".lowerrightcorner").attr("x",260-(left-oldleft)).attr("y",180-(top-oldtop))


    } else if(corner == "downright"){
     
        var top = parseFloat(d3.select(".photoWidget").style("top"))
        var left = parseFloat(d3.select(".photoWidget").style("left"))
      
        var newheight = g.penPoints[Object.keys(g.penPoints)[0]].y.slice(-1)[0] - top 
        var newwidth = g.penPoints[Object.keys(g.penPoints)[0]].x.slice(-1)[0] - left
        d3.select(".photoWidget").style("width",newwidth+"px").style("height",newheight + offset +"px")
        d3.select(".lowerrightcorner").attr("x",d3.min([newwidth-20,260])).attr("y",d3.min([newheight-20+offset,180+offset]))
        d3.select(".photoBin").style("left",(left+newwidth-4-g.defaultPensieveWidth)+"px").style("top",top+"px")
    }
}
    



export function popIconsPhoto(){
    d3.select("#iconsBox").remove();
    var iconNum = 6;
    var iconSize = 30;
    var iconGap = 5;
    var iconsWidth = iconNum*iconSize + (iconNum-1)*iconGap;
    
   var bbox = d3.select("#photoToClose").node().getBoundingClientRect();
   var selectionBox = {x: Infinity, y: Infinity, width: -Infinity, height: -Infinity}
    selectionBox.x = bbox.x;
    selectionBox.y = bbox.y;
    selectionBox.width = bbox.width + bbox.x;
    selectionBox.height = bbox.height + bbox.y;
    
    selectionBox.width = selectionBox.width - selectionBox.x;
    selectionBox.height = selectionBox.height - selectionBox.y;

    var x = selectionBox.x + selectionBox.width/2 - iconsWidth/2-g.defaultPensieveWidth;
    var y = selectionBox.y - iconSize - iconGap -10;
    
    var iconsBox = d3.select("#osmdSvgPage1").append("g").attr("id","iconsBox").attr("width",iconsWidth).attr("height",iconSize).style("z-index",1000)
    iconsBox.append("rect").attr("id","iconsBoxRect").attr("x",x-iconGap).attr("y",y-iconGap).attr("width",iconsWidth+2*iconGap).attr("height",iconSize+2*iconGap).style("fill","#A5B7FF").style("stroke","none").attr("rx",2*iconGap).attr("ry",2*iconGap).style("fill-opacity",0.3)

    iconsBox.append("image").attr("href","./css/blueBin.svg").attr("class","photoSelection").attr("id","photoBin").attr("x",x).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueCopy.svg").attr("class","iconSelection").attr("id","selectionCopy").attr("x",x+iconSize+iconGap).attr("y",y).attr("width",iconSize).attr("height",iconSize)
    iconsBox.append("image").attr("href","./css/bluePaste.svg").attr("class","iconSelection").attr("id","selectionPaste").attr("x",x+2*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/greyPlay.svg").attr("class","iconSelection").attr("id","selectionPlay").attr("x",x+3*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/greySearch.svg").attr("class","iconSelection").attr("id","selectionSearch").attr("x",x+4*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)


    iconsBox.append("image").attr("href","./css/greyBeautify.svg").attr("class","iconSelection").attr("id","beautifyCancel").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        
   
}


//#region video widget
export async function createVideoWidget(num,x,y){
    var size_w = 280
    var size_h = 200;
    if(num == -1){
        var fzs_container = d3.select("#pensieveContainer")
        
    } else {
        x = x - g.defaultPensieveWidth
        var fzs_container = d3.select("#fzsContainer_"+num)
    }
    var vw_num = fzs_container.selectAll(".videoWidget").size()+1
    fzs_container.append("video").attr("width","100%").attr("height","100%").attr("class","videoWidget").attr("id","vw_"+vw_num).style("z-index",1)


    var video = d3.select("#vw_"+vw_num).node()
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.style.width = size_w+'px';
    video.style.height = size_h+'px';
    video.style.position = 'absolute';
    video.style.left = x+'px';
    video.style.top = y+'px';

    /* Setting up the constraint */
    var facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
    var constraints = {
    audio: false,
    video: {
    facingMode: facingMode
    }
    };

    /* Stream it to video element */
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    
    video.srcObject = stream;
        

}

export function capture_videoWidget(event,contactId){
    var size_w = 280;
    var size_h = 200;
    var fzs_container = d3.select("#pensieveContainer")
   
    var video = document.querySelector("video");
      
    var test = fzs_container.append("div").attr("width",size_w+"px").attr("height",size_h+"px").attr("class","captureWidget").style("z-index",1)
        .style("position","absolute").style("left",0+"px").style("top",0+"px")

    var canvasd3 = test.append("canvas").style("position","absolute").style("left",video.style.left).style("top",video.style.top).style("width",size_w+"px").style("height",size_h+"px")
    var canvas = canvasd3.node()

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    d3.select(video).remove()
  
    canvas
        .getContext("2d")
        .drawImage(video, 0, 0,video.videoWidth, video.videoHeight);

    var svg = test.append("svg").style("left",video.style.left).style("top",video.style.top).style("width",size_w+"px").style("height",size_h+"px").style("position","absolute")

    svg.append("rect").attr("x",0).attr("y",0).style("width","20px").style("height","20px").attr("class","upperleftcorner").attr("class","corner")
    svg.append("rect").attr("x",260).attr("y",180).style("width","20px").style("height","20px").attr("class","lowerrightcorner").attr("class","corner")

   
}




//#region PDF widget
export function createPdfWidget(num,file,x,y){
    if(num == -1){
        var fzs_container = d3.select("#pensieveContainer")
        
    } else {
        x = x - g.defaultPensieveWidth
        var fzs_container = d3.select("#fzsContainer_"+num)
    }
    var pw_num = fzs_container.selectAll(".pdfWidget").size()+1
    var test = fzs_container.append("div").attr("class","pdfWidget").attr("id","pw_"+pw_num).style("z-index",1)
                                .style("position","absolute").style("left",x+"px").style("top",y+"px").style("width",800+"px").style("height",200+"px").style("background-color","white")//.style("z-index",1000)
    test.append("foreignObject").attr("x",0).attr("y",0).attr("width",800).attr("height",200).append("iframe").attr("src",URL.createObjectURL(file)).attr("width","100%").attr("height","100%")

}
//#region ICON ZONE
export function icon_zone_start(event,contactId){
    var zone = d3.select(g.penPoints[contactId].target)

    if(event.target.classList.contains("collapse")){
        zone.select(".collapse").attr("href","./css/darkCollapse.svg")
       
    } else if (event.target.classList.contains("bin")){
        zone.select(".bin").attr("href","./css/darkBin.svg")
       
    } else if (event.target.classList.contains("playPause")){
       
    }

}
export function icon_zone_end(event,contactId){
    var zone = d3.select(g.penPoints[contactId].target)
    if (event.target.classList.contains("bin")){
        zone.select(".bin").attr("href","./css/brownBin.svg")
        zone.selectAll(".writing,.fzs_measure,.fzs_system,.pdfWidget,.audioWidget").remove()
        d3.select(zone.node().parentNode).selectAll(".pdfWidget,.audioWidget").remove()
    } else if (event.target.classList.contains("collapse")){
        zone.select(".collapse").attr("href","./css/brownCollapse.svg")
        
    }
}








function repositionWidgets(num,height){
    var fzs = d3.select("#fzsContainer_"+num);
    var gap = 5;
    var size = 30;
    fzs.select(".mic").attr("y",(height/2 - 3/2*gap - 2*size)+"px")
    fzs.select(".camera").attr("y",(height/2 - gap/2 - size)+"px")
    fzs.select(".upload").attr("y",(height/2 + gap/2)+"px")
    fzs.select(".url").attr("y",(height/2 + 3/2*gap + size)+"px")

    fzs.select(".zoneSeparator").attr("y1",(height/2-5/2*gap-2*size)+"px").attr("y2",(height/2+5/2*gap+2*size)+"px")
}