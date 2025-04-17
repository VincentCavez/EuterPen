import { resizeMeasure, realign, getRealGap } from "./modif.js";
import { hideStaffToFakeInsert, hideStaffToFakeRhythmicPaste,hideStaffToFakePaste, insertRectangle, pasteRectangle } from "./copy.js";
import {wait, fakeEmptyScore, removeSecondVoiceMeasure13} from "./tools.js";

export const g = {

    touchPoints: {},
    penPoints: {},

    context: {},

    lastPenClick: Date.now(),
    lastTouchClick: Date.now(),
    
    selectionTargets: null,
    strokeCoords: [],
    writingCoords: {},
    timeStamp: null,

    selectedColor: "#4c6ef5",
    paperColor:"#a68563",
    hiddenColor:"#999999",
    pencilColor:"#585858",
    linkedColor:"red",
    unlinkedColor:"#ac00ea",

    gap: 10,
    score:{},

    zoomTreshold: 110,

    globalOffsetX: 10000,
    globalOffsetY: 10000,
    pensieveWidth: 0,
    soloDistance: 0,
    defaultPensieveWidth: 558.250,

    strokeColorShiftDuration: 250,

    solXML: null,
    faXML: null,

    bpm: 60,

    totalMatches: 0,
    copy: false

}

export function scoreInit(){

  


    const musicXmlUrl = 'scores/BWV_847.xml';

    

    // Fetch the MusicXML file
    fetch(musicXmlUrl)
        .then((response) => response.text())
        .then((xmlData) => {
           
              
                var container = document.getElementById("osmdContainer");
                container.style.width = "50%"
                container.style.marginLeft = "25%"
                var container1 = document.getElementById("osmdContainerTemp");
                container1.style.width = "50%"
                container1.style.marginLeft = "25%"
                var container2 = document.getElementById("osmdContainerTemp2");
                container2.style.width = "50%"
                container2.style.marginLeft = "25%"
                //container.style.height = "200px";
               
                g.score[0] = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    drawMeasureNumbersOnlyAtSystemStart: true,
                    //renderSingleHorizontalStaffline: true,
                    //pageFormat: "endless",
                });
                g.score[1] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                g.score[2] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp2"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                    

                var loadPromise = g.score[0].load(musicXmlUrl)//i
                loadPromise.then(function() {
                                    g.score[0].render();
                                }).then(function(){
                                    unGrandReset()
                                }).then(function(){
                                    
                                    unPetitReset();
                                    var newWidth = 20000;
                                    var newHeight = 20000;
                                 
                                    d3.select("#osmdSvgPage1").attr("width",newWidth).attr("height",newHeight).attr("transform","translate("+(-newWidth/2)+","+(-newHeight/2)+")")
                                    .attr("viewBox",(-newWidth/2)+" "+(-newHeight/2)+" "+newWidth+" "+newHeight);
                                    
                                }).then(() => {
                                    // Remove all dynamics for now
                                    document.querySelectorAll('.dynamic.engraved.unselected')
                                        .forEach(node => node.remove())

                                    function gapExample() {
                                        setTimeout(() => {
                                            document.querySelectorAll('.system .measure').forEach(measure => {
                                                resizeMeasure(measure, { gap: 80 })
                                            })
                                            realign()
                                        }, 1000)
                                    }
                                   
                                });
                                    
           // }
        })
        .catch((error) => {
            console.error(error);
        })

        

}

// resizeMeasure & realign examples
function resizeMeasureAndRealignExamples() {
    let test = 370
    // use arrow up/down keys to resize measures
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') {
            test += 25
        } else if (e.key === 'ArrowDown') {
            test -= 25
        }

        document.querySelectorAll('.measure').forEach(measure => {
            resizeMeasure(measure, { width: test })
        })
     
    })
}
//resizeMeasureAndRealignExamples()

// resizeMeasure & realign examples
function resizeMeasuresSixandSeven() {
    let test = 370
    let initialSix = 358.56
    let initialSeven = 387.27
    let duration = 200
    for (let j=0; j<duration; j++){
        
        wait(1000).then(function(){
            for (let i = 6; i <= 7; i++) {
                const measure = document.querySelector(`.measure[number="${i}"]`)
                resizeMeasure(measure, { width: i === 6 ? initialSix : initialSeven })
            }
            initialSix += 1
            initialSeven += 1
        })
        
   
    }
}


