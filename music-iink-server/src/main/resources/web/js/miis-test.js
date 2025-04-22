const MIIS_PARAMS = {
    width:800,
    height:120,
    top:40,
    gap:8
};

let inkedTraces = null;
let timeStamps = null;
let strokes = [];

let svgNode = null;
let pointerPos = null;
let lastPointerPos = null;

function resetCanvas(){
    d3.select("#inkTrace").selectAll("*").remove();
    lastPointerPos = null;
    inkedTraces = null;
    strokes = [];
}

function callMIIS(){
    if (strokes == null || strokes.length == 0){
        console.log("No ink...");
        return;
    }
    console.log("Calling MIIS");
    let jink = {"formats": [
                    {"channels": [{"name": "X", "type": "float32"},
                                  {"name": "Y", "type": "float32"}]}],
                "strokes": strokes,
                "active-strokes": `[0:0,${strokes.length-1}:${strokes[strokes.length-1]["X"].length-1}]`,
                "tags": [{
                    "name": "STAFF",
                    "segment": `[0:0,${strokes.length-1}:${strokes[strokes.length-1]["X"].length-1}]`,
                    "data": {
                      "count": 5,
                      "top": MIIS_PARAMS.top,
                      "gap": MIIS_PARAMS.gap
                    },
                    "id": 1 }
                ],                   
                "new-tag-id": 2
              };
    sendJINKForRecog(jink);
    // d3.json("/data/music.jink").then((tjink) => sendJINKForRecog(tjink));
};

function sendJINKForRecog(jink){
    let sjson = JSON.stringify(jink);
    d3.select("#res").text("Calling...");    
    fetch('http://127.0.0.1:8086/myscriptmusic', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: sjson
        }).then((response) => response.text()).then(function(text){
            const parser = new DOMParser();
            let musicXML = parser.parseFromString(text, "application/xml");
            d3.select("#res").text("done");    
        });
}

function initInkCanvas(){
 
    d3.select("#inkRegion")
      .append("svg")
      .attr("width", MIIS_PARAMS.width)
      .attr("height", MIIS_PARAMS.height);
    d3.select("svg")
      .append("g")
      .attr("id", "staff");
    d3.select("#staff").selectAll("line")
      .data([...Array(5).keys()])
      .enter()
      .append("line")
      .attr("x1", 10)
      .attr("y1", (d) => (d*MIIS_PARAMS.gap+MIIS_PARAMS.top))
      .attr("x2", MIIS_PARAMS.width-10)
      .attr("y2", (d) => (d*MIIS_PARAMS.gap+MIIS_PARAMS.top))
      .attr("stroke", "black");
    d3.select("svg").append("g").attr("id", "inkTrace").classed("inkMark", true);

    svgNode = d3.select("svg").node();
    pointerPos = svgNode.createSVGPoint();

    d3.select("svg").on("touchstart", function(e){
        downPointer(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    });

    d3.select("svg").on("touchmove", function(e){
        movePointer(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    });

    d3.select("svg").on("touchend", function(e){
        upPointer();
    });

    d3.select("svg").on("pointerdown", function(e){
        downPointer(e.x, e.y);
    });

    d3.select("svg").on("pointermove", function(e){
        if (lastPointerPos){
            movePointer(e.x, e.y);
        }
    });

    d3.select("svg").on("pointerup", function(e){
        upPointer();
    });

}

function downPointer(x, y){
    lastPointerPos = getCoords(x,y);
    let currentdate = new Date();
    let timestamp = `${currentdate.getFullYear()}-${currentdate.getMonth()+1}-${currentdate.getDate()} ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}.${currentdate.getMilliseconds()}`;
    if (inkedTraces == null){
        inkedTraces = [[[lastPointerPos.x, lastPointerPos.y]]];
    }
    else {
        inkedTraces.push([[lastPointerPos.x, lastPointerPos.y]]);
    }
    if (timeStamps == null){
        timeStamps = [timestamp];
    }
    else {
        timeStamps.push(timestamp);
    }
}

function movePointer(x, y){
    let xy = getCoords(x, y);
    d3.select("#inkTrace")
      .append("line")
      .attr("class", "inkMark")
      .attr("x1", lastPointerPos.x)
      .attr("y1", lastPointerPos.y)
      .attr("x2", xy.x)
      .attr("y2", xy.y);
    lastPointerPos = xy;
    inkedTraces[inkedTraces.length-1].push([lastPointerPos.x, lastPointerPos.y]);
}

function upPointer(){
    pushTrace();
    lastPointerPos = null;
    inkedTraces = null;
    timeStamps = null;
}

function pushTrace(){
    let stroke = {
          "format": 0,
          "timestamp": timeStamps[timeStamps.length-1],
          "X": inkedTraces[inkedTraces.length-1].map(coords => coords[0]),
          "Y": inkedTraces[inkedTraces.length-1].map(coords => coords[1])
    };
    strokes.push(stroke);
}

function getCoords(x,y){
    pointerPos.x = x;
    pointerPos.y = y;
    return pointerPos.matrixTransform(svgNode.getScreenCTM().inverse());
}
