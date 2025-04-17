
import { totalHeightofZones } from "./freeZone.js";
import { g , interpretedSymbolsInformation, shortId, symbolsInformation} from "./setup.js";
import { interpretWriting } from "./musiink.js";
import { realign, resizeMeasure} from "./modif.js";


export function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function ERRORLOG(text){
    console.log('%c '+text+' ', 'background: red; color: #bada55');
}

export function CHECKPOINT(text){
    console.log('%c '+text+' ', 'background: teal; color: #bada55');
}

export function deselect_all(){
 
    //d3.selectAll(".justEngraved").classed("justEngraved",false).classed("engraved",true)
    d3.selectAll(".justEngraved").classed("engraved",true)//en plus d'etre justengraved, on les met en engraved
    d3.selectAll(".smallBar").style("stroke","black")
    let toDeselect = d3.selectAll(".selected")//.filter(function(){
       // return d3.select(this).node().classList.contains("barLines") == false;
    //})
 
    toDeselect.each(function(){
       changePathColor(d3.select(this), "black");
    })
    toDeselect.classed("selected", false).classed("unselected",true);
    d3.selectAll(".contentSelected").classed("contentSelected",false);
    d3.select("#sliderCounter").remove();
    d3.select("#choiceIcons").remove();
    d3.select("#miniScore").remove();
    d3.select("#barLineBin").remove();
}

export function resetBigBars(except = null,except2 = null){
    
    if(except == null){
        var bigbars = d3.selectAll("rect").filter(function(){
            return d3.select(this).node().classList.contains("big")
        })
    } else if(except != null && except2 == null){//toutes les barres sauf celle de la mesure except
        var bigbars = d3.selectAll("rect").filter(function(){
            return d3.select(this).node().classList.contains("big") && this.parentNode.parentNode.getAttribute("number") != except.parentNode.getAttribute("number")
        })
     
    } else {
        var bigbars = d3.selectAll("rect").filter(function(){
            return d3.select(this).node().classList.contains("big") && this.parentNode.parentNode.getAttribute("number") != except.parentNode.getAttribute("number") && this.parentNode.parentNode.getAttribute("number") != except2.parentNode.getAttribute("number")
        })
    }
   
    if(bigbars.empty()==false){
        bigbars.each(function(){
            d3.select(this).attr("width",1).attr("x",Number(d3.select(this).attr("x"))+5).classed("big",false).attr("id",null)
            d3.select(this.parentNode).classed("selected",false).classed("unselected",true)
            changePathColor(d3.select(this.parentNode), "black");
        })
    }
}

export function changePathColor(el, color){
    if(el.empty()){return} else {
        if(el.node().classList.contains("writing")){//dans le cas où on renseigne précisément un writing
            if(color == "black"){color = g.pencilColor;}
            el.selectAll("path").style("stroke", color);
        } else {//peut contenir des writings
            el.selectAll("path,rect").filter(function(){return !this.parentNode.classList.contains("writing") || !this.parentNode.id=="pasteBox"}).each(function(){

                if(d3.select(this).style("stroke") != "none" && d3.select(this).style("stroke") != "undefined" && d3.select(this).style("stroke") != null && d3.select(this).style("stroke") != false){
                    d3.select(this).style("stroke", color);
                } 
                if(d3.select(this).style("fill") != "none" && d3.select(this).style("fill") != "undefined" && d3.select(this).style("fill") != null && d3.select(this).style("fill") != false){
                    d3.select(this).style("fill", color);
                } 
            })

            if(color == "black"){
                el.selectAll(".writing").selectAll("path").style("stroke",g.pencilColor);
            }

        }
    }
}

export function thisIsAGhost(el){
    if(el.empty()){return} else {
        if(el.node().classList.contains("writing")){
            if(color == "black"){color = g.pencilColor;}
            el.selectAll("path").style("stroke", color);
        } else {
            el.selectAll("path,rect").each(function(){

                if(d3.select(this).style("stroke") != "none" && d3.select(this).style("stroke") != "undefined" && d3.select(this).style("stroke") != null && d3.select(this).style("stroke") != false){
                    d3.select(this).style("stroke", color);
                } 
                if(d3.select(this).style("fill") != "none" && d3.select(this).style("fill") != "undefined" && d3.select(this).style("fill") != null && d3.select(this).style("fill") != false){
                    d3.select(this).style("fill", color);
                } 
            })
        }
    }
}


export function getStaffGap(){
    if(d3.select("#staff_0").empty()){
        d3.select("#osmdSvgPage1").selectAll("path").filter((d, i) => i < 2).attr('id', (d, i) => `staff${i}`)
    } 
    var y0 = d3.select("#staff0").node().getBBox().y;
    var y1 = d3.select("#staff1").node().getBBox().y;//?
    return math.abs(y1-y0);
}

