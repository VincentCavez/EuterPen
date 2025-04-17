import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import TimelinePlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/timeline.esm.js'
import {g} from './setup.js'

export function createAudioWidget(num,file,x,y){
    if(num == -1){
      var fzs_container = d3.select("#pensieveContainer")
    } else {
        var fzs_container = d3.select("#fzsContainer_"+num)
        x = x - g.defaultPensieveWidth
    }
 
    var aw_num = fzs_container.selectAll(".audioWidget").size()+1
    var audioWidget = d3.select("#fzsContainer_"+num).append("div").attr("class","audioWidget").attr("id","aw_"+aw_num)
        .style("position","absolute").style("left",x+"px").style("top",y+"px").style("width",380+"px").style("height",90+"px").style("background-color","none").style("z-index",1000)
      
    var size = 30

    audioWidget.append("img").attr("src","./css/purpleBin.svg").style("width",size+"px").style("height",size+"px").style("left",373+"px").style("top",(-size+7)+"px").style("position","absolute")

    const bottomTimeline = TimelinePlugin.create({
      height: 10,
      timeInterval: 1,
      primaryLabelInterval: 1,
      style: {
        fontSize: '10px',
        color: '#6A3274',
      },
    })
    
    const wavesurfer = WaveSurfer.create({
        container: "#aw_"+aw_num,
        waveColor: '#847fb8',
        progressColor: '#5d5796',
        url: URL.createObjectURL(file),
        width: 380,
        height: 60,
        minPxPerSec: 1,
        plugins: [bottomTimeline],
        cursorColor: '#fff',
      })
      
      audioWidget.select("div").style("background-color","rgba(160,127,184,0.2)").style("background-opacity","0.8").style("border-radius","10px")

      

      audioWidget.append("svg").attr("width","100%").attr("height","100%")
        .append("image").attr("href","./css/purplePlay.svg").attr("width",size).attr("height",size).attr("x",200-size/2).attr("y",0).classed("icon",true).classed("playPause",true)
          .on("click",()=>{
           
              wavesurfer.playPause()
              if(wavesurfer.isPlaying()){
                  d3.select("#aw_"+aw_num).select(".playPause").attr("href","./css/purplePause.svg")
              } else {
                  d3.select("#aw_"+aw_num).select(".playPause").attr("href","./css/purplePlay.svg")
              }
            
          })
      
}

export function audioWidget_start(event,contactId){
    var x = g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0] 
    var y = g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] 
    var w = parseFloat(d3.select(event.target.parentNode).style("width"))
    var h = parseFloat(d3.select(event.target.parentNode).style("height"))
    d3.select("#osmdContainer").node().appendChild(event.target.parentNode)
    d3.select(event.target.parentNode).style("left",(x-w/2)+"px").style("top",(y-h/2)+"px")

}


export function audioWidget_move(event,contactId){
  var x = g.touchPoints[Object.keys(g.touchPoints)[0]].x.slice(-1)[0] 
  var y = g.touchPoints[Object.keys(g.touchPoints)[0]].y.slice(-1)[0] 
  var w = parseFloat(d3.select(event.target.parentNode).style("width"))
  var h = parseFloat(d3.select(event.target.parentNode).style("height"))
   
  d3.select(event.target.parentNode).style("left",(x-w/2)+"px").style("top",(y-h/2)+"px")
}



export function audioWidget_end(event,contactId){}