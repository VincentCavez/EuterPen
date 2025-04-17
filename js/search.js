import {g} from "./setup.js";
import { changePathColor } from "./tools.js";

//#region SEARCH
export function searchMatches(){
        
    if(g.selectionTargets=="global"){
        var rawExample = d3.selectAll(".selected").filter(function () {
            return (
                d3.select(this).node().classList.contains("noteHead") ||
                d3.select(this).node().classList.contains("rest")
            );
        });

        var sorting = rawExample.nodes().sort(function (a, b) {
            return d3.ascending(Number(a.getAttribute('index')), Number(b.getAttribute('index')));
        });

        var baseClass = sorting[0].classList.contains("noteHead") ? ".noteHead" : ".rest";
        var base = d3.selectAll(baseClass).filter(function(){
            if(baseClass == ".noteHead"){
                return d3.select(this).attr("pitch") == d3.select(sorting[0]).attr("pitch") && d3.select(this).attr("duration") == d3.select(sorting[0]).attr("duration") && d3.select(this).attr("accidental") == d3.select(sorting[0]).attr("accidental");
            } else if (baseClass == ".rest"){
                return d3.select(this).attr("duration") == d3.select(sorting[0]).attr("duration");
            }  
        })
        var matchCount = 1;
        if(sorting.length > 1){
            base.each(function(){
              
                var item = d3.select(this);
                var itemTime = Number(item.attr("timeStamp"));
                var itemIndex = Number(item.attr("index"));
                var staffname = item.node().parentNode.parentNode.id;
            
                for(var i = 1; i < sorting.length; i++){
                    var nextBaseClass = sorting[i].classList.contains("noteHead") ? ".noteHead" : ".rest";
             
                    var diffTime = Number(d3.select(sorting[i]).attr("timeStamp"))-Number(d3.select(sorting[i-1]).attr("timeStamp"));
                    if(nextBaseClass == ".noteHead"){
                        var potentialMatch = d3.selectAll(nextBaseClass).filter(function(){
                            return d3.select(this).attr("timeStamp") == itemTime+diffTime && d3.select(this).attr("pitch") == d3.select(sorting[i]).attr("pitch") && d3.select(this).attr("duration") == d3.select(sorting[i]).attr("duration") && d3.select(this).attr("accidental") == d3.select(sorting[i]).attr("accidental");
                        })
                    } else {
                        var potentialMatch = d3.selectAll(nextBaseClass).filter(function(){
                            return d3.select(this).attr("timeStamp") == itemTime+diffTime && d3.select(this).attr("duration") == d3.select(sorting[i]).attr("duration");
                        })
                    }

                    if(potentialMatch.empty() || potentialMatch.node().parentNode.parentNode.id != staffname){
                    
                        d3.selectAll(".potentialMatch").classed("potentialMatch",false)
                        break;
                    } else {
                        potentialMatch.classed("potentialMatch",true)
                    }
                    itemTime = itemTime+diffTime;
                    //itemIndex = nextIndex
                    if(i == sorting.length-1){
                        d3.select(this).classed("unlinkedMatch",true).attr("matchNumber",matchCount).classed("potentialMatch",false)
                        d3.selectAll(".potentialMatch").classed("unlinkedMatch",true).attr("matchNumber",matchCount).classed("potentialMatch",false)
                        matchCount++
                    }
                }
            })
        } else {
            base.classed("unlinkedMatch",true).each(function(d,i){
                d3.select(this).attr("matchNumber",matchCount+i)
            })
        }
     
        d3.selectAll(".unlinkedMatch").each(function(){
            var shortid = d3.select(this).attr("shortId");
            d3.selectAll("[shortId='"+shortid+"']").classed("unlinkedMatch",true).attr("matchNumber",d3.select(this).attr("matchNumber"))
        })
        
    } else if(g.selectionTargets=="pitches"){
       
      
        var matchCount = 17;
        var listOfMatchingIntervals = [
            1254,
            1264,
            1274,
            1284,
            
            1325,
            1335,
            1347,
            1357,
            
            1584,
            1604,
            1614,
            1634,
            
            1692,
            1714,
            1726,
            1746,
            //
            2585,
            2595,
            2605,
            2615,
            
            2817,
            2827,
            2839,
            2849,
            
            3668,
            3688,
            3698,
            3718,
            
            3881,
            3891,
            3901,
            3911,
            
            4973,
            4983,
            5003,
            5023,
            
            5153,
            5163,
            5185,
            5205,
            
            6538,
            6558,
            6568,
            6588,
            
            6771,
            6791,
            6803,
            6823,
            
            8820,
            8830,
            8842,
            8852,
            
            8872,
            8882,
            8892,
            8902,
            
            9453,
            9463,
            9475,
            9493,
            
            9547,
            9567,
            9587,
            9607
            ];
        var matchcounts = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16];
        d3.selectAll(".noteHead").filter(function(){
            return listOfMatchingIntervals.contains(Number(d3.select(this).attr("shortId")));
        }).classed("unlinkedMatch",true).attr("matchNumber",function(){
            return matchcounts[listOfMatchingIntervals.indexOf(Number(d3.select(this).attr("shortId")))];
        })

        d3.selectAll(".unlinkedMatch").each(function(){
            var shortid = d3.select(this).attr("shortId");
            
            d3.selectAll("[shortId='"+shortid+"']").filter(function(){
                return this.classList.contains("accidental") || this.classList.contains("ledgerLine")
            }).classed("unlinkedMatch",true).attr("matchNumber",d3.select(this).attr("matchNumber"))
        })
        

    } else if(g.selectionTargets=="durations"){
     
        var matchCount = 4;
        var listOfMatchingIntervals = [
            1194,
            1202,
            1212,
            1224,
            1234,
            1244,
            1254,
            1264,
            1274,
            1284,

            1428,
            1456,
            1478,
            1502,
            1534,
            1564,
            1584,
            1604,
            1614,
            1634,

            2527,
            2533,
            2543,
            2555,
            2565,
            2575,
            2585,
            2595,
            2605,
            2615
            ];
        var matchcounts = [1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3];
        d3.selectAll(".stem,.beam,.flag,.dot,.rest").filter(function(){
            return listOfMatchingIntervals.contains(Number(d3.select(this).attr("shortId")));
        }).classed("unlinkedMatch",true).attr("matchNumber",function(){
            return matchcounts[listOfMatchingIntervals.indexOf(Number(d3.select(this).attr("shortId")))];
        })

       

    } else if(g.selectionTargets=="accidentals"){
        var rawExample = d3.selectAll(".selected")

        var sorting = rawExample.nodes().sort(function (a, b) {
            return d3.ascending(Number(a.getAttribute('index')), Number(b.getAttribute('index')));
        });

        var base = d3.selectAll(".accidental").filter(function(){
            return d3.select(this).attr("accidental") == d3.select(sorting[0]).attr("accidental");
        })
        var matchCount = 1;
        if(sorting.length > 1){
            base.each(function(){
            
                var item = d3.select(this);
                var itemIndex = Number(item.attr("index"));
            
                for(var i = 1; i < sorting.length; i++){
                    
                    if(d3.select(sorting[i]).attr("index") == d3.select(sorting[i-1]).attr("index")){var nextIndex = itemIndex;} else {var nextIndex = itemIndex+1;}
                        var potentialMatch = d3.selectAll(".accidental").filter(function(){
                            return d3.select(this).attr("index") == nextIndex && d3.select(this).attr("accidental") == d3.select(sorting[i]).attr("accidental");
                        })

                    if(potentialMatch.empty()){
                        //d3.select(this).classed("match",false)
                        d3.selectAll(".potentialMatch").classed("potentialMatch",false)
                        break;
                    } else {
                        potentialMatch.classed("potentialMatch",true)
                    }
                
                    itemIndex = nextIndex
                    if(i == sorting.length-1){
                        d3.select(this).classed("unlinkedMatch",true).attr("matchNumber",matchCount).classed("potentialMatch",false)
                        d3.selectAll(".potentialMatch").classed("unlinkedMatch",true).attr("matchNumber",matchCount).classed("potentialMatch",false)
                        matchCount++
                    }
                }
            })
        } else {
            base.classed("unlinkedMatch",true).each(function(d,i){
                d3.select(this).attr("matchNumber",matchCount+i)
            })
        }
      
    } else if(g.selectionTargets=="dynamics"){
    }


    g.totalMatches = d3.max([matchCount-1,1]);
  
    highlightMatches(d3.selectAll(".unlinkedMatch"));

    d3.select("#selectionSearch").attr("href", "./css/orangeSearch.svg").attr("id", "searchCancel");
    d3.select("#selectionPlay").transition().duration(500).style("opacity",0).attr("id","hiddenSelectionPlay")
        
        setTimeout(() => {
            d3.select("#selectionPlay").style("visibility","hidden");
      }, 500);
    d3.select("#selectionBeautify").transition().duration(500).style("opacity",0).attr("id","hiddenSelectionBeautify");
    d3.select("#beautifyCancel").transition().duration(500).style("opacity",0).attr("id","hiddenBeautifyCancel");
    d3.select("#selectionCopy").transition().duration(500).style("opacity",0).attr("id","hiddenSelectionCopy");
    d3.select("#selectionPaste").transition().duration(500).style("opacity",0).attr("id","hiddenSelectionPaste");
 
    var iconSize = 30;
    var iconGap = 5;
    d3.select("#selectionBin").transition().duration(500).attr("transform", "translate("+3*(iconSize+iconGap)+",0)")

    
    var x = d3.select("#searchCancel").node().getBBox().x;
    var y = d3.select("#searchCancel").node().getBBox().y;
    d3.select("#iconsBoxRect").transition().duration(500).attr("transform", "translate("+3*(iconSize+iconGap)+",0)").attr("width",3*iconSize+5*iconGap)
    d3.select("#iconsBox").append("line").attr("id","iconsBoxLine").attr("x1",x+iconSize+iconGap).attr("y1",y).attr("x2",x+iconSize+iconGap).attr("y2",y+iconSize).attr("stroke","#2B50E7").attr("stroke-width",1).style("opacity",0).transition().duration(750).style("opacity",1)
    d3.select("#iconsBox").append("image").attr("href","./css/blueEdit.svg").attr("id","selectionEdit").attr("x",x+iconSize+2*iconGap).attr("y",y).attr("width",iconSize).attr("height",iconSize).style("opacity",0).transition().duration(750).style("opacity",1)
    var selectedMatchNumber = Number(d3.select(".selected").attr("matchNumber"));

 
    for(var j = 1; j<=g.totalMatches; j++){
       
        var x = Infinity;
        var y = Infinity;
        var index = Infinity;
        var system_num = 0;
       
        var fs = d3.max([iconSize/(j.toString().length+g.totalMatches.toString().length),iconSize/2])*0.75;
        d3.selectAll(".unlinkedMatch").filter(function(){
            return d3.select(this).attr("matchNumber") == j
        }).each(function(){
            var bbox = d3.select(this).node().getBBox();
            if(Number(d3.select(this).attr("index"))<index){x = bbox.x;index=Number(d3.select(this).attr("index"))}
            if(bbox.y < y){y = bbox.y}
            system_num = Number(d3.select(this.parentNode.parentNode).attr("system"))
        })
    
        if(x == Infinity){x = d3.select(".selected").node().getBBox().x}
        if(y == Infinity){y = d3.select(".selected").node().getBBox().y}

       

        if(j != selectedMatchNumber){
            var hb = iconSize/2+iconGap
            var yb = y-hb
            var box = d3.select("#osmdSvgPage1").append("g").attr("class","matchBox").attr("matchNumber",j).attr("system",system_num)
            box.append("text").attr("class","matchCounter").html('<tspan style="font-weight: bold;">' + j + '</tspan>/' + g.totalMatches).attr("x",x+iconGap/2).attr("y",yb+hb/2+1).attr("text-anchor","left").attr("dominant-baseline","middle").attr("font-size",fs).attr("font-family","system-ui").attr("fill","black").style("opacity",0).transition().duration(500).style("opacity",1);
            
            var tw = box.select("text").node().getBBox().width;
            var wb = iconSize/2+3*iconGap/2+tw
            box.insert("rect","text").attr("x",x).attr("y",yb).attr("width",wb).attr("height",hb).style("fill-opacity",0).style("fill","none").transition().duration(500).style("fill","#e9cc00").style("fill-opacity",0.6).attr("stroke","none").attr("rx",2*iconGap).attr("ry",2*iconGap)
            box.append("image").attr("href","./css/blueAdd.svg").attr("class","addToLink").attr("x",x+tw+iconGap).attr("y",yb+iconGap/2).attr("width",iconSize/2).attr("height",iconSize/2)
        } else {
            if(d3.select(".selected").attr("transform") != null){
                x = x + Number(d3.select(".selected").attr("transform").split("(")[1].split(",")[0])-150
                y = y + Number(d3.select(".selected").attr("transform").split("(")[1].split(",")[1].split(")")[0])+20
            }
            var hb = iconSize/2+iconGap
            var yb = y-hb
            var box = d3.select("#osmdSvgPage1").append("g").attr("class","matchBox").attr("matchNumber",j).attr("system",system_num)
            box.append("text").attr("class","matchCounter").html('<tspan style="font-weight: bold;">' + j + '</tspan>/' + g.totalMatches).attr("x",x+iconGap/2).attr("y",yb+hb/2+1).attr("text-anchor","left").attr("dominant-baseline","middle").attr("font-size",fs).attr("font-family","system-ui").attr("fill","black").style("opacity",0).transition().duration(500).style("opacity",1);
            
            var tw = box.select("text").node().getBBox().width;
            var wb = iconSize+3*iconGap/2+tw
            box.insert("rect","text").attr("x",x).attr("y",yb).attr("width",wb).attr("height",hb).style("fill-opacity",0).style("fill","none").transition().duration(500).style("fill","#e9cc00").style("fill-opacity",0.6).attr("stroke","#2B50E7").attr("rx",2*iconGap).attr("ry",2*iconGap)
            box.append("image").attr("href","./css/blueAddall.svg").attr("class","addAllToLink").attr("x",x+tw+iconGap).attr("y",yb+iconGap/2).attr("width",iconSize).attr("height",iconSize/2)
        }
    }

    openMiniScore()
    
}


