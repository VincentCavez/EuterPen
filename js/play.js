import {g} from "./setup.js"
import { findThisMeasure } from "./tools.js";
import {wait} from "./tools.js"


//#region PLAY
export function playSelection(){

    g.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now()
    var selection = d3.selectAll(d3.selectAll(".selected,.justEngraved").filter(function(){
        return d3.select(this).node().classList.contains("noteHead")
    }).nodes().sort(function (a, b) {
        return d3.ascending(Number(a.getAttribute('index')), Number(b.getAttribute('index')));
    }));
    
    var startingpoint = Number(selection.nodes()[0].getAttribute("timeStamp"))

    selection.each(function(d,i){
        
        var duration = Number(d3.select(this).attr("duration"))
        var timeStamp = Number(d3.select(this).attr("timeStamp"))
        var starting_time = (timeStamp-startingpoint)
        if(d3.select(this).attr("accidental") == "flat"){
            var pitch = d3.select(this).attr("pitch")+d3.select(this).attr("octave")
        } else {
            var pitch = d3.select(this).attr("pitch")+d3.select(this).attr("accidental")+d3.select(this).attr("octave")
        }
        g.synth.triggerAttackRelease(pitch, duration, now+starting_time);
    })
   
}

//#region PLACE PIN
export function placePin(contactId){
    var delay = 500;
   
    var x = g.penPoints[contactId].x[g.penPoints[contactId].x.length-1]
    var y = d3.select("#currentStroke").node().getBBox().y+d3.select("#currentStroke").node().getBBox().height/2;

    d3.select("#currentStroke")
        .transition()
        .duration(delay)
        .style("opacity", 0)
            .on("end", function() {
                d3.select("#currentStroke").remove();
            });

    var measure = findThisMeasure(x,y);
    var system = d3.select(measure.node().parentNode);
    var elements = measure.select('.symbols').selectAll("g").nodes();

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].getBBox().x >= x - g.defaultPensieveWidth) {
            if(potentialnextElement === undefined || elements[i].getBBox().x <= potentialnextElement.getBBox().x){
                var potentialnextElement = elements[i];
            } 
            
        } 
    }
    var pinTimeStamp = d3.select(potentialnextElement).attr("timeStamp")
    x = Number(potentialnextElement.getBBox().x)
    var iconSize = 30;
    var moveWidth = 32
    var moveHeight = 32
    if(system.select(".pin").empty()){
        var pinY = Number(system.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])+system.node().getBBox().y-iconSize-moveHeight+10
        var pinHeight = system.node().getBBox().height+iconSize+moveHeight
    } else {
        var pinY = system.select(".pin").node().getBBox().y
        var pinHeight = system.select(".pin").node().getBBox().height
    } 
    var pin = system.append("g").attr("class","pin").attr("timeStamp",pinTimeStamp).attr("system",system.attr("number")).attr('index', potentialnextElement.getAttribute('index')).attr("id","pin_index")
    pin.append("rect").attr("x",x-1.5).attr("y",pinY+iconSize+moveHeight).attr("width",3).attr("height",pinHeight-iconSize-moveHeight).style("fill","#01b801").style("opacity",0.5)
    pin.append("image").attr("href","./css/greenPlay.svg").attr("x",x-iconSize/2).attr("y",pinY+moveHeight).attr("width",iconSize).attr("height",iconSize).attr("class","pinPlay")
   
}



//#region PIN
export function pin_start(event,contactId){
    if(event.target.classList.contains("pinPlay")){
        d3.select(event.target).attr("href","./css/darkgreenPlay.svg")
    } else if(event.target.classList.contains("pinStop")){
        d3.select(event.target).attr("href","./css/darkorangeStop.svg")
    } else if (event.target.classList.contains("pinMove")){
        d3.select(event.target).attr("href","./css/darkbrownMove.svg")
    }
}

export function pin_move(event,contactId){

}

