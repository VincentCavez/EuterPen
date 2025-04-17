import { totalHeightofZones } from "./freeZone.js";
import { g , interpretedSymbolsInformation, shortId, symbolsInformation} from "./setup.js";
import { wait, changePathColor, setTimeStampAndIndex } from "./tools.js";



//#region INTERPRET

export function interpretAllWriting(){
    var r = 15;
    d3.select("#selectionBeautify").attr("href","./css/darkblueBeautify.svg")
        d3.select("#selectionPlay").attr("href","./css/darkbluePlay.svg")
        d3.select("#selectionSearch").attr("href","./css/darkblueSearch.svg")
    d3.select(".pin").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionBeautify").node().getBBox().x+r).attr("cy",d3.select("#selectionBeautify").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
        .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
        .transition().duration(1500).style("stroke-dasharray","100 0")
    d3.select("#iconsBox").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionPlay").node().getBBox().x+r).attr("cy",d3.select("#selectionPlay").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
        .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
        .transition().duration(1500).style("stroke-dasharray","100 0")
    d3.select("#iconsBox").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionSearch").node().getBBox().x+r).attr("cy",d3.select("#selectionSearch").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
        .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
        .transition().duration(1500).style("stroke-dasharray","100 0")
    setTimeout(function(){
        d3.selectAll(".waitingCircle").remove()
        d3.select("#selectionBeautify").attr("href","./css/blueBeautify.svg")
        d3.select("#selectionPlay").attr("href","./css/bluePlay.svg")
        d3.select("#selectionSearch").attr("href","./css/blueSearch.svg")
    },1500)
    var selectedWritings = d3.selectAll(".writing")
    
    var staffId = 0;
    var solToBeautify = selectedWritings.filter(function(){
        staffId = d3.select(this.parentNode).attr("number");
        return d3.select(this.parentNode).attr("key")=="sol";
    })
    
    var faToBeautify = selectedWritings.filter(function(){
        return d3.select(this.parentNode).attr("key")=="fa";
    })
 

    callMIIS(solToBeautify,faToBeautify);

    wait(1500).then(function(){
    
        if(solToBeautify.empty() == false){
            solRefining(solToBeautify);

        }
        
    }).then(function(){
    
        if(faToBeautify.empty() == false){
            faRefining(faToBeautify);
        }
    })
    

}

export function interpretWriting(){

        var r = 15;
        d3.select("#selectionBeautify").attr("href","./css/darkblueBeautify.svg")
            d3.select("#selectionPlay").attr("href","./css/darkbluePlay.svg")
            d3.select("#selectionSearch").attr("href","./css/darkblueSearch.svg")
        d3.select("#iconsBox").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionBeautify").node().getBBox().x+r).attr("cy",d3.select("#selectionBeautify").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
            .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
            .transition().duration(1500).style("stroke-dasharray","100 0")
        d3.select("#iconsBox").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionPlay").node().getBBox().x+r).attr("cy",d3.select("#selectionPlay").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
            .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
            .transition().duration(1500).style("stroke-dasharray","100 0")
        d3.select("#iconsBox").append("circle").style("transform-origin","center").attr("cx",d3.select("#selectionSearch").node().getBBox().x+r).attr("cy",d3.select("#selectionSearch").node().getBBox().y+r).attr("r",r).attr("class","waitingCircle")
            .style("stroke","#2B50E7").style("fill","transparent").style("stroke-width","3").style("stroke-dasharray","0 100").style("stroke-dashoffset","30")
            .transition().duration(1500).style("stroke-dasharray","100 0")
        setTimeout(function(){
            d3.selectAll(".waitingCircle").remove()
            d3.select("#selectionBeautify").attr("href","./css/blueBeautify.svg")
            d3.select("#selectionPlay").attr("href","./css/bluePlay.svg")
            d3.select("#selectionSearch").attr("href","./css/blueSearch.svg")
        },1500)
        var selectedWritings = d3.selectAll(".selected").filter(function(){
            return d3.select(this).node().classList.contains("writing")
        })
        
        var staffId = 0;
        var solToBeautify = selectedWritings.filter(function(){
            staffId = d3.select(this.parentNode).attr("number");
            return d3.select(this.parentNode).attr("key")=="sol";
        })
      
        var faToBeautify = selectedWritings.filter(function(){
            return d3.select(this.parentNode).attr("key")=="fa";
        })
     

        callMIIS(solToBeautify,faToBeautify);

        wait(1500).then(function(){
        
            if(solToBeautify.empty() == false){
                solRefining(solToBeautify);
            }
         
        }).then(function(){
        
            if(faToBeautify.empty() == false){
                faRefining(faToBeautify);
            }
        })
        

}