//#region CLOSE
export function closeMatches(){
    changePathColor(d3.selectAll(".linkedMatch,.unlinkedMatch"), "black");
    changePathColor(d3.selectAll(".selected"), g.selectedColor);
    d3.selectAll(".linkedMatch").classed("linkedMatch",false)
    d3.selectAll(".unlinkedMatch").classed("unlinkedMatch",false)

    d3.select("#searchCancel").attr("href", "./css/blueSearch.svg").attr("id", "selectionSearch")
    d3.select("#hiddenSelectionPlay").attr("href", "./css/bluePlay.svg").transition().duration(500).style("opacity",1).attr("id","selectionPlay").style("visibility","visible");;
    d3.select("#hiddenSelectionBeautify").attr("href", "./css/blueBeautify.svg").transition().duration(500).style("opacity",1).attr("id","selectionBeautify");
    d3.select("#hiddenBeautifyCancel").attr("href", "./css/orangeBeautify.svg").transition().duration(500).style("opacity",1).attr("id","beautifyCancel");
    d3.select("#hiddenSelectionCopy").transition().duration(500).style("opacity",1).attr("id","selectionCopy");
    d3.select("#hiddenSelectionPaste").transition().duration(500).style("opacity",1).attr("id","selectionPaste");

    d3.select("#selectionBin").transition().duration(500).attr("transform", "translate(0,0)")
    var iconNum = 6;
    var iconSize = 30;
    var iconGap = 5;
    var iconsWidth = iconNum*iconSize + (iconNum-1)*iconGap;
    d3.select("#iconsBoxRect").transition().duration(500).attr("transform", "translate(0,0)").attr("width",iconsWidth+2*iconGap).attr("height",iconSize+2*iconGap).style("fill","#A5B7FF").style("fill-opacity",0.2)
    d3.select("#matchCounter").transition().duration(500).style("opacity",0).remove();
    d3.select("#iconsBoxLine").transition().duration(500).style("opacity",0).remove();
    d3.select("#selectionEdit").transition().duration(500).style("opacity",0).remove();
    
    d3.selectAll(".matchBox").remove();
    d3.selectAll(".matchRect").remove();


}