function unGrandReset(){
    
    window.sId = 0;
    window.mId = 0;
    window.stId = 0;
    window.scoreContainer = d3.select("#osmdSvgPage1");
    window.tagvector = [];
    window.nodevector = [];
    window.linebreak = ["path","path","path","path","path","rect","vf-clef"];
    window.newstaff = ["path","path","path","path","path","rect"];
    window.newsystem = true;
   
    d3.select("#osmdSvgPage1").selectAll(":scope > *").each(function(d,i){
        var action = null;
        if(this.tagName == "path"){
            
            //----------------------------------------------//
            //                   Brackets                   //
            //----------------------------------------------//
            if(d3.select(this).attr("d").split(' ').length == 14){//it's a bracket
                var system = scoreContainer.select("#system_"+sId)
                if(system.select(".bracket").empty()){
                    var bracket = system.append("g").attr("class","bracket").attr("id","bracket_"+sId).attr("system",sId);
                } else {
                    var bracket = system.select(".bracket");
                }
                
                bracket.node().appendChild(this);
                return;
            } else {

                let currentNode = this;
                const followingTags = [];

                for (let i = 0; i < 7; i++) {
                    if (currentNode) {
                        if(i < 6){
                            followingTags.push(currentNode.tagName);//tags of the first 6 ones
                        } else {
                            followingTags.push(currentNode.classList[0]);//id of the last one
                        }
                        currentNode = currentNode.nextElementSibling;
                    } else {
                        // If there are no more nodes, break the loop
                        break;
                    }
                }
                
                if(followingTags.every((element, index) => element === linebreak[index])){
                    action = "linebreak";
                } else if (followingTags.slice(0, 5).every((element, index) => element === newstaff[index])){
                    action = "newstaff";
                }
            }
            
        }
        if(action == "linebreak"){

            //----------------------------------------------//
            //                   New system                 //
            //----------------------------------------------//
            if(newsystem == true){//we create of a new system, a new measure, a new staff, and put this node in it

                sId++, mId++, stId++;
                var system = scoreContainer.append("g").attr("class","system").attr("id","system_"+sId).attr("number",sId);
                var measure = system.append("g").attr("class","measure").classed("engraved",true).classed("unselected",true).attr("id","measure_"+mId).attr("system",sId).attr("number",mId);
                var staff = measure.append("g").attr("class","staff").attr("id","staff_"+stId).attr("measure",mId).attr("system",sId).attr("number",stId).attr("key","sol");
                staff.node().appendChild(this);

                newsystem = false;

            //----------------------------------------------//
            //               Simple line break              //
            //----------------------------------------------//
            } else {//we place ourself in the first measure, create new staff, and put this node in it
            
                var measure = d3.select("#system_"+sId).select(":first-child");
                mId = measure.attr("id").split("_")[1];
                stId++;
                var staff = measure.append("g").attr("class","staff").attr("id","staff_"+stId).attr("measure",mId).attr("system",sId).attr("number",stId).attr("key","fa");
                staff.node().appendChild(this);
                
                newsystem = true;
            }

        //----------------------------------------------//
        //                   New staff                  //
        //----------------------------------------------//
        } else if (action == "newstaff"){
            
            var system = scoreContainer.select("#system_"+sId)
            mId++;
            if(d3.select("#measure_"+mId).empty()){
                var measure = system.append("g").attr("class","measure").classed("engraved",true).classed("unselected",true).attr("id","measure_"+mId).attr("system",sId).attr("number",mId);
                var key = "sol";
            } else {
                var measure = d3.select("#measure_"+mId)
                var key = "fa";
            }
            stId++;
            var staff = measure.append("g").attr("class","staff").attr("id","staff_"+stId).attr("measure",mId).attr("system",sId).attr("number",stId).attr("key",key);
            staff.node().appendChild(this);

        //----------------------------------------------//
        //             Iterate in the staff             //
        //----------------------------------------------//
        
        } else if (action == null){
            var staff = d3.select("#staff_"+stId);
            staff.node().appendChild(this);
        }        
      
    });
    

}