export function findClosestNumber(target, numbers) {
    if (numbers.length === 0) {
      return null;
    }
  
    return numbers.reduce((closest, current) =>
      Math.abs(target - current) < Math.abs(target - closest) ? current : closest
    );
  }

export function createMultiplesArray(number, length) {
    return Array.from({ length }, (_, i) => i * number);
  }

export function axisAndDirection(contactId){
    var dir = null;
    var x = g.penPoints[contactId].x.slice(-1)[0];
    var y = g.penPoints[contactId].y.slice(-1)[0];
    var xs = g.penPoints[contactId].xstart;
    var ys = g.penPoints[contactId].ystart;

    // Calculate the angle in radians
    const angle = Math.atan2(y - ys, x - xs);
    
    // Convert radians to degrees
    const degrees = (angle * 180) / Math.PI;
    
    // Determine the cardinal direction
    if (degrees >= -45 && degrees < 45) {
        dir = 'right';
    } else if (degrees >= 45 && degrees < 135) {
        dir = 'down';
    } else if (degrees >= -135 && degrees < -45) {
        dir = 'up';
    } else {
        dir = 'left';
    }

    
    if(["left","right"].includes(dir)){
        return ["horizontal",dir];
    } else {
        return ["vertical",dir];
    }
    
}



export function idFromD3Element(el){
    
    if(g.selectionTargets == "pitches"){
        return el.node().parentNode.parentNode.getAttribute("id");
    } else if (g.selectionTargets == "accidentals"){
        
        return el.node().parentNode.getAttribute("id");  
    } else if (g.selectionTargets == "durations" || g.selectionTargets == "dynamics"){
        return el.node().getAttribute("id");
    }
}


export function smallBars(source,staffLine,elementId,ssg,selected,bbox){
    removeBars(elementId);
    
    if(selected == true){var color = g.selectedColor;} else {var color = g.pencilColor;}

    if(staffLine <= 0){
        for(var i = 0; i >= staffLine; i--){//0, -1, -2... on n'a que des staffLines entières
            
            d3.select("#osmdSvgPage1").append("line").attr("stroke",color).attr("stroke-width",1).attr("class","smallBar").attr("elementId",elementId).attr("i",i)
            .attr("x1",bbox.x-3).attr("y1",bbox.y+ssg+2*i*ssg).attr("x2",bbox.x+bbox.width+3).attr("y2",bbox.y+ssg+2*i*ssg)
        }
    } else if (staffLine >= 6){
        for(var i = 0; i <= staffLine-6; i++){//6, 7, 8... on n'a que des staffLines entières
            d3.select("#osmdSvgPage1").append("line").attr("stroke",color).attr("stroke-width",1).attr("class","smallBar").attr("elementId",elementId)
            .attr("x1",bbox.x-3).attr("y1",bbox.y-ssg-i*2*ssg).attr("x2",bbox.x+bbox.width+3).attr("y2",bbox.y-ssg-i*2*ssg)
        }
    }

}


export function removeBars(elementId){
    
    d3.selectAll(".smallBar").filter(function(){
     
        return d3.select(this).attr("elementId")==elementId;
    }).remove();//si on rentre dans la portée, on enlève les barres liées à cette note (il peut y avoir des barres liées aux autres notes du même accord)
    
}

export function refresh(){
    g.osmd.render();
    restsIntoRhythms();
}   

export function isThisNoteARest(element){
    /*
    if(isD3Selection(element)){//conversion en source
        var element = sourceFromId(idFromD3Element(element))//même si c'est un silence, il est rangé comme une note
    }
       
    if(element.sourceNote.isRestFlag==false){
        return false
    } else {
        return true
    }
    */
   var len = element.select("path").node().getTotalLength();
    if((len >= 55 && len <= 56) || (len >=98 && len <=99)){
        return true
    } else {
        return false
    }
}



function isD3Selection(element) {
    return element instanceof d3.selection;
  }