//#region CallMIIS
function callMIIS(solToBeautify,faToBeautify){
    if(solToBeautify.size()>0 && faToBeautify.size()==0){
            
        var strokesSol = convertTraces(solToBeautify);
        
        var topSol = d3.select(solToBeautify.nodes()[0].parentNode).select(".staffLineTop").node().getBBox().y
        


        let jinkSol = {"formats": [
                        {"channels": [{"name": "X", "type": "float32"},
                                    {"name": "Y", "type": "float32"}]}],
                    "strokes": strokesSol,
                    "active-strokes": `[0:0,${strokesSol.length-1}:${strokesSol[strokesSol.length-1]["X"].length-1}]`,
                    "tags": [{
                        "name": "STAFF",
                        "segment": `[0:0,${strokesSol.length-1}:${strokesSol[strokesSol.length-1]["X"].length-1}]`,
                        "data": {
                        "count": 5,
                        "top": topSol,
                        "gap": g.gap
                        },
                        "id": 1 }
                    ],                   
                    "new-tag-id": 2
                };
        
       
        sendJINKForRecog(jinkSol,null);

    } else if (solToBeautify.size()==0 && faToBeautify.size()>0){
           
      
        var strokesFa = convertTraces(faToBeautify);
        var topFa = d3.select(faToBeautify.nodes()[0].parentNode).select(".staffLineTop").node().getBBox().y


        
        let jinkFa = {"formats": [
                    {"channels": [{"name": "X", "type": "float32"},
                                {"name": "Y", "type": "float32"}]}],
                "strokes": strokesFa,
                "active-strokes": `[0:0,${strokesFa.length-1}:${strokesFa[strokesFa.length-1]["X"].length-1}]`,
                "tags": [{
                    "name": "STAFF",
                    "segment": `[0:0,${strokesFa.length-1}:${strokesFa[strokesFa.length-1]["X"].length-1}]`,
                    "data": {
                    "count": 5,
                    "top": topFa,
                    "gap": g.gap
                    },
                    "id": 1 }
                ],                   
                "new-tag-id": 2
            };
   
        sendJINKForRecog(null,jinkFa);

    } else if (solToBeautify.size()>0 && faToBeautify.size()>0){
           
        var strokesSol = convertTraces(solToBeautify);
        var strokesFa = convertTraces(faToBeautify);

        var topSol = d3.select(solToBeautify.nodes()[0].parentNode).select(".staffLineTop").node().getBBox().y
        var topFa = d3.select(faToBeautify.nodes()[0].parentNode).select(".staffLineTop").node().getBBox().y


        let jinkSol = {"formats": [
                        {"channels": [{"name": "X", "type": "float32"},
                                    {"name": "Y", "type": "float32"}]}],
                    "strokes": strokesSol,
                    "active-strokes": `[0:0,${strokesSol.length-1}:${strokesSol[strokesSol.length-1]["X"].length-1}]`,
                    "tags": [{
                        "name": "STAFF",
                        "segment": `[0:0,${strokesSol.length-1}:${strokesSol[strokesSol.length-1]["X"].length-1}]`,
                        "data": {
                        "count": 5,
                        "top": topSol,
                        "gap": g.gap
                        },
                        "id": 1 }
                    ],                   
                    "new-tag-id": 2
                };
        
        let jinkFa = {"formats": [
                    {"channels": [{"name": "X", "type": "float32"},
                                {"name": "Y", "type": "float32"}]}],
                "strokes": strokesFa,
                "active-strokes": `[0:0,${strokesFa.length-1}:${strokesFa[strokesFa.length-1]["X"].length-1}]`,
                "tags": [{
                    "name": "STAFF",
                    "segment": `[0:0,${strokesFa.length-1}:${strokesFa[strokesFa.length-1]["X"].length-1}]`,
                    "data": {
                    "count": 5,
                    "top": topFa,
                    "gap": g.gap
                    },
                    "id": 1 }
                ],                   
                "new-tag-id": 2
            };
    
        sendJINKForRecog(jinkSol,jinkFa);
    }
    
   
};