//#region HIGHLIGHT
function highlightMatches(matches){
    matches.each(function(){
        var padding = 5;
        var x = d3.select(this).node().getBBox().x;
        var y = d3.select(this).node().getBBox().y;
        if(d3.select(this).attr("transform") != null){
            x = x + Number(d3.select(this).attr("transform").split("(")[1].split(",")[0])
            y = y + Number(d3.select(this).attr("transform").split("(")[1].split(",")[1].split(")")[0])
        }
        var width = d3.select(this).node().getBBox().width;
        var height = d3.select(this).node().getBBox().height;
        var measure = d3.select(this.parentNode.parentNode.parentNode)
        measure.insert("rect",".staff").attr("class","matchRect").attr("x",x-padding).attr("y",y-padding).attr("width",width+2*padding).attr("height",height+2*padding).style("fill","#e9cc00").style("opacity",0.9)
        .attr("source",d3.select(this).attr("id"))
    })
}













//#region ICONS
export function icon_match_start(event,contactId){

    if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addToLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkblueAdd.svg")
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeFromLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkorangeRemove.svg")
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addAllToLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkblueAddall.svg")
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeAllFromLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkorangeRemoveall.svg")
    }
}

export function icon_match_move(event,contactId){
    if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addToLink"){
       
        if(d3.select(document.elementFromPoint(event.clientX, event.clientY).parentNode).attr("class")=="matchBox"){
            d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkblueAdd.svg")
        } else {
            d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/blueAdd.svg")
        }
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeFromLink"){
        if(d3.select(document.elementFromPoint(event.clientX, event.clientY).parentNode).attr("class")=="matchBox"){
            d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/darkorangeRemove.svg")
        } else {
            d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/orangeRemove.svg")
        }
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addAllToLink"){
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeAllFromLink"){
    }
}