export function areTheseTwoFingersOnTheSameSystem(id1,id2){
    
    var y1 = g.touchPoints[Object.keys(g.touchPoints)[id1]].y.slice(-1)[0] - g.globalOffsetY - g.ytransform;
    var y2 = g.touchPoints[Object.keys(g.touchPoints)[id2]].y.slice(-1)[0] - g.globalOffsetY - g.ytransform;
    var dist1 = math.abs(get_y_of_system(1) + d3.select("#system_1").node().getBBox().height/2 - y1);
    var dist2 = math.abs(get_y_of_system(1) + d3.select("#system_1").node().getBBox().height/2 - y2);
   
    var system1 = null;
    var system2 = null;

    d3.selectAll('.system').each(function(){
        var num = Number(d3.select(this).attr("number"));
        var system_midY = get_y_of_system(num) + this.getBBox().height/2;

        if (math.abs(system_midY - y1) <= dist1){
            dist1 = math.abs(system_midY - y1);
            system1 = num;
        }

        if (math.abs(system_midY - y2) <= dist2){
            dist2 = math.abs(system_midY - y2);
            system2 = num;
        }
    });
   
    if(get_y_of_system(1) - y1 > 0){system1 = 0;}
    if(get_y_of_system(1) - y2 > 0){system2 = 0;}

    if (system1 == system2){
        return ["yes"];
    } else {
        return ["no",system1,system2];
    }
}

export function get_y_of_system(sysnum){
    var system = d3.select("#system_"+sysnum);
    var y = system.node().getBBox().y;
    if(system.attr("transform") != null){
        return y += Number(system.attr("transform").split(",")[1].slice(0,-1));
    } else {
        return y;
    }
}

export function fingersOrientation(point1,point2){
   
    const deltaX = Math.abs(point1.x - point2.x);
    const deltaY = Math.abs(point1.y - point2.y);
  
    // Calculate the angle in radians
    const angle = Math.atan2(deltaY, deltaX);
  
    // Define a threshold for distinguishing between horizontal and vertical
    const threshold = Math.PI / 4; // 45 degrees
  
    if (angle < threshold) {
      return "horizontal";
    } else {
      return "vertical";
    }
}

export function systemOrZone(x,y){
    y = y - g.globalOffsetY - g.ytransform;
    x = x - g.globalOffsetX - g.xtransform;// ajouter pensiveWidth ?
    
    var dist = math.abs(d3.select("#system_1").node().getBBox().y+ d3.select("#system_1").node().getBBox().height/2 - y);
    var type = "system";
    d3.selectAll('.system').each(function(){
        var system_midY = this.getBBox().y+ this.getBBox().height/2;
        if (math.abs(system_midY - y) <= dist){
            dist = math.abs(system_midY - y);
        }
    });
    d3.selectAll('.free_zone_between_systems').each(function(){
        var zone_midY = this.getBBox().y+ this.getBBox().height/2;
        if (math.abs(zone_midY - y) <= dist){
            dist = math.abs(zone_midY - y);
            type = "zone";
        }
    });
    
    return type;
}

export function findThisMeasure(x,y){
   
    y = y - g.globalOffsetY - g.ytransform;
    x = x - g.globalOffsetX - g.xtransform - g.defaultPensieveWidth;
    
    var dist = math.abs(d3.select("#system_1").node().getBBox().y+ d3.select("#system_1").node().getBBox().height/2 - y);
    var system = null;
    d3.selectAll('.system').each(function(){
        var system_midY = this.getBBox().y+ this.getBBox().height/2 + Number(d3.select(this).attr("transform").split(",")[1].slice(0,-1));
        if (math.abs(system_midY - y) <= dist){
            dist = math.abs(system_midY - y);
            system = d3.select(this);
        }
    });
   
    var measure = null;
    //prendre en compte le translate du systeme
    
    system.selectAll('.measure').each(function(){
       
        var offsetX = Number(system.attr("transform").split(",")[0].split("(")[1]);//sinon on prend son x translate
        if(d3.select(this).attr("transform") != null){
            offsetX += Number(d3.select(this).attr("transform").split(",")[0].split("(")[1]);//on ajoute l'eventuel translate de la mesure en X
        }
        var measure_X = this.getBBox().x + offsetX ;//on prend le x de la droite du staff
        if (x >= measure_X){
            measure = d3.select(this);
        }
    });
    
    return measure;
}