//#region sendJINKForRecog
function sendJINKForRecog(jinkSol,jinkFa){
    if(jinkSol != null && jinkFa == null){
       
        var solMusicXml = "";
    
        //-----------------sol-----------------//
        let sjsonSol = JSON.stringify(jinkSol);
        
        var solFetch = fetch('http://127.0.0.1:8086/myscriptmusic', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: sjsonSol
            })

      

        Promise.all([solFetch]).then((values) =>  {
           
            values[0].text().then(function(text){
                const parser = new DOMParser();
                solMusicXml = parser.parseFromString(text, "application/xml");
               g.solXML = transposeXML(solMusicXml,"sol");
         
                const blob = new Blob([new XMLSerializer().serializeToString(g.solXML)], { type: 'application/xml' });
                const dataUrl = URL.createObjectURL(blob);
                
                var loadPromise = g.score[1].load(dataUrl)//i
                
                loadPromise.then(function() {
                                g.score[1].render();
                });
                
                   
            })
        
        })
    } else if(jinkSol == null && jinkFa != null){
        var faMusicXml = "";
       
        //-----------------fa-----------------//
        let sjsonFa = JSON.stringify(jinkFa);

        var faFetch = wait().then(() => fetch('http://127.0.0.1:8086/myscriptmusic', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: sjsonFa
            }))   

        Promise.all([faFetch]).then((values) =>  {
            

            values[0].text().then(function(text){
                const parser = new DOMParser();
                faMusicXml = parser.parseFromString(text, "application/xml");

                const blob = new Blob([new XMLSerializer().serializeToString(g.faXML)], { type: 'application/xml' });
                const dataUrl = URL.createObjectURL(blob);
        
                var loadPromise = g.score[2].load(dataUrl)//i
            
                loadPromise.then(function() {
                                g.score[2].render();
                });
                
            })
        
        })
    } else if(jinkSol != null && jinkFa != null){
        var faMusicXml = "";
        var solMusicXml = "";
    
        //-----------------sol-----------------//
        let sjsonSol = JSON.stringify(jinkSol);
        
        var solFetch = fetch('http://127.0.0.1:8086/myscriptmusic', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: sjsonSol
            })

        
            
        //-----------------fa-----------------//
        let sjsonFa = JSON.stringify(jinkFa);

        var faFetch = wait().then(() => fetch('http://127.0.0.1:8086/myscriptmusic', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: sjsonFa
            }))   

        Promise.all([solFetch,faFetch]).then((values) =>  {
            
            values[0].text().then(function(text){
                const parser = new DOMParser();
                solMusicXml = parser.parseFromString(text, "application/xml");
                g.solXML = transposeXML(solMusicXml,"sol");
            
                const blob = new Blob([new XMLSerializer().serializeToString(g.solXML)], { type: 'application/xml' });
                const dataUrl = URL.createObjectURL(blob);
                
                var loadPromise = g.score[1].load(dataUrl)//i
            
                loadPromise.then(function() {
                                g.score[1].render();
                });
                
                    
                
                
            })

            values[1].text().then(function(text){
                const parser = new DOMParser();
                faMusicXml = parser.parseFromString(text, "application/xml");
                g.faXML = transposeXML(faMusicXml,"fa")

                const blob = new Blob([new XMLSerializer().serializeToString(g.faXML)], { type: 'application/xml' });
                const dataUrl = URL.createObjectURL(blob);
        
                var loadPromise = g.score[2].load(dataUrl)//i
            
                loadPromise.then(function() {
                                g.score[2].render();
                });
                
            })
        
        })
    }
   
        
   
}
//#region Convert and Transpose
function convertTraces(writingsToBeautify){
    let strokes = [];
    
    writingsToBeautify.each(function(){
        let ts = d3.select(this).attr("date");
     
        let stroke = {
            "format": 0,
            "timestamp": ts,
            "X": g.writingCoords[ts].map(coords => coords[0]),
            "Y": g.writingCoords[ts].map(coords => coords[1])
        };
      
        strokes.push(stroke);
        
    })
    return strokes;
}

