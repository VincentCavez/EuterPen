



import {g, shortId} from './setup.js';
import { CHECKPOINT , changePathColor, wait, hideMeasureEight} from './tools.js';
import { searchMatches, closeMatches } from './search.js';
import { playSelection } from './play.js';
import { magicPaste, putSelectionInPasteBox , revealFakePaste, overwriteSelection, pastePitches} from './copy.js';


export function icon_selection_start(event,contactId){
    if(d3.select(event.target).attr("id")=="selectionBin"){
        d3.select("#selectionBin").attr("href","./css/darkblueBin.svg")
        g.context["pen"] = "icon_selection_bin"

    } else if (d3.select(event.target).attr("id")=="selectionCopy"){
        d3.select("#selectionCopy").attr("href","./css/darkblueCopy.svg")
        g.context["pen"] = "icon_selection_copy"
        
    } else if (d3.select(event.target).attr("id")=="selectionPaste"){
        d3.select("#selectionPaste").attr("href","./css/darkbluePaste.svg")
        g.context["pen"] = "icon_selection_paste"
        
    } else if (d3.select(event.target).attr("id")=="selectionPlay"){
        d3.select("#selectionPlay").attr("href","./css/darkbluePlay.svg")
        g.context["pen"] = "icon_selection_play"

    } else if (d3.select(event.target).attr("id")=="selectionSearch"){
        d3.select("#selectionSearch").attr("href","./css/darkblueSearch.svg")
        g.context["pen"] = "icon_selection_search"

    } else if (d3.select(event.target).attr("id")=="selectionBeautify"){
        d3.select("#selectionBeautify").attr("href","./css/darkblueBeautify.svg")
        g.context["pen"] = "icon_selection_beautify"

    } else if (d3.select(event.target).attr("id")=="selectionEdit"){
            d3.select("#selectionEdit").attr("href","./css/darkblueEdit.svg")
            g.context["pen"] = "icon_selection_edit"

    // Upside Down //

    } else if (d3.select(event.target).attr("id")=="selectionPause"){
        d3.select("#selectionPause").attr("href","./css/darkorangeStop.svg")
        g.context["pen"] = "icon_selection_play"

    } else if (d3.select(event.target).attr("id")=="searchCancel"){
        d3.select("#searchCancel").attr("href","./css/darkorangeSearch.svg")
        g.context["pen"] = "icon_selection_search"

    } else if (d3.select(event.target).attr("id")=="beautifyCancel"){
        d3.select("#beautifyCancel").attr("href","./css/darkorangeBeautify.svg")
        g.context["pen"] = "icon_selection_beautify"

    } else if (d3.select(event.target).attr("id")=="selectionEdit"){
        d3.select("#selectionEdit").attr("href","./css/darkorangeCanceledit.svg")
        g.context["pen"] = "icon_selection_edit"
    }

}