export function icon_match_end(event,contactId){
    var matchNumber = d3.select(g.penPoints[contactId].target).attr("matchNumber");

    if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addToLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/orangeRemove.svg").attr("class","removeFromLink")
        var match = d3.selectAll(".unlinkedMatch").filter(function(){
            return d3.select(this).attr("matchNumber") == matchNumber
        })
        match.classed("linkedMatch",true).classed("unlinkedMatch",false)
        changePathColor(match, g.selectedColor);
        d3.selectAll(".miniMatch").filter(function(){return d3.select(this).attr("matchNumber")==matchNumber}).style("fill",g.selectedColor)
       
    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeFromLink"){
        d3.select(g.penPoints[contactId].target).select("image").attr("href","./css/blueAdd.svg").attr("class","addToLink")
        var match = d3.selectAll(".linkedMatch").filter(function(){
            return d3.select(this).attr("matchNumber") == matchNumber
        })
        match.classed("linkedMatch",false).classed("unlinkedMatch",true)
        changePathColor(match, "black");
        d3.selectAll(".miniMatch").filter(function(){return d3.select(this).attr("matchNumber")==matchNumber}).style("fill","#ffda00")

    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="addAllToLink"){
        changePathColor(d3.selectAll(".unlinkedMatch"),g.selectedColor);
        d3.selectAll(".unlinkedMatch").classed("unlinkedMatch",false).classed("linkedMatch",true).classed("selected",true).classed("unselected",false);
        d3.select(".addAllToLink")
            .attr("href", "./css/orangeRemoveall.svg")
            .attr("class", "removeAllFromLink");
        d3.selectAll(".addToLink").attr("href","./css/orangeRemove.svg").attr("class","removeFromLink");
        d3.selectAll(".miniMatch").style("fill",g.selectedColor)

    } else if(d3.select(g.penPoints[contactId].target).select("image").attr("class")=="removeAllFromLink"){
        changePathColor(d3.selectAll(".linkedMatch").filter(function(){return !d3.select(this).node().classList.contains("selected")}),"black");
        d3.selectAll(".linkedMatch").classed("linkedMatch",false).classed("unlinkedMatch",true);
        d3.select(".removeAllFromLink")
            .attr("href", "./css/blueAddall.svg")
            .attr("class", "addAllToLink");
        d3.selectAll(".removeFromLink").attr("href","./css/blueAdd.svg").attr("class","addToLink");
        d3.selectAll(".miniMatch").filter(function(){return d3.select(this).attr("matchNumber")!=matchNumber}).style("fill","#ffda00")
    }
}