function transposeXML(xml, key){
    
    if(key == "sol"){
        for(var i = 0; i < xml.getElementsByTagName('note').length; i++){
            var previousPitch = xml.getElementsByTagName('note')[i].getElementsByTagName('pitch')[0].getElementsByTagName('step')[0].innerHTML
            xml.getElementsByTagName('note')[i].getElementsByTagName('pitch')[0].getElementsByTagName('step')[0].innerHTML = transposeToGKey(previousPitch)
        }
    } else if (key == "fa"){
        for(var i = 0; i < xml.getElementsByTagName('note').length; i++){
            var previousPitch = xml.getElementsByTagName('note')[i].getElementsByTagName('pitch')[0].getElementsByTagName('step')[0].innerHTML
            xml.getElementsByTagName('note')[i].getElementsByTagName('pitch')[0].getElementsByTagName('step')[0].innerHTML = transposeToFKey(previousPitch)
        }
    }
    return xml;
}


function transposeToGKey(key){
    if(key == "A"){
        return "D"
    } else if (key == "B"){
        return "E"
    } else if (key == "C"){
        return "F"
    } else if (key == "D"){
        return "G"
    } else if (key == "E"){
        return "A"
    } else if (key == "F"){
        return "B"
    } else if (key == "G"){ 
        return "C"
    }
}

function transposeToFKey(key){
    if(key == "A"){
        return "F"
    } else if (key == "B"){
        return "G"
    } else if (key == "C"){
        return "A"
    } else if (key == "D"){
        return "B"
    } else if (key == "E"){
        return "C"
    } else if (key == "F"){
        return "D"
    } else if (key == "G"){ 
        return "E"
    }
}