function unPetitReset(){
    
    window.sId = 0;
    window.mId = 0;
    window.stId = 0;
  
    
    d3.selectAll(".system").each(function(){
        var system = d3.select(this);

        //----------------------------------------------//
        //                Measure numbers               //
        //----------------------------------------------//
        system.selectAll("text").each(function(){
            if(d3.select(this).attr("font-size") == "15px"){
                var mn = d3.select(this).attr("class","measureNumber")
                d3.select("#measure_"+mn.text()).node().appendChild(this);
            } else {
                d3.select(this).remove(); 
            }        
        });
        system.selectAll(".staff").each(function(){
            
            //----------------------------------------------//
            //                  Staff lines                 //
            //----------------------------------------------//
            var lines = d3.select(this).append("g").attr("class","lines").classed("engraved",true).classed("unselected",true)
            d3.select(this).selectAll("path").filter((d, i) => i < 5).each(function(d,i){
                if(i==0){d3.select(this).attr("class","staffLineTop")}
                if(i==4){d3.select(this).attr("class","staffLineBottom")}
                lines.node().appendChild(this);
            });

            //----------------------------------------------//
            //          Staff bars and measure bars         //
            //----------------------------------------------//
            var staffBars = d3.select(this).append("g").attr("class","staffBars").classed("engraved",true).classed("unselected",true)
            d3.select(this).selectAll("rect").each(function(){
                if(Number(d3.select(this).attr("height")) == 41){
                    staffBars.node().appendChild(this);
                } else {
                    var measure = d3.select(this.parentNode.parentNode)
                    if(measure.select(".barLines").empty()){
                        var measureBars = measure.append("g").attr("class","barLines").classed("engraved",true).classed("unselected",true)
                        measureBars.node().appendChild(this);
                    } else {
                        measure.select(".barLines").node().appendChild(this);
                    }
                }
            });
    
            //----------------------------------------------//
            //                    Symbols                   //
            //----------------------------------------------//
            var symbols = d3.select(this).append("g").attr("class","symbols")
            symbols.append("g").attr("class","timeSignature").classed("engraved",true).classed("unselected",true)
            d3.select(this).selectAll(":scope > *").filter(function(){
                return !(this.classList.contains("lines") || this.classList.contains("staffBars") || this.classList.contains("symbols"))
            }).each(function(){
                
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
                    d3.select(this).classed("engraved",true).classed("unselected",true).attr("shortId",shortId(this.id));
                    symbols.node().appendChild(this);
                    }

      
                
                } else if (this.classList.contains("vf-stavenote")){
                    var id = this.id;
                    var shortid = shortId(this.id);
                    
                    d3.select(this).selectAll("g").filter(function(){
                        return this.classList.contains("vf-stem") || this.classList.contains("vf-notehead") || this.classList.contains("vf-flag") || this.classList.contains("vf-modifiers")
                    }).each(function(){
                        
                        if(d3.select(this).selectAll(":scope > *").size() == 0){
                            
                            this.remove()
                            
                        } else {
                            if(d3.select(this).select("path").attr("d").split(' ').length == 122){
                              
                            }
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
                                } else if (d3.select(this).select("path").attr("d").split(' ').length == 122){
                                    //d3.select(this).attr("class","beam")
                                } else {
                                    d3.select(this).attr("class","noteHead");
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

                            d3.select(this).attr("id",id).classed("engraved",true).classed("unselected",true).attr("shortId",shortid).attr("pointer-events",null);
                            symbols.node().appendChild(this);
                            
                        }
                        
                       
                    });
                    this.remove();
                    
                } else if (this.classList.contains("vf-modifiers")){
                    if(d3.select(this).select("path").attr("d").split(' ').length == 76){
                        d3.select(this).attr("class","dynamic");
                    } else if(d3.select(this).select("path").attr("d").split(' ').length == 17){
                        d3.select(this).attr("class","dot");
                    } else {
                        d3.select(this).attr("class","accidental");
                    }
                    d3.select(this).classed("engraved",true).classed("unselected",true).attr("shortId",shortId(this.id));
                } else {
                    if(this.tagName == "path"){
                        if(d3.select(this).attr("d").split(' ').length == 3){
                            symbols.append("g").attr("class","ledgerLine").node().appendChild(this);
                        } else if (d3.select(this).attr("d").split(' ').length == 122){
                            symbols.append("g").attr("class","beam").node().appendChild(this);
                        } else {
                            symbols.select(".timeSignature").node().appendChild(this);
                        }
                    }
                    
                }
            })
        });
        
    });

    //----------------------------------------------//
    //          Measure bars left or right          //
    //----------------------------------------------//
   
    d3.selectAll(".measure").each(function(d,i){
   
        if(d3.select("#measure_"+(i+1)).select(".barLines").selectAll("*").size() == 2){
            d3.select(this).select(".barLines").selectAll("rect").each(function(d,i){
                if(i==0){
                    d3.select(this).attr("class","barLineRight")
                } else {
                    d3.select(this).attr("class","barLineLeft")
                }
            });
        } else if(d3.select("#measure_"+(i+1)).select(".barLines").selectAll("*").size() == 1){
            d3.select("#measure_"+(i+1)).select(".barLines").selectAll("rect").attr("class","barLineRight")
            var clone = d3.select("#measure_"+i).select(".barLines").selectAll("rect").filter(function(d,i){return d3.select(this).attr("class")=="barLineRight"}).clone(true);
            clone.attr("class","barLineLeft")
            
            d3.select("#measure_"+(i+1)).select(".barLines").node().appendChild(clone.node());
        } else{
            return;
        }
    });

    
    d3.selectAll(".symbols").each(function(){
        var symbols = d3.select(this);
        var noteheads = symbols.selectAll(".noteHead");

        //----------------------------------------------//
        //                 Ledger lines                 //
        //----------------------------------------------//
        symbols.selectAll(".ledgerLine").each(function(){
            var barx = this.getBBox().x + this.getBBox().width/2;
            var bary = this.getBBox().y + this.getBBox().height/2;
            var dist = 1000;
            var id, shortId = null
            noteheads.each(function(){
                var notex = this.getBBox().x + this.getBBox().width/2;
                var notey = this.getBBox().y + this.getBBox().height/2;
                if (math.distance([barx,bary], [notex,notey]) < dist){
                    dist = math.distance([barx,bary], [notex,notey]);
                    id = d3.select(this).attr("id");
                    shortId = d3.select(this).attr("shortId");
                }
            });
            d3.select(this).attr("id",id).classed("engraved",true).classed("unselected",true).attr("shortId",shortId); 
        });

        symbols.selectAll(".accidental").each(function(){
            var id = d3.select(this).attr("id");
            var shortid = d3.select(this).attr("shortId");
            d3.select(this).selectAll("path").each(function(){
                if(d3.select(this).attr("d").split(' ').length == 17){
                    symbols.append("g").attr("class","dot").attr("id",id).classed("engraved",true).classed("unselected",true).attr("shortId",shortid).node().appendChild(this);
                }
            });
        
        });
    });

 


    symbolsInformation(0);




    d3.select("#osmdSvgPage1").append("line").attr("id","borderlineLeft").attr("class","borderline").style("pointer-events","none")
                            .attr("x1",d3.select("#system_1").node().getBBox().x).attr("x2",d3.select("#system_1").node().getBBox().x)
                            .attr("y1",0).attr("y2",d3.select("#osmdSvgPage1").node().getBBox().height)

    d3.select("#osmdSvgPage1").append("line").attr("id","borderlineRight").attr("class","borderline").style("pointer-events","none")
                            .attr("x1",d3.select("#system_1").node().getBBox().x+d3.select("#system_1").node().getBBox().width).attr("x2",d3.select("#system_1").node().getBBox().x+d3.select("#system_1").node().getBBox().width)
                            .attr("y1",0).attr("y2",d3.select("#osmdSvgPage1").node().getBBox().height)

   
    let msg = document.querySelector('#borderlineRight');
    let list = document.querySelector('#system_1');
    list.before(msg);
    d3.select("#osmdCanvasPage1").append("div").attr("id","freeZonesContainer").style("position","absolute").style("left",0+"px").style("top",0+"px")

    var pensieve = d3.select("#pensieveContainer").style("position","absolute").style("left",0+"px").style("top",0+"px").style("width","25%").style("height","100%").style("overflow","hidden")
        .append("svg").attr("id","pensieve").attr("width","100%").attr("height","100%").style("z-index",0)

    pensieve.append("rect").attr("x",0).attr("y",0).attr("width","100%").attr("height","100%").attr("rx",20).attr("ry",20).attr("fill",g.paperColor).style("opacity",0.3)
    var width = d3.select("#pensieve").node().getBBox().width;
    var height = d3.select("#pensieve").node().getBBox().height;
    var handle = d3.select("#pensieveContainer").append("svg").attr("id","pensieveHandle").style("left",width-40).attr("height","80%").attr("width","40px").style("top","10%").style("position","absolute").style("z-index",800)
    
    handle.append("rect").attr("x","0px").attr("y","0px").attr("width","40px").attr("height","100%").attr("fill","#D1B79D").style("opacity",1).attr("rx",20).attr("ry",20)
    handle.append("line").attr("x1","15px").attr("y1","40%").attr("x2","15px").attr("y2","60%").attr("stroke","#A68563").attr("stroke-width",2).attr("stroke-linecap", "round")
    handle.append("line").attr("x1","25px").attr("y1","40%").attr("x2","25px").attr("y2","60%").attr("stroke","#A68563").attr("stroke-width",2).attr("stroke-linecap", "round")

    g.pensieveWidth = width;
    var size = 30;
    var gap = 5;
    
    pensieve.append("image").attr("href","./css/brownBin.svg").attr("x",width-2*(size+gap)).attr("y",gap).attr("width",size).attr("height",size).classed("iconZone",true).classed("bin",true)
    pensieve.append("image").attr("href","./css/brownHorizontalCollapse.svg").attr("x",width-size-gap).attr("y",gap).attr("width",size).attr("height",size).classed("iconZone",true).classed("collapse",true)

    pensieve.append("image").attr("href","./css/brownMeasure.svg").attr("x",width-2*(size+gap)).attr("y",size+2*gap).attr("width",size).attr("height",size).classed("iconZone",true).classed("createMeasure",true)
    pensieve.append("image").attr("href","./css/brownStaff.svg").attr("x",width-size-gap).attr("y",size+2*gap).attr("width",size).attr("height",size).classed("iconZone",true).classed("createStaff",true)
    

    pensieve.append("image").attr("href","./css/brownMic.svg").attr("x",gap).attr("y",height/2 - 3/2*gap - 2*size).attr("width",size).attr("height",size).classed("iconZone",true).classed("mic",true)
    pensieve.append("image").attr("href","./css/brownCamera.svg").attr("x",gap).attr("y",height/2 - gap/2 - size).attr("width",size).attr("height",size).classed("iconZone",true).classed("camera",true)
    pensieve.append("image").attr("href","./css/brownUpload.svg").attr("x",gap).attr("y",height/2 + gap/2).attr("width",size).attr("height",size).classed("iconZone",true).classed("upload",true)
    pensieve.append("image").attr("href","./css/brownUrl.svg").attr("x",gap).attr("y",height/2 + 3/2*gap + size).attr("width",size).attr("height",size).classed("iconZone",true).classed("url",true)
    pensieve.append("line").attr("x1",size+2*gap+"px").attr("y1",(height/2-5/2*gap-2*size)+"px").attr("x2",size+2*gap+"px").attr("y2",(height/2+5/2*gap+2*size)+"px").attr("stroke","#A68563").attr("stroke-width",2).attr("stroke-linecap", "round").classed("separator",true)


    g.listOfY_ZonesAndSystems = [];
    d3.selectAll(".system").each(function(){
        d3.select(this).attr("transform","translate(0,0)")
        var num = Number(d3.select(this).attr("number"));
        if(num > 1){
            var y_zone = (d3.select("#system_"+(num-1)).node().getBBox().y + d3.select("#system_"+(num-1)).node().getBBox().height + d3.select("#system_"+num).node().getBBox().y )/2
        } else {
            var y_zone = d3.select("#system_1").node().getBBox().y-20;
        }
        var x_zone = Number(d3.select("#borderlineLeft").attr("x1")); 
        var width = Number(d3.select("#borderlineRight").attr("x1")) - x_zone;
        var height = 0;
      
        //div container
        d3.select("#freeZonesContainer").append("div").attr("id","fzsContainer_"+num).style("overflow","hidden").attr("number",num).style("position","absolute").style("left",x_zone+"px").style("top",y_zone+"px").style("width",width+"px").style("height",height+"px")
        
        //svg container
        var fzs = d3.select("#fzsContainer_"+num).append("svg").attr("class","free_zone_between_systems").attr("id","fzs_"+num).attr("number",num).attr("width","100%").attr("height","100%")//.attr("clip-path","url(#fzs_clip_"+num+")")
        
        
        fzs.append("rect").attr("x",0).attr("y",0).attr("width","100%").attr("height","100%").attr("rx",20).attr("ry",20).attr("fill",g.paperColor).style("opacity",0.3)

        var size = 30;
        var gap = 5;
        

        fzs.append("image").attr("href","./css/brownBin.svg").attr("x",width-2*(size+gap)).attr("y",gap).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("bin",true)
        fzs.append("image").attr("href","./css/brownCollapse.svg").attr("x",width-size-gap).attr("y",gap).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("collapse",true)

        fzs.append("image").attr("href","./css/brownMeasure.svg").attr("x",width-2*(size+gap)).attr("y",size+2*gap).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("createMeasure",true)
        fzs.append("image").attr("href","./css/brownStaff.svg").attr("x",width-size-gap).attr("y",size+2*gap).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("createStaff",true)
        
        fzs.append("image").attr("href","./css/brownMic.svg").attr("x",gap).attr("y",height/2 - 3/2*gap - 2*size).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("mic",true)
        fzs.append("image").attr("href","./css/brownCamera.svg").attr("x",gap).attr("y",height/2 - gap/2 - size).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("camera",true)
        fzs.append("image").attr("href","./css/brownUpload.svg").attr("x",gap).attr("y",height/2 + gap/2).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("upload",true)
        fzs.append("image").attr("href","./css/brownUrl.svg").attr("x",gap).attr("y",height/2 + 3/2*gap + size).attr("width",size).attr("height",size).attr("number",num).classed("iconZone",true).classed("url",true)
        fzs.append("line").attr("x1",size+2*gap+"px").attr("y1",(height/2-5/2*gap-2*size)+"px").attr("x2",size+2*gap+"px").attr("y2",(height/2+5/2*gap+2*size)+"px").attr("stroke","#A68563").attr("stroke-width",2).attr("stroke-linecap", "round").classed("zoneSeparator",true)
        
        g.listOfY_ZonesAndSystems.push([0,0,0])

    })
    d3.selectAll(".staffBars").remove()
    var lastMeasures = []
    d3.selectAll(".system").each(function(){
        var lastNum = Number(d3.select(this).select(".measure").attr("number"))-1;
        lastMeasures.push(lastNum)
       
    })
    d3.selectAll(".measure").filter(function(){
        return !lastMeasures.contains(Number(d3.select(this).attr("number")))
    }).selectAll(".barLineRight").remove()

}