export function findThisStaff(x,y){
   
    x = x - g.globalOffsetX - g.xtransform - g.defaultPensieveWidth;
    y = y - g.globalOffsetY - g.ytransform;
    
    var dist = math.abs(d3.select("#system_1").node().getBBox().y+ d3.select("#system_1").node().getBBox().height/2 - y);
    var system = null;
    d3.selectAll('.system').each(function(){
        var system_midY = this.getBBox().y+ this.getBBox().height/2 + Number(d3.select(this).attr("transform").split(",")[1].slice(0,-1)) ;
        if (math.abs(system_midY - y) <= dist){
            dist = math.abs(system_midY - y);
            system = d3.select(this);
        }
    });
   
    var measure = null; 
    system.selectAll('.measure').each(function(){
        
        var offsetX = Number(system.attr("transform").split(",")[0].split("(")[1]);//translate du systeme en X
        if(d3.select(this).attr("transform") != null){
            offsetX += Number(d3.select(this).attr("transform").split(",")[0].split("(")[1]);//on ajoute l'eventuel translate de la mesure en X
        }
        var measure_X = this.getBBox().x + offsetX ;//on prend le x de la droite du staff
        if (x >= measure_X){
            measure = d3.select(this);
        }
    });
    
    var staff = null;
    var distToStaff = Infinity;
    if(measure == null){return null} else {
        measure.selectAll(".staff").each(function(){
            var staff_Y = this.getBBox().y + this.getBBox().height/2 + Number(system.attr("transform").split(",")[1].slice(0,-1));
        
            if (math.abs(staff_Y - y) <= distToStaff){
                distToStaff = math.abs(staff_Y - y);
                staff = d3.select(this);
            }
        });
    
        return staff;
    }
}
//#region POPICONS
export function popIcons(){
    d3.select("#iconsBox").remove();
    var iconNum = 6;
    var iconSize = 30;
    var iconGap = 5;
    var iconsWidth = iconNum*iconSize + (iconNum-1)*iconGap;
    
    var selectionBox = {x: Infinity, y: Infinity, width: -Infinity, height: -Infinity}
    
    if(d3.select(".lasso").empty()){//selection de mesures au doigt
        var lasso = false
        d3.selectAll(".selected").each(function() {
            var bbox = this.getBBox();
            if(bbox.width != 0 || bbox.height != 0){
                if (bbox.x < selectionBox.x) selectionBox.x = bbox.x;
                if (bbox.y < selectionBox.y) selectionBox.y = bbox.y;
                if (bbox.width + bbox.x > selectionBox.width) selectionBox.width = bbox.width + bbox.x;
                if (bbox.height + bbox.y > selectionBox.height) selectionBox.height = bbox.height + bbox.y;
            }
        })
    } else {
        var lasso = true
        var bbox = d3.select(".lasso").node().getBBox();
        selectionBox.x = bbox.x;
        selectionBox.y = bbox.y;
        selectionBox.width = bbox.width + bbox.x;
        selectionBox.height = bbox.height + bbox.y;
    }
    
    selectionBox.width = selectionBox.width - selectionBox.x;
    selectionBox.height = selectionBox.height - selectionBox.y;
    var num = Number(d3.select(d3.select(".selected").node().parentNode.parentNode).attr("system"))
    var totalHeight = 0;
    d3.selectAll(".free_zone_between_systems").filter(function(){
        return Number(d3.select(this).attr("number")) <= num
    }).each(function(){
        //totalHeight += Number(d3.select(this).select("rect").attr("height"));
        totalHeight += d3.select(this).select("rect").node().getBoundingClientRect().height;
    })
    if(d3.selectAll(".contentSelected").empty()){
        var x = selectionBox.x + selectionBox.width/2 - iconsWidth/2 - g.globalOffsetX - g.xtransform;
        var y = selectionBox.y - iconSize - iconGap - g.globalOffsetY - g.ytransform ;
    } else {
        var x = selectionBox.x + selectionBox.width/2 - iconsWidth/2;
        var y = selectionBox.y - iconSize - iconGap + totalHeight;
    }
    if(lasso == true){
        x = x - g.defaultPensieveWidth;
    } 
   
    var iconsBox = d3.select("#osmdSvgPage1").append("g").attr("id","iconsBox").attr("width",iconsWidth).attr("height",iconSize).style("z-index",1000)
  
   // d3.select("#osmdSvgPage1").append("rect").attr("width",selectionBox.width).attr("height",selectionBox.height).attr("x",selectionBox.x).attr("y",selectionBox.y - g.globalOffsetY - g.ytransform+totalHeightofZones()).attr("fill","none").attr("stroke","red")
    //d3.select("#osmdSvgPage1").append("rect").attr("x",selectionBox.x).attr("y",selectionBox.y).attr("width",selectionBox.width).attr("height",selectionBox.height).attr("fill","none").attr("stroke","black")
    iconsBox.append("rect").attr("id","iconsBoxRect").attr("x",x-iconGap).attr("y",y-iconGap).attr("width",iconsWidth+2*iconGap).attr("height",iconSize+2*iconGap).style("fill","#A5B7FF").style("stroke","none").attr("rx",2*iconGap).attr("ry",2*iconGap).style("fill-opacity",0.3)

    iconsBox.append("image").attr("href","./css/blueBin.svg").attr("class","iconSelection").attr("id","selectionBin").attr("x",x).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueCopy.svg").attr("class","iconSelection").attr("id","selectionCopy").attr("x",x+iconSize+iconGap).attr("y",y).attr("width",iconSize).attr("height",iconSize)
    iconsBox.append("image").attr("href","./css/bluePaste.svg").attr("class","iconSelection").attr("id","selectionPaste").attr("x",x+2*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/bluePlay.svg").attr("class","iconSelection").attr("id","selectionPlay").attr("x",x+3*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueSearch.svg").attr("class","iconSelection").attr("id","selectionSearch").attr("x",x+4*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

   

    if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("writing") == true && d3.select(this).attr("visibility")=="visible";}).empty() == true){
        iconsBox.append("image").attr("href","./css/orangeBeautify.svg").attr("class","iconSelection").attr("id","beautifyCancel").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        
    } else {
        iconsBox.append("image").attr("href","./css/blueBeautify.svg").attr("class","iconSelection").attr("id","selectionBeautify").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("justEngraved") == true;}).empty() == true){
            if(d3.selectAll(".selected").size()!=1){
            interpretWriting();//s'il n'y a pas de justengraved dans ce qui est sélectionné, on interprète en secret
            }
        }
    }
    
}