//#region Refining
function solRefining(solToBeautify){
    
    var staff = d3.select(solToBeautify.nodes()[0].parentNode);
    var symbols = staff.select(".symbols");
    var xtranslation = solToBeautify.node().getBBox().x //- 120
    var ytranslation = solToBeautify.node().getBBox().y //- 65
    var shortidSol = [];
    d3.select("#osmdContainerTemp").select("#osmdSvgPage1").selectAll(":scope > *").each(function(){
       
        if(this.classList.contains("vf-clef")){
            d3.select(this).remove();
          
        } else if (this.classList.contains("vf-stem") || this.classList.contains("vf-beam") || this.classList.contains("vf-stavetie")){
            if(shortId(this.id) == undefined){
                this.remove();
            } else {
                if(this.classList.contains("vf-stem")){
                    d3.select(this).attr("class","stem");
                } else if(this.classList.contains("vf-beam")){
                    d3.select(this).attr("class","beam");
                } else if(this.classList.contains("vf-stavetie")){
                    d3.select(this).attr("class","dynamic");
                }
            d3.select(this).classed("justEngraved",true).classed("selected",true).attr("shortId",shortId(this.id))
            symbols.node().appendChild(this);
            changePathColor(d3.select(this), g.selectedColor);
            interpretedSymbolsInformation(1,1)
            }


        
        } else if (this.classList.contains("vf-stavenote")){
            var id = this.id;
            var shortid = shortId(id);
            
            d3.select(this).selectAll("g").filter(function(){
                return this.classList.contains("vf-stem") || this.classList.contains("vf-notehead") || this.classList.contains("vf-flag") || this.classList.contains("vf-modifiers")
            }).each(function(){
                
                if(d3.select(this).selectAll(":scope > *").size() == 0){
                    
                    this.remove()
                    
                } else {
                    
                    if (this.classList.contains("vf-stem")){
                        d3.select(this).selectAll("path").each(function(){
                            d3.select(this).attr("class",null).attr("id",null)
                        });
                        d3.select(this).attr("class","stem");

                    } else if (this.classList.contains("vf-notehead")){
                        if(d3.select(this).select("path").attr("d").split(' ').length == 65){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 103){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 117){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 11){
                            d3.select(this).attr("class","rest")
                        } else {
                            d3.select(this).attr("class","noteHead");
                            shortidSol.push(shortid)
                        }

                    } else if (this.classList.contains("vf-flag")){
                        d3.select(this).attr("class","flag");
                    
                    } else if (this.classList.contains("vf-modifiers")){
                        if(d3.select(this).select("path").attr("d").split(' ').length == 76){
                            d3.select(this).attr("class","dynamic");
                        } else if(d3.select(this).select("path").attr("d").split(' ').length == 17){
                            d3.select(this).attr("class","dot");
                        } else {
                            d3.select(this).attr("class","accidental");
                        }
                    }

                    d3.select(this).attr("id",id).classed("justEngraved",true).classed("selected",true).attr("shortId",shortid).attr("pointer-events",null)
                    symbols.node().appendChild(this);
                    changePathColor(d3.select(this), g.selectedColor);
                    interpretedSymbolsInformation(1,1)
                    
                }
            })
        }

       

    })

    
     
    var je = d3.selectAll(".justEngraved").filter(function(){
        return d3.select(this).node().classList.contains("noteHead") && d3.select(this).attr("key")=="treble"
    }).nodes().sort(function (a, b) {
        return d3.descending(Number(a.getBBox().x), Number(b.getBBox().x));
    });
    var w = d3.selectAll(".selected").filter(function(){
        return d3.select(this).node().classList.contains("writing") && d3.select(this.parentNode).attr("key")=="sol"
    }).nodes().sort(function (a, b) {
        return d3.ascending(Number(a.getBBox().x), Number(b.getBBox().x));
    });

    var startingIndex = 10000;
    
    for(var i = 0; i < je.length; i++){
        var shortid = Number(d3.select(je[i]).attr("shortId"));
        var previousX = 0;
        if(i == 0){
            var ts = 0;
        } else {
            var ts = ts + Number(d3.select(je[i-1]).attr("duration"));
            if(w[i].getBBox().y <= w[i-1].getBBox().y){//only works if there are at least two writings ? cause of problems
                d3.selectAll("[shortId='"+shortid+"']").attr("octave",d3.select(je[i-1]).attr("octave"))
            }
        }
        var pitch = d3.select(je[i]).attr("pitch")
        var octave = Number(d3.select(je[i]).attr("octave"))
        if(pitch == "F" || pitch == "G" || pitch == "A" || pitch == "B"){
            d3.selectAll("[shortId='"+shortid+"']").attr("octave",octave-1)
            octave -= 1;
        }
        if(octave == 3){
            d3.selectAll("[shortId='"+shortid+"']").attr("octave",octave+1)
            
        }
     
        var goodLine = goodLineFinder(staff,pitch,octave)
        d3.selectAll("[shortId='"+shortid+"']").attr("index",startingIndex+i).attr("date",ts).attr("visibility","hidden")
        d3.selectAll("[shortId='"+shortid+"']").each(function(){
            
            d3.select(this).attr("transform","translate("+(w[i].getBBox().x - je[i].getBBox().x- g.defaultPensieveWidth)+","+(goodLine- je[i].getBBox().y)+")").attr("originalXPos",je[i].getBBox().x).attr("writingXPos",w[i].getBBox().x)
        })

        if(startingIndex == null){
            var sys = Number(d3.select(w[i].parentNode).attr("system"))
            var ibeg = d3.selectAll(".selected").filter(function(){
                d3.select(this).attr("key")=="treble" && d3.select(this).node().getBBox().x <= w[i].getBBox().x 
            })
            
            
            
            .each(function(){
                if(d3.select(this).node().getBBox().x > previousX){
                
                    previousX = d3.select(this).node().getBBox().x;
                    startingIndex = Number(d3.select(this).attr("index"))+1;
                    d3.selectAll("[shortId='"+shortid+"']").attr("index",startingIndex)
                    
                }
            })
        
        } else {
            startingIndex += 1;
            d3.selectAll("[shortId='"+shortid+"']").attr("index",startingIndex)
        }
        
    
    }

    setTimeStampAndIndex(staff)

}