export function shortId(rawId){
    if(rawId.split("-")[1] == undefined){   
        return undefined
    }  else {
    return rawId.split("-")[1].substring(4);
    }
}




function sourceFromId(originalid){
   
    const id = originalid//.substring(3);
    
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



export function symbolsInformation(scoreId){
    
    for(var i = 0; i < g.score[scoreId].graphic.measureList.length; i++){
        
        for(var j in [0,1]){
          
            for(var k = 0; k < g.score[scoreId].graphic.measureList[i][j].staffEntries.length; k++){
                var staffEntry = g.score[scoreId].graphic.measureList[i][j].staffEntries[k];

                var index = staffEntry.parentVerticalContainer.index;
                var timeStamp = staffEntry.parentVerticalContainer.absoluteTimestamp.realValue*4*g.bpm/60;
               
                Object.keys(staffEntry.graphicalVoiceEntries).forEach(function(voice) {
                
                    
                    var symbol = staffEntry.graphicalVoiceEntries[voice].mVexFlowStaveNote;
                    var rawId = symbol.attrs["id"];
                    var shortid = shortId("vf-"+rawId);
                    if(shortid == "1244"){
                    
                    }

                    if(symbol.attrs.type != "GhostNote"){//note
                        if(symbol.dots==1){
                            var duration = durationConvertor(symbol.duration,true)
                        } else {
                            var duration = durationConvertor(symbol.duration,false)
                        }
                        var noteAndAccidental = d3.selectAll("[shortId='"+shortid+"']")
                        noteAndAccidental.attr("pitch",symbol.keyProps[0]["key"][0]) 
                                        .attr("duration",duration)
                                        .attr("octave",symbol.keyProps[0]["octave"])
                                        .attr("index",index)
                                        .attr("key",symbol.clef)
                                        .attr("timeStamp",timeStamp)
                                        
                        
                        if(symbol.noteType == "n"){//note
                           
                            if(symbol.modifiers.length > 0 && (symbol.modifiers[0].type == "#" || symbol.modifiers[0].type == "b")){
                                noteAndAccidental.attr("accidental",symbol.modifiers[0].type)
                            } else {
                                noteAndAccidental.attr("accidental","flat")
                            }
                        
                                
                            if((symbol.keyProps[0]["key"][0]=="E" || symbol.keyProps[0]["key"][0]=="A" || symbol.keyProps[0]["key"][0]=="B") && symbol.modifiers.length == 0){
                                noteAndAccidental.attr("accidental","b")
                            }
                            var realFlats=[1264,1212,1335,1466,1490,1634,1702,1818,1746,2059,2127,2199,2331,2543,2595,2827,2708,2780,2980,3020,3048,3096,3108,3210,3220,3273,3313,3353,4297,4550,4626,4638,4835,4857,5023,5103,5141,5205,5263,5485,5527,5539,5571,5591,5658,5730,5755,5799,5861,5899,5941,6053,6065,6099,6141,6221,6169,6269,6329,6401,6486,6558,6672,6724,6791,6913,7059,7099,7139,7167,7388,7733,7991,8003,8030,8098,8230,8242,8459,8471,8589,8611,8830,8882,8927,8999,9019,9065,9169,9321,9271,9359,9463,9493,9567,9663,9707,9751,6199,6241]
                            var realSharps=[1604,1838,5215,5273,5811]
                            
                            if(realFlats.includes(Number(shortid))){
                                noteAndAccidental.attr("accidental","flat")
                            } else if (realSharps.includes(Number(shortid))){
                                noteAndAccidental.attr("accidental","#")
                            } 
                        }
                        if (Number(shortid) == 1186 || Number(shortid) == 1307){
                            noteAndAccidental.remove()
                        }
                        
                
                    }
                        
                })
            }
        }
    }
}


export function interpretedSymbolsInformation(scoreId,staffCount){
   
    for(var i = 0; i < g.score[scoreId].graphic.measureList.length; i++){
        
        for(var j = 0; j < staffCount ; j++){
           
            for(var k = 0; k < g.score[scoreId].graphic.measureList[i][j].staffEntries.length; k++){
                var staffEntry = g.score[scoreId].graphic.measureList[i][j].staffEntries[k];

                Object.keys(staffEntry.graphicalVoiceEntries).forEach(function(voice) {
                
                    
                        var symbol = staffEntry.graphicalVoiceEntries[voice].mVexFlowStaveNote;
                        var rawId = symbol.attrs["id"];
                        var shortid = shortId("vf-"+rawId);
                       
                        if(symbol.attrs.type != "GhostNote"){//note
                            if(symbol.dots==1){
                                var duration = durationConvertor(symbol.duration,true)
                            } else {
                                var duration = durationConvertor(symbol.duration,false)
                            }
                            var noteAndAccidental = d3.selectAll("[shortId='"+shortid+"']")
                            noteAndAccidental.attr("pitch",symbol.keyProps[0]["key"][0]) 
                                            .attr("duration",duration)
                                            .attr("octave",symbol.keyProps[0]["octave"])
                                            .attr("key",symbol.clef)
                                      
                                            
                            
                            if(symbol.noteType == "n"){//note
                              
                                if(symbol.modifiers.length > 0 && (symbol.modifiers[0].type == "#" || symbol.modifiers[0].type == "b")){
                                    noteAndAccidental.attr("accidental",symbol.modifiers[0].type)
                                } else {
                                    noteAndAccidental.attr("accidental","flat")
                                }
                            
                              
                                if((symbol.keyProps[0]["key"][0]=="E" || symbol.keyProps[0]["key"][0]=="A" || symbol.keyProps[0]["key"][0]=="B") && symbol.modifiers.length == 0){
                                    noteAndAccidental.attr("accidental","b")
                                }
                                var realFlats=[1264,1212,1335,1466,1490,1634,1702,1818,1746,2059,2127,2199,2331,2543,2595,2827,2708,2780,2980,3020,3048,3096,3108,3210,3220,3273,3313,3353,4297,4550,4626,4638,4835,4857,5023,5103,5141,5205,5263,5485,5527,5539,5571,5591,5658,5730,5755,5799,5861,5899,5941,6053,6065,6099,6141,6221,6169,6269,6329,6401,6486,6558,6672,6724,6791,6913,7059,7099,7139,7167,7388,7733,7991,8003,8030,8098,8230,8242,8459,8471,8589,8611,8830,8882,8927,8999,9019,9065,9169,9321,9271,9359,9463,9493,9567,9663,9707,9751,6199,6241]
                                var realSharps=[1604,1838,5215,5273,5811]
                             
                                if(realFlats.includes(Number(shortid))){
                                    noteAndAccidental.attr("accidental","flat")
                                } else if (realSharps.includes(Number(shortid))){
                                    noteAndAccidental.attr("accidental","#")
                                } 
                            }
                            if (Number(shortid) == 1186 || Number(shortid) == 1307){
                                noteAndAccidental.remove()
                            }
                            
                    
                        }
                        
                })
            }
        }
    }
}

function durationConvertor(old,dot){
    var q = g.bpm/60;
   
    if(old == "32"){
        var value = q/8
    } else if(old == "16"){
        var value = q/4
    } else if(old == "8"){
        var value = q/2
    } else if(old == "q"){
        var value = q
    } else if(old == "h"){
        var value = 2*q
    } else if(old == "w"){
        var value = 4*q
    } else {
        var value = old
    }

    if(dot == true){
        value = value + value/2
    }

    return value
}







































export function scoreInitBefore(){

    const musicXmlUrl = 'scores/BWV_847_3mesavant.xml';

    d3.select("#osmdCanvasPage1").remove()

    // Fetch the MusicXML file
    fetch(musicXmlUrl)
        .then((response) => response.text())
        .then((xmlData) => {
            
              
                var container = document.getElementById("osmdContainer");
                container.style.width = "50%"
                container.style.marginLeft = "25%"
                var container1 = document.getElementById("osmdContainerTemp");
                container1.style.width = "50%"
                container1.style.marginLeft = "25%"
                var container2 = document.getElementById("osmdContainerTemp2");
                container2.style.width = "50%"
                container2.style.marginLeft = "25%"
                //container.style.height = "200px";
               
                g.score[0] = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    drawMeasureNumbersOnlyAtSystemStart: true,
                    //renderSingleHorizontalStaffline: true,
                    //pageFormat: "endless",
                });
                g.score[1] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                g.score[2] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp2"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                    

                var loadPromise = g.score[0].load(musicXmlUrl)//i
                loadPromise.then(function() {
                                    g.score[0].render();
                                }).then(function(){
                                    unGrandReset()
                                }).then(function(){
                                    
                                    unPetitReset();
                                    var newWidth = 20000;
                                    var newHeight = 20000;
                                 
                                    d3.select("#osmdSvgPage1").attr("width",newWidth).attr("height",newHeight).attr("transform","translate("+(-newWidth/2)+","+(-newHeight/2)+")")
                                    .attr("viewBox",(-newWidth/2)+" "+(-newHeight/2)+" "+newWidth+" "+newHeight);

                                    d3.select("#measure_6").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                    d3.select("#measure_7").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                    d3.select("#measure_8").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                    
                                }).then(() => {
                                    // Remove all dynamics for now
                                    document.querySelectorAll('.dynamic.engraved.unselected')
                                        .forEach(node => node.remove())

                                    function gapExample() {
                                        setTimeout(() => {
                                            document.querySelectorAll('.system .measure').forEach(measure => {
                                                resizeMeasure(measure, { gap: 80 })
                                             
                                            })
                                            realign()
                                        }, 1000)
                                    }
                                    //gapExample()
                                    //resizeMeasuresSixandSeven()
                                });
                                    
           // }
        })
        .catch((error) => {
            console.error(error);
        })
        
        

}