export function popIconsPensieve(){
    d3.select("#iconsBox").remove();
    var iconNum = 6;
    var iconSize = 30;
    var iconGap = 5;
    var iconsWidth = iconNum*iconSize + (iconNum-1)*iconGap;
    
    var selectionBox = {x: Infinity, y: Infinity, width: -Infinity, height: -Infinity}
    
    if(d3.select(".lasso").empty()){//selection de mesures au doigt
        var lasso = false
        d3.selectAll(".selected").each(function() {
            var bbox = this.getBBox();
            if(bbox.width != 0 || bbox.height != 0){
                if (bbox.x < selectionBox.x) selectionBox.x = bbox.x;
                if (bbox.y < selectionBox.y) selectionBox.y = bbox.y;
                if (bbox.width + bbox.x > selectionBox.width) selectionBox.width = bbox.width + bbox.x;
                if (bbox.height + bbox.y > selectionBox.height) selectionBox.height = bbox.height + bbox.y;
            }
        })
    } else {
        var lasso = true
        var bbox = d3.select(".lasso").node().getBBox();
        selectionBox.x = bbox.x;
        selectionBox.y = bbox.y;
        selectionBox.width = bbox.width + bbox.x;
        selectionBox.height = bbox.height + bbox.y;
    }
    
    selectionBox.width = selectionBox.width - selectionBox.x;
    selectionBox.height = selectionBox.height - selectionBox.y;
    var num = Number(d3.select(d3.select(".selected").node().parentNode.parentNode).attr("system"))///????
   
    if(d3.selectAll(".contentSelected").empty()){
        var x = selectionBox.x + selectionBox.width/2 - iconsWidth/2 - g.globalOffsetX - g.xtransform;
        var y = selectionBox.y - iconSize - iconGap - g.globalOffsetY - g.ytransform ;
    } else {
        var x = selectionBox.x + selectionBox.width/2 - iconsWidth/2;
        var y = selectionBox.y - iconSize - iconGap;
    }
    
   

    var iconsBox = d3.select("#pensieve").append("g").attr("id","iconsBox").attr("width",iconsWidth).attr("height",iconSize).style("z-index",1000)
  

   // d3.select("#osmdSvgPage1").append("rect").attr("width",selectionBox.width).attr("height",selectionBox.height).attr("x",selectionBox.x).attr("y",selectionBox.y - g.globalOffsetY - g.ytransform+totalHeightofZones()).attr("fill","none").attr("stroke","red")
    //d3.select("#osmdSvgPage1").append("rect").attr("x",selectionBox.x).attr("y",selectionBox.y).attr("width",selectionBox.width).attr("height",selectionBox.height).attr("fill","none").attr("stroke","black")
   // var iconsBox = d3.select("#osmdSvgPage1").append("g").attr("id","iconsBox").attr("width",iconsWidth).attr("height",iconSize).style("z-index",1000)
    iconsBox.append("rect").attr("id","iconsBoxRect").attr("x",x-iconGap).attr("y",y-iconGap).attr("width",iconsWidth+2*iconGap).attr("height",iconSize+2*iconGap).style("fill","#A5B7FF").style("stroke","none").attr("rx",2*iconGap).attr("ry",2*iconGap).style("fill-opacity",0.3)

    iconsBox.append("image").attr("href","./css/blueBin.svg").attr("class","iconSelection").attr("id","selectionBin").attr("x",x).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueCopy.svg").attr("class","iconSelection").attr("id","selectionCopy").attr("x",x+iconSize+iconGap).attr("y",y).attr("width",iconSize).attr("height",iconSize)
    iconsBox.append("image").attr("href","./css/bluePaste.svg").attr("class","iconSelection").attr("id","selectionPaste").attr("x",x+2*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/bluePlay.svg").attr("class","iconSelection").attr("id","selectionPlay").attr("x",x+3*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueSearch.svg").attr("class","iconSelection").attr("id","selectionSearch").attr("x",x+4*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

   

    if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("writing") == true && d3.select(this).attr("visibility")=="visible";}).empty() == true){
        iconsBox.append("image").attr("href","./css/orangeBeautify.svg").attr("class","iconSelection").attr("id","beautifyCancel").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        
    } else {
        iconsBox.append("image").attr("href","./css/blueBeautify.svg").attr("class","iconSelection").attr("id","selectionBeautify").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("justEngraved") == true;}).empty() == true){
            if(d3.selectAll(".selected").size()!=1){
            interpretWriting();//s'il n'y a pas de justengraved dans ce qui est sélectionné, on interprète en secret
            }
        }
    }
    
}