function faRefining(faToBeautify){
    var staff = d3.select(faToBeautify.nodes()[0].parentNode);
    var symbols = staff.select(".symbols");
    var xtranslation = faToBeautify.node().getBBox().x - 120
    var ytranslation = faToBeautify.node().getBBox().y - 55
    
    d3.select("#osmdContainerTemp2").select("#osmdSvgPage1").selectAll(":scope > *").each(function(){
        
        if(this.classList.contains("vf-clef")){
            d3.select(this).attr("class","clef").classed("engraved",true).classed("unselected",true);
            symbols.node().appendChild(this);
        } else if (this.classList.contains("vf-stem") || this.classList.contains("vf-beam") || this.classList.contains("vf-stavetie")){
            if(shortId(this.id) == undefined){
                this.remove();
            } else {
                if(this.classList.contains("vf-stem")){
                    d3.select(this).attr("class","stem");
                } else if(this.classList.contains("vf-beam")){
                    d3.select(this).attr("class","beam");
                } else if(this.classList.contains("vf-stavetie")){
                    d3.select(this).attr("class","dynamic");
                }
            d3.select(this).classed("justEngraved",true).classed("selected",true).attr("shortId",shortId(this.id))
            symbols.node().appendChild(this);
            changePathColor(d3.select(this), g.selectedColor);
            interpretedSymbolsInformation(2,1)
            }


        
        } else if (this.classList.contains("vf-stavenote")){
            var id = this.id;
            var shortid = shortId(id);
            
            d3.select(this).selectAll("g").filter(function(){
                return this.classList.contains("vf-stem") || this.classList.contains("vf-notehead") || this.classList.contains("vf-flag") || this.classList.contains("vf-modifiers")
            }).each(function(){
                
                if(d3.select(this).selectAll(":scope > *").size() == 0){
                    
                    this.remove()
                    
                } else {
                    
                    if (this.classList.contains("vf-stem")){
                        d3.select(this).selectAll("path").each(function(){
                            d3.select(this).attr("class",null).attr("id",null)
                        });
                        d3.select(this).attr("class","stem");

                    } else if (this.classList.contains("vf-notehead")){
                        if(d3.select(this).select("path").attr("d").split(' ').length == 65){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 103){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 117){
                            d3.select(this).attr("class","rest")
                        } else if (d3.select(this).select("path").attr("d").split(' ').length == 11){
                            d3.select(this).attr("class","rest")
                        } else {
                            d3.select(this).attr("class","noteHead");
                        }

                    } else if (this.classList.contains("vf-flag")){
                        d3.select(this).attr("class","flag");
                    
                    } else if (this.classList.contains("vf-modifiers")){
                        if(d3.select(this).select("path").attr("d").split(' ').length == 76){
                            d3.select(this).attr("class","dynamic");//dynamics wrongly identified as modifiers
                        } else if(d3.select(this).select("path").attr("d").split(' ').length == 17){
                            d3.select(this).attr("class","dot");
                        } else {
                            d3.select(this).attr("class","accidental");
                        }
                    }

                    d3.select(this).attr("id",id).classed("justEngraved",true).classed("selected",true).attr("shortId",shortid).attr("pointer-events",null)
                    symbols.node().appendChild(this);
                    changePathColor(d3.select(this), g.selectedColor);
                    interpretedSymbolsInformation(2,1)
                }
            })
        }
    })

    
     
    var je = d3.selectAll(".justEngraved").filter(function(){
        return d3.select(this).node().classList.contains("noteHead") && d3.select(this).attr("key")=="bass"
    }).nodes().sort(function (a, b) {
        return d3.descending(Number(a.getBBox().x), Number(b.getBBox().x));
    });
    var w = d3.selectAll(".selected").filter(function(){
        return d3.select(this).node().classList.contains("writing") && d3.select(this.parentNode).attr("key")=="fa"
    }).nodes().sort(function (a, b) {
        return d3.ascending(Number(a.getBBox().x), Number(b.getBBox().x));
    });

    var startingIndex = 10000;
    
    for(var i = 0; i < je.length; i++){
        var shortid = Number(d3.select(je[i]).attr("shortId"));
        var previousX = 0;
        if(i == 0){
            var ts = 0;
        } else {
            var ts = ts + Number(d3.select(je[i-1]).attr("duration"));
            if(w[i].getBBox().y <= w[i-1].getBBox().y){
                d3.selectAll("[shortId='"+shortid+"']").attr("octave",d3.select(je[i-1]).attr("octave"))
            }
        }
        var pitch = d3.select(je[i]).attr("pitch")
        var octave = Number(d3.select(je[i]).attr("octave"))
     
        var goodLine = goodLineFinderFa(staff,pitch,octave)
      
        d3.selectAll("[shortId='"+shortid+"']").attr("index",startingIndex+i).attr("date",ts).attr("visibility","hidden")
        d3.selectAll("[shortId='"+shortid+"']").each(function(){
            
            d3.select(this).attr("transform","translate("+(w[i].getBBox().x - je[i].getBBox().x- g.defaultPensieveWidth)+","+(goodLine- je[i].getBBox().y)+")")
        })
    
    
    }
}