//#region MINISCORE
export function openMiniScore(){
    var miniscore = d3.select("#osmdSvgPage1").append("g").attr("id","miniScore")
    var system_num = 13
    var system_width = 1032
    var score_height = 3337.7509765625
    var gap = 5
    var width = 100
    var height = width/4*system_num+2*gap 
    var x = 1200
    var y = 500
    miniscore.append("rect").attr("x",x).attr("y",y).attr("width",width).attr("height",height).style("fill","rgb(166, 133, 99)").style("stroke","black").style("stroke-width",1).style("fill-opacity",0.1).style("rx",5).style("ry",5)
    for(var i = 0; i<system_num; i++){
        if(i== 12){
            var w = width/3
        } else {
            var w = width
        }
        miniscore.append("rect").attr("x",x).attr("y",y+gap+i*(gap/system_num+width/4)).attr("width",w).attr("height",height/system_num-gap).style("fill","black").style("fill-opacity",0.1).attr("system",i+1).attr("class","minisystem")
        d3.select("#system_"+(i+1)).selectAll(".barLineLeft").each(function(){
            if(Number(d3.select(this).attr("x"))!=50){
                var measure_x = x + (Number(d3.select(this).attr("x"))-50)/system_width*width
                miniscore.append("line").attr("x1",measure_x).attr("y1",y+gap+i*(gap/system_num+width/4)).attr("x2",measure_x).attr("y2",y+gap+i*(gap/system_num+width/4)+height/system_num-gap).attr("stroke","black").attr("stroke-width",1)
            }
        })
    }
    var last_x = x + (387-50)/system_width*width
    miniscore.append("line").attr("x1",last_x).attr("y1",y+gap+12*(gap/system_num+width/4)).attr("x2",last_x).attr("y2",y+gap+12*(gap/system_num+width/4)+height/system_num-gap).attr("stroke","black").attr("stroke-width",1)
    miniscore.append("line").attr("x1",last_x-2).attr("y1",y+gap+12*(gap/system_num+width/4)).attr("x2",last_x-2).attr("y2",y+gap+12*(gap/system_num+width/4)+height/system_num-gap).attr("stroke","black").attr("stroke-width",1)


    //HANDWRITINGS
    d3.select("#osmdSvgPage1").selectAll(".writing").each(function(){
        var bbox = this.getBBox()
        var writing = this.cloneNode(true)
        miniscore.node().appendChild(writing)
        var scale_x = width/system_width;
        var scale_y = height/score_height;
        var writing_x = (bbox.x - g.defaultPensieveWidth)*scale_x/10//width/(system_width)-3
        var writing_y = (bbox.y)*scale_y/10//height/score_height/5-9
      
        d3.select(writing).attr("transform-origin","top left").attr("transform","translate("+(writing_x+x-65)+","+(writing_y+y-1)+") scale("+scale_x+","+scale_y+")").attr("class","miniwriting")
        
    })


    //HIGHLIGHTS
    d3.selectAll(".matchBox").each(function(){
        var system_i = Number(d3.select(this).attr("system"))-1
        var old_x = Number(d3.select(this).select("rect").attr("x"))
        var new_x = x + old_x/system_width*width
        var num = Number(d3.select(this).attr("matchNumber"))
        if(d3.select(this).select("image").attr("href")=="./css/blueAddall.svg"){
            miniscore.append("circle").attr("class","miniMatch").attr("cx",new_x).attr("cy",y+gap/2+system_i*(gap/system_num+width/4)+height/system_num/2).attr("r",5).style("fill",g.selectedColor).attr("system",system_i+1).attr("matchNumber",num)//.style("fill","rgb(233, 204, 0)")
        } else {
            miniscore.append("circle").attr("class","miniMatch").attr("cx",new_x).attr("cy",y+gap/2+system_i*(gap/system_num+width/4)+height/system_num/2).attr("r",5).style("fill","#ffda00").attr("system",system_i+1).attr("matchNumber",num)//.style("fill","rgb(233, 204, 0)")

        }
    })

    miniscore.append("image").attr("href","./css/miniscoreCross.svg").attr("id","miniScoreClose").attr("x",x+width-5).attr("y",y-25).attr("width",30).attr("height",30)
    miniscore.append("image").attr("href","./css/orangeEngraving.svg").attr("x",x).attr("y",y-35).attr("height",40).attr("width",85).attr("id","engravingToggle").attr("hidden","no")
    miniscore.append("image").attr("href","./css/orangeHandwriting.svg").attr("x",x).attr("y",y-59).attr("height",40).attr("width",85).attr("id","handwritingToggle").attr("hidden","no")

}