export function popIconsAroundZoneMeasure(){
    d3.select("#iconsBox").remove();
    var iconNum = 6;
    var iconSize = 30;
    var iconGap = 5;
    var iconsWidth = iconNum*iconSize + (iconNum-1)*iconGap;
    
    
    var selectionBox = {x: d3.select(".copy").node().getBoundingClientRect().x, y: d3.select(".copy").node().getBoundingClientRect().y, width: 300, height: 500}
  
    var x = selectionBox.x - g.defaultPensieveWidth + selectionBox.width/2 - iconsWidth/2;
    var y = selectionBox.y - iconSize - iconGap;
    
 
    
   // d3.select("#osmdSvgPage1").append("rect").attr("width",selectionBox.width).attr("height",selectionBox.height).attr("x",selectionBox.x).attr("y",selectionBox.y - g.globalOffsetY - g.ytransform+totalHeightofZones()).attr("fill","none").attr("stroke","red")
    //d3.select("#osmdSvgPage1").append("rect").attr("x",selectionBox.x).attr("y",selectionBox.y).attr("width",selectionBox.width).attr("height",selectionBox.height).attr("fill","none").attr("stroke","black")
    var iconsBox = d3.select("#osmdSvgPage1").append("g").attr("id","iconsBox").attr("width",iconsWidth).attr("height",iconSize).style("z-index",1000)
    iconsBox.append("rect").attr("id","iconsBoxRect").attr("x",x-iconGap).attr("y",y-iconGap).attr("width",iconsWidth+2*iconGap).attr("height",iconSize+2*iconGap).style("fill","#A5B7FF").style("stroke","none").attr("rx",2*iconGap).attr("ry",2*iconGap).style("fill-opacity",0.3)

    iconsBox.append("image").attr("href","./css/blueBin.svg").attr("class","iconSelection").attr("id","selectionBin").attr("x",x).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueCopy.svg").attr("class","iconSelection").attr("id","selectionCopy").attr("x",x+iconSize+iconGap).attr("y",y).attr("width",iconSize).attr("height",iconSize)
    iconsBox.append("image").attr("href","./css/bluePaste.svg").attr("class","iconSelection").attr("id","selectionPaste").attr("x",x+2*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/bluePlay.svg").attr("class","iconSelection").attr("id","selectionPlay").attr("x",x+3*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

    iconsBox.append("image").attr("href","./css/blueSearch.svg").attr("class","iconSelection").attr("id","selectionSearch").attr("x",x+4*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)

   

    if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("writing") == true && d3.select(this).attr("visibility")=="visible";}).empty() == true){
        iconsBox.append("image").attr("href","./css/orangeBeautify.svg").attr("class","iconSelection").attr("id","beautifyCancel").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        
    } else {
        iconsBox.append("image").attr("href","./css/blueBeautify.svg").attr("class","iconSelection").attr("id","selectionBeautify").attr("x",x+5*(iconSize+iconGap)).attr("y",y).attr("width",iconSize).attr("height",iconSize)
        if(d3.selectAll(".selected").filter(function(){return d3.select(this).node().classList.contains("justEngraved") == true;}).empty() == true){
            interpretWriting();//s'il n'y a pas de justengraved dans ce qui est sélectionné, on interprète en secret
        }
    }
    
}


//#region Miscellaneous