export function icon_selection_move(event,contactId){
    
    if(g.context["pen"] == "icon_selection_bin"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionBin").attr("href","./css/darkblueBin.svg")
        } else {
            d3.select("#selectionBin").attr("href","./css/blueBin.svg")
        }
    } else if (g.context["pen"] == "icon_selection_copy"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionCopy").attr("href","./css/darkblueCopy.svg")
        } else {
            d3.select("#selectionCopy").attr("href","./css/blueCopy.svg")
        }
    } else if (g.context["pen"] == "icon_selection_paste"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionPaste").attr("href","./css/darkbluePaste.svg")
        } else {
            d3.select("#selectionPaste").attr("href","./css/bluePaste.svg")
        }
    } else if (g.context["pen"] == "icon_selection_play"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionPlay").attr("href","./css/darkbluePlay.svg")
            d3.select("#selectionPause").attr("href","./css/darkorangeStop.svg")
        } else {
            d3.select("#selectionPlay").attr("href","./css/bluePlay.svg")
            d3.select("#selectionPause").attr("href","./css/orangeStop.svg")
        }
    } else if (g.context["pen"] == "icon_selection_search"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionSearch").attr("href","./css/darkblueSearch.svg")
            d3.select("#searchCancel").attr("href","./css/darkorangeSearch.svg")
        } else {
            d3.select("#selectionSearch").attr("href","./css/blueSearch.svg")
            d3.select("#searchCancel").attr("href","./css/orangeSearch.svg")
        }
    } else if (g.context["pen"] == "icon_selection_beautify"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionBeautify").attr("href","./css/darkblueBeautify.svg")
            d3.select("#beautifyCancel").attr("href","./css/darkorangeBeautify.svg")
        } else {
            d3.select("#selectionBeautify").attr("href","./css/blueBeautify.svg")
            d3.select("#beautifyCancel").attr("href","./css/orangeBeautify.svg")
        }
    } else if (g.context["pen"] == "icon_selection_edit"){
        if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
            d3.select("#selectionEdit").attr("href","./css/darkblueEdit.svg")
            d3.select("#editCancel").attr("href","./css/darkorangeCanceledit.svg")
        } else {
            d3.select("#selectionEdit").attr("href","./css/blueEdit.svg")
            d3.select("#editCancel").attr("href","./css/orangeCanceledit.svg")
        }
    } 

}
export function icon_selection_end(event,contactId){
    
    if(document.elementFromPoint(event.clientX, event.clientY).parentNode.id == "iconsBox"){
        if(g.context["pen"] == "icon_selection_bin"){
            //hideMeasureEight()
            d3.select("#iconsBox").remove()
            d3.selectAll(".contentSelected").classed("contentSelected",false)

            d3.selectAll(".selected").remove()
            d3.select(".lasso").remove()
            d3.selectAll(".linkedMatch").remove()
            d3.selectAll(".matchBox").remove()
            d3.selectAll(".matchRect").remove()
            
        } else if (g.context["pen"] == "icon_selection_copy"){
            if(d3.select(event.target).attr("id")=="selectionCopy"){
                d3.select("#selectionCopy").attr("href","./css/blueCopy.svg")
                d3.selectAll(".selected").classed("copied",true)
                //putSelectionInPasteBox()

            }
        } else if (g.context["pen"] == "icon_selection_paste"){
            if(d3.select(event.target).attr("id")=="selectionPaste"){
                //magicPaste()//rhythmic
                d3.select("#selectionPaste").attr("href","./css/bluePaste.svg")
                //putSelectionInPasteBox()
                overwriteSelection()
                //pastePitches()
            }  

        } else if (g.context["pen"] == "icon_selection_play"){
            if(d3.select(event.target).attr("id")=="selectionPlay"){

                playSelection()
                

                //play a middle 'C' for the duration of an 8th note
                //synth.triggerAttackRelease(["C4","D4","E4"], "8n");



                d3.select("#selectionPlay").attr("href","./css/orangeStop.svg").attr("id","selectionPause")
            } else {

                g.synth.context._timeouts.cancel(0);
                g.synth.dispose()
                d3.select("#selectionPause").attr("href","./css/bluePlay.svg").attr("id","selectionPlay") 
                 
            }
        } else if (g.context["pen"] == "icon_selection_search"){
            if (d3.select(event.target).attr("id") == "selectionSearch") {
                
                searchMatches();
            
            } else {
                // ------------------------------------ //
                // ---------- SEARCH CANCEL ----------- //
                // ------------------------------------ //
                
                closeMatches();
                d3.select("#miniScore").remove();
               
            }
        } else if (g.context["pen"] == "icon_selection_beautify"){
            if(d3.select(event.target).attr("id")=="selectionBeautify"){
               
                
                d3.select("#selectionBeautify").attr("href","./css/orangeBeautify.svg").attr("id","beautifyCancel")
                d3.selectAll(".selected").filter(function(){
                    return d3.select(this).node().classList.contains("writing") 
                }).attr("visibility","hidden")

                if(d3.selectAll(".selected").size()==1){
                    d3.selectAll(".writing").remove();
                    d3.select("#secretBarLine").style("visibility","visible").classed("selected",true).classed("unselected",false)
                    changePathColor(d3.select("#secretBarLine"),g.selectedColor)
                } else {

                
                    d3.selectAll(".justEngraved").attr("visibility","visible").each(function(){
                        var index = d3.select(this).attr("index")
                        var newx = d3.selectAll("[index='"+index+"']").filter(function(){
                            return !d3.select(this).node().classList.contains("justEngraved")
                        }).node().getBoundingClientRect().left
                        var oldx = parseFloat(d3.select(this).attr("originalXPos"))
                        var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                        d3.select(this).transition().duration(200).attr("transform","translate("+(newx-oldx-g.defaultPensieveWidth)+","+oldTransform[2]+")")
                    })
                }
                  
                
                
            } else {
                d3.select("#beautifyCancel").attr("href","./css/blueBeautify.svg").attr("id","selectionBeautify")
                d3.selectAll(".justEngraved").attr("visibility","visible").each(function(){
                    var newx = parseFloat(d3.select(this).attr("writingXPos"))
                    var oldx = parseFloat(d3.select(this).attr("originalXPos"))
                    var oldTransform = d3.select(this).attr("transform").match(/translate\(([^,]+),([^)]+)\)/);
                    d3.select(this).transition().duration(200).attr("transform","translate("+(newx-oldx-g.defaultPensieveWidth)+","+oldTransform[2]+")")
                })
                wait(200).then(() => {
                    d3.selectAll(".selected").filter(function(){
                        return d3.select(this).node().classList.contains("writing")
                    }).attr("visibility","visible")
                    d3.selectAll(".justEngraved").attr("visibility","hidden")
                })
            }
            
        } else if (g.context["pen"] == "icon_selection_edit"){
            if (d3.select(event.target).attr("id") == "selectionEdit") {
               
                d3.select("#selectionEdit")
                    .attr("href", "./css/orangeCanceledit.svg")
                    .attr("id", "editCancel");
              
            } else {
              
                d3.select("#editCancel")
                    .attr("href", "./css/blueEdit.svg")
                    .attr("id", "selectionEdit");
                
            }
        } 
        
    }
}