export function pin_end(event,contactId){
    var icon = d3.select("#pin_index").select("image")
    var pin = d3.select("#pin_index")
    //     STOP
    if(event.target.classList.contains("pinStop")){
        icon.attr("href","./css/greenPlay.svg").attr("class","pinPlay")
        pin.select(".pinMove").style("opacity",0).transition().duration(200).style("opacity",1)
        pin.select("rect").transition().duration(200).style("fill","#01b801")
        d3.select(".movingCursor").remove()

        g.synth.context._timeouts.cancel(0);
        g.synth.dispose()

    } else {
        //     PLAY
    
        icon.attr("href","./css/orangeStop.svg").attr("class","pinStop")
        pin.select(".pinMove").style("opacity",1).transition().duration(200).style("opacity",0)
        pin.select("rect").transition().duration(200).style("fill","darkorange")
        
        if(g.synth != undefined || d3.select(".movingCursor").empty() == false){
            d3.selectAll(".movingCursor").remove()
            var otherpins = d3.selectAll(".pin").filter(function(){
                return d3.select(this).node() != pin.node()//other pins
            })
            
            otherpins.selectAll(".pinMove").transition().duration(200).style("opacity",1)
            otherpins.selectAll("rect").transition().duration(200).style("fill","#01b801")
            otherpins.selectAll(".pinStop").attr("href","./css/greenPlay.svg").attr("class","pinPlay")
            g.synth.context._timeouts.cancel(0);
            g.synth.dispose()
        }

        //creation of the movingCursor
        var movingCursor = d3.select("#osmdSvgPage1").append("g").attr("class","movingCursor").attr("timeStamp",pin.attr("timeStamp")).attr("system",pin.attr("system")).attr("index",pin.attr("index"))
        movingCursor.append("rect").attr("x",pin.select("rect").node().getBBox().x).attr("y",pin.select("rect").node().getBBox().y).attr("width",3).attr("height",pin.select("rect").node().getBBox().height).style("fill","#01b801").style("opacity",0.5)
     
       
        g.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const now = Tone.now()
        var selection = d3.selectAll(d3.selectAll(".noteHead,.rest").filter(function(){
            return Number(d3.select(this).attr("timeStamp")) >= Number(pin.attr("timeStamp"))
        }).nodes().sort(function (a, b) {
            return d3.ascending(Number(a.getAttribute('index')), Number(b.getAttribute('index')));
        }));
        
       
        var startingpoint = Number(selection.nodes()[0].getAttribute("timeStamp"))
        
        var timeStamps = []
        var durations = []

 
        selection.each(function(d,i){
            
            var duration = Number(d3.select(this).attr("duration"))
            var timeStamp = Number(d3.select(this).attr("timeStamp"))

            if(!timeStamps.includes(timeStamp)){
                timeStamps.push(timeStamp)
                durations.push(duration)
            } else if(duration < durations[timeStamps.indexOf(timeStamp)] ){
                durations[timeStamps.indexOf(timeStamp)] = duration
            }

            var starting_time = (timeStamp-startingpoint)
            if(d3.select(this).node().classList.contains("rest")){
                var pitch = null;
            } else {
                if(d3.select(this).attr("accidental") == "flat"){
                    var pitch = d3.select(this).attr("pitch")+d3.select(this).attr("octave")
                } else {
                    var pitch = d3.select(this).attr("pitch")+d3.select(this).attr("accidental")+d3.select(this).attr("octave")
                }
                g.synth.triggerAttackRelease(pitch, duration, now+starting_time);
            }
            
        })
       
        async function loopWithDelay() {
            for (var i = 0; i < timeStamps.length-1; i++) {
             
                var element = selection.filter(function(){
                    return Number(d3.select(this).attr("timeStamp")) == timeStamps[i]
                })
                
                var newsys = d3.select("#system_"+element.node().parentNode.parentNode.getAttribute("system"))
   
                if(i == 0){
                    var newdur = 0
                } else {
                    var newdur = 1000*durations[i-1]
                }
               
                var height = element.node().parentNode.parentNode.parentNode.getBBox().height
                if(element.node().classList.contains("justEngraved")){
                    var elementY = element.node().parentNode.parentNode.parentNode.getBBox().y+Number(newsys.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
                    var elementX = element.node().getBoundingClientRect().x-g.defaultPensieveWidth
                } else {
                    var elementY = element.node().parentNode.parentNode.parentNode.getBBox().y+Number(newsys.attr("transform").match(/translate\(([^,]+),([^)]+)\)/)[2])
                    var elementX = element.node().getBBox().x
                }
                movingCursor.select("rect").transition().duration(newdur).attr("x", elementX).attr("y",elementY).attr("height",height);
                await wait(newdur);
            }
        }
        loopWithDelay();
        


    } 
}