export function measureSelection(measure){
    if(measure.empty()){return}
    measure.classed("unselected",false).classed("selected",true)
    measure.selectAll(".staff").classed("unselected",false).classed("selected",true)
    measure.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.lines,.timeSignature,.staffBars,.barLines").classed("unselected",false).classed("selected",true)
                                                                                                                            .selectAll("path, rect").style("fill",g.selectedColor).style("stroke",g.selectedColor)
    measure.selectAll(".writing").classed("unselected",false).classed("selected",true).selectAll("path").style("stroke",g.selectedColor)
}

export function measureContentSelection(measure){
    if(measure.empty()){return}
    measure.classed("contentSelected",true)
    measure.selectAll(".staff").classed("contentSelected",true)
    measure.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.timeSignature").classed("unselected",false).classed("selected",true)
                                                                                                                            .selectAll("path, rect").style("fill",g.selectedColor).style("stroke",g.selectedColor)
    measure.selectAll(".writing").classed("unselected",false).classed("selected",true).selectAll("path").style("stroke",g.selectedColor)
}

export function measureDeselection(measure){//?
    if(measure.empty()){return}
    measure.classed("selected",false).classed("unselected",true)
    measure.selectAll(".staff").classed("selected",false).classed("unselected",true)
    measure.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.lines,.timeSignature,.staffBars,.barLines").classed("unselected",true).classed("selected",false)
                                                                                                                            .selectAll("path, rect").style("fill","black").style("stroke","black")
    measure.selectAll(".writing").classed("unselected",true).classed("selected",false).selectAll("path").style("stroke","black")
}

export function staffSelection(staff){
    if(staff.empty()){return}
    staff.classed("unselected",false).classed("selected",true)
    staff.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.lines,.timeSignature,.staffBars,.barLines").classed("unselected",false).classed("selected",true)
                                                                                                                            .selectAll("path, rect").style("fill",g.selectedColor).style("stroke",g.selectedColor)
    staff.selectAll(".writing").classed("unselected",false).classed("selected",true).selectAll("path").style("stroke",g.selectedColor)
}

export function staffContentSelection(staff){
    if(staff.empty()){return}
    staff.classed("contentSelected",true)
    staff.selectAll(".noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.timeSignature").classed("unselected",false).classed("selected",true)
                                                                                                                            .selectAll("path, rect").style("fill",g.selectedColor).style("stroke",g.selectedColor)
    staff.selectAll(".writing").classed("unselected",false).classed("selected",true).selectAll("path").style("stroke",g.selectedColor)
}
/*
export function staffDeselection(staff){//?
    if(staff.empty()){return}
    staff.classed("selected",false).classed("unselected",true)
    staff.selectAll(".writing,.noteHead,.stem,.beam,.flag,.accidental,.dynamic,.dot,.rest,.ledgerLine,.lines,.timeSignature,.clef,.staffBars,.barLines").classed("unselected",true).classed("selected",false)
                                                                                                                            .selectAll("path, rect").style("fill","black").style("stroke","black")
}
*/
export function graduallySelectMeasures(xstart,ystart,x,y){
    var firstMeasure = findThisMeasure(xstart,ystart)
    var lastMeasure = findThisMeasure(x,y)
    var firstMeasureNum = d3.min([Number(firstMeasure.attr("number")),Number(lastMeasure.attr("number"))])
    var lastMeasureNum = d3.max([Number(firstMeasure.attr("number")),Number(lastMeasure.attr("number"))])
    var arrayNum = Array(lastMeasureNum-firstMeasureNum+1).fill(0).map((x,i)=>i+firstMeasureNum)
    var measures = d3.selectAll(".measure").filter(function(){return arrayNum.includes(Number(d3.select(this).attr("number")))})
    
    deselect_all()
    measureContentSelection(measures)

}

export function graduallySelectStaffs(xstart,ystart,x,y){
    var firstStaff = findThisStaff(xstart,ystart)
    var key = firstStaff.attr("key")
    var lastStaff = findThisStaff(x,y)
    var firstStaffNum = d3.min([Number(firstStaff.attr("number")),Number(lastStaff.attr("number"))])
    var lastStaffNum = d3.max([Number(firstStaff.attr("number")),Number(lastStaff.attr("number"))])
    var arrayNum = Array(lastStaffNum-firstStaffNum+1).fill(0).map((x,i)=>i+firstStaffNum)
    var staffs = d3.selectAll(".staff").filter(function(){return arrayNum.includes(Number(d3.select(this).attr("number")))}).filter(function(){return d3.select(this).attr("key") == key})
    deselect_all()
    staffContentSelection(staffs)
  
}