//#region Goodline

function goodLineFinder(staff,pitch,octave){//only works for fifth octave right now
    var base = staff.select(".staffLineBottom").node().getBBox().y
    if(octave == 5){
        if(pitch=="C"){
            var goodline = base-30;
        } else if(pitch=="D"){
            var goodline = base-35;
        } else if(pitch=="E"){
            var goodline = base-40;
        } else if(pitch=="F"){
            var goodline = base-45;
        } else if(pitch=="G"){
            var goodline = base-50;
        }
    } else if(octave == 4 || octave == 3){
        if(pitch=="D"){
            var goodline = base;
        } else if(pitch=="E"){
            var goodline = base-5;
        } else if(pitch=="F"){
            var goodline = base-10;
        } else if(pitch=="G"){
            var goodline = base-15;
        } else if(pitch=="A"){
            var goodline = base-20;
        } else if(pitch=="B"){
            var goodline = base-25;
        }
    }
    return goodline;
}

function goodLineFinderFa(staff,pitch,octave){//only works for fifth octave right now
    var base = staff.select(".staffLineBottom").node().getBBox().y
    if(octave == 5){
        if(pitch=="C"){
            var goodline = base-30;
        } else if(pitch=="D"){
            var goodline = base-35;
        } else if(pitch=="E"){
            var goodline = base-40;
        } else if(pitch=="F"){
            var goodline = base-45;
        } else if(pitch=="G"){
            var goodline = base-50;
        }
    } else if(octave == 4){
        if(pitch=="D"){
            var goodline = base;
        } else if(pitch=="E"){
            var goodline = base-5;
        } else if(pitch=="F"){
            var goodline = base-10;
        } else if(pitch=="G"){
            var goodline = base-15;
        } else if(pitch=="A"){
            var goodline = base-20;
        } else if(pitch=="B"){
            var goodline = base-25;
        }
    }
    return goodline;
}