export function scoreInitAfter(){

  

    d3.select("#osmdCanvasPage1").remove()
    const musicXmlUrl = 'scores/BWV_847_testapres.xml';

    

    // Fetch the MusicXML file
    fetch(musicXmlUrl)
        .then((response) => response.text())
        .then((xmlData) => {
              
                var container = document.getElementById("osmdContainer");
                container.style.width = "50%"
                container.style.marginLeft = "25%"
                var container1 = document.getElementById("osmdContainerTemp");
                container1.style.width = "50%"
                container1.style.marginLeft = "25%"
                var container2 = document.getElementById("osmdContainerTemp2");
                container2.style.width = "50%"
                container2.style.marginLeft = "25%"
                //container.style.height = "200px";
               
                g.score[0] = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    drawMeasureNumbersOnlyAtSystemStart: true,
                    //renderSingleHorizontalStaffline: true,
                    //pageFormat: "endless",
                });
                g.score[1] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                g.score[2] = new opensheetmusicdisplay.OpenSheetMusicDisplay(document.getElementById("osmdContainerTemp2"), {
                    backend: "svg",
                    drawTitle: false,
                    drawComposer: false,
                    drawCredits: false,
                    drawPartNames: false,
                    autoResize: false,
                    drawTimeSignatures: true,
                    //pageFormat: "A4_P",
                });
                    

                var loadPromise = g.score[0].load(musicXmlUrl)//i
                loadPromise.then(function() {
                                    g.score[0].render();
                                }).then(function(){
                                    unGrandReset()
                                }).then(function(){
                                    
                                    unPetitReset();
                                    var newWidth = 20000;
                                    var newHeight = 20000;
                                 
                                    d3.select("#osmdSvgPage1").attr("width",newWidth).attr("height",newHeight).attr("transform","translate("+(-newWidth/2)+","+(-newHeight/2)+")")
                                    .attr("viewBox",(-newWidth/2)+" "+(-newHeight/2)+" "+newWidth+" "+newHeight);

                                    //d3.select("#measure_6").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                    //d3.select("#measure_7").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                   // d3.select("#measure_8").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                   d3.select("#measure_9").selectAll(".symbols").selectAll("g").filter(function(){return !this.classList.contains("clef")}).remove()
                                    
                                }).then(() => {
                                    // Remove all dynamics for now
                                    document.querySelectorAll('.dynamic.engraved.unselected')
                                        .forEach(node => node.remove())

                                    function gapExample() {
                                        setTimeout(() => {
                                            document.querySelectorAll('.system .measure').forEach(measure => {
                                                resizeMeasure(measure, { gap: 80 })
                                                //console.log(getRealGap(measure))
                                            })
                                            realign()
                                        }, 1000)
                                    }
                                    //gapExample()
                                    //resizeMeasuresSixandSeven()
                                });
                                    
           // }
        })
        .catch((error) => {
            console.error(error);
        })

        

}