export function updateJustThis(contactId){

    if(d3.select(g.penPoints[contactId].target).node().classList.contains("selected")){
        deselect_all();
        d3.select("#iconsBox").remove();
    } else {
        deselect_all();
       // if(g.penPoints[contactId].target.classList.contains("noteHead") || g.penPoints[contactId].target.classList.contains("beam") || g.penPoints[contactId].target.classList.contains("stem")){//we are moving a staff
         //   var id = g.penPoints[contactId].target.getAttribute("shortId")
           // var elementsToSelect = d3.selectAll("[shortId='"+id+"']")
        //} else {
            var elementsToSelect = d3.select(g.penPoints[contactId].target)
        //}
        elementsToSelect.classed("selected", true).classed("unselected",false)

        changePathColor(elementsToSelect, g.selectedColor);
        popIcons();
    }
}

export function sourceFromId(originalid){
   
    //const id = originalid.substring(3);
    const id = "auto"+shortId(originalid)
    for(const a in g.score[0].graphic.measureList){
        var b = g.score[0].graphic.measureList[a];
        for(const c in b){
            var d = b[c];
            for(const e in d.staffEntries){
                var f = d.staffEntries[e];
                for(const g in f.graphicalVoiceEntries){
                    var h = f.graphicalVoiceEntries[g];
                    for(const i in h.notes){
                        var j = h.notes[i];
                        if(j.getSVGId() == id){
                            //j.getSVGGElement().children[0].children[0].children[0].style.fill = "#FF0000";
                            return j
                        }
                    }
                }
            }
        }
    }
}


export function onTheScore(event){//are we sure about that ?
    if(event.clientX > g.xtransform+g.globalOffsetX+g.defaultPensieveWidth+36 && event.clientX < g.xtransform+g.globalOffsetX+g.defaultPensieveWidth+36 + d3.select("#borderlineRight").node().getBoundingClientRect().x - d3.select("#borderlineLeft").node().getBoundingClientRect().x){
        return true
    } else {
        return false
    }
     
}

export function setTimeStampAndIndex(staff){
    //var x = element.node().getBBox().x;
    var noteheads = staff.selectAll(".noteHead,.rest").nodes().sort(function(a, b) {
        var ax = a.getBBox().x;
        var bx = b.getBBox().x;
        if(a.classList.contains("justEngraved")){
            ax += Number(a.getAttribute("transform").split(",")[0].split("(")[1]);
        }
        if(b.classList.contains("justEngraved")){
            bx += Number(b.getAttribute("transform").split(",")[0].split("(")[1]); 
        }
       
        return ax - bx;
        
    });
  
    for (var i = 0; i < noteheads.length; i++) {
        if (noteheads[i].classList.contains("justEngraved")) {
            var newts = parseFloat(noteheads[i-1].getAttribute("timeStamp")) + parseFloat(noteheads[i-1].getAttribute("duration"));
            noteheads[i].setAttribute("timeStamp", newts);
            var newindex = d3.selectAll(".noteHead,.rest").filter(function(){
                return parseFloat(d3.select(this).attr("timeStamp")) == newts && !this.classList.contains("justEngraved")//on trouve les notes qui ont le même timeStamp pour trouver l'index
            }).attr("index")
       
            noteheads[i].setAttribute("index", newindex);

            var shortid = noteheads[i].getAttribute("shortId");
            staff.selectAll(".stem,.flag,.beam,.accidental").filter(function(){
                return d3.select(this).attr("shortId") == shortid
            }).attr("timeStamp", newts).attr("index", newindex);
        } 
    }
    
}

export function hideMeasureEight(){
    d3.select("#measure_8").selectAll(".symbols").attr("visibility","hidden")
  
}


export function fakeEmptyScore(){
    
    d3.selectAll(".system").filter(function(){
        return Number(d3.select(this).attr("number")) >= 4
    }).selectAll(".barLines").selectAll("rect").filter(function(){
        return Number(d3.select(this).attr("x")) != 50
    }).style("visibility","hidden").style("opacity",0)  

    d3.selectAll(".system").filter(function(){
        return Number(d3.select(this).attr("number")) >= 4
    }).selectAll(".symbols").selectAll("g").filter(function(){
        return !this.classList.contains("clef")
    }).remove()

    d3.select("#measure_8").selectAll(".barLineRight").style("visibility","hidden").style("opacity",0)  
    d3.select("#measure_8").selectAll(".symbols").remove()
    d3.select("#measure_8").selectAll(".barLines").style("visibility","hidden").attr("id","secretBarLine")

}

export function removeSecondVoiceMeasure13(){
  
    var toRemove=[4314,4334,4354,4374,4394,4414,4434,4454]
    toRemove.forEach(function(id){
        d3.selectAll("[shortId='"+id+"']").remove()
    })
        
   
}