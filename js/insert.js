import { g } from './setup.js';



export function insertMeasures(contactId,num){
    var x = g.penPoints[contactId].xstart;
    var y = g.potentialSystem;
   
    var dist = math.abs(d3.select("#system_1").node().getBBox().y+ d3.select("#system_1").node().getBBox().height/2 - y);
    var system = null;

    d3.selectAll('.system').each(function(){
        var system_midY = this.getBBox().y+ this.getBBox().height/2;
     
        if (math.abs(system_midY - y) <= dist){
            dist = math.abs(system_midY - y);
            system = d3.select(this);
        }
    });

    var previousMeasure = null;
    var measures = system.selectAll('.measure')
    var nextMeasure = measures.filter(function() {
        return d3.select(this).attr("number") == d3.min(measures.nodes(), function(d) {
            return d3.select(d).attr("number");
        });
        });

    dist = math.abs(nextMeasure.node().getBBox().x - x);
    system.selectAll('.measure').each(function(){
        var measure_X = this.getBBox().x + this.getBBox().width;
        if (math.abs(measure_X - x) < dist){
            dist = math.abs(measure_X - x);
            previousMeasure = d3.select(this);
        }
    });

    var sId = Number(system.attr("number"));
    var staffGap = g.gap;
    
    
    if(previousMeasure == null){
        var newMeasureSize = nextMeasure.node().getBBox().width;
        var mId = Number(nextMeasure.attr("number"));
        var newMeasure_X = nextMeasure.node().getBBox().x;
        var staffs_Y = [];
        nextMeasure.selectAll(".staff").each(function(){
            staffs_Y.push(d3.select(this).select(".lines").node().getBBox().y);
        });
      
        shiftMeasuresInSystem(system,(mId-1),newMeasureSize,num)
        generatePaperMeasure(sId,mId,newMeasure_X,staffs_Y,newMeasureSize,staffGap,"first",num)// we generate a new measure at the beginning of the system, copying the next one

    } else {
        var newMeasureSize = previousMeasure.node().getBBox().width;
        var mId = Number(previousMeasure.attr('number'))+1;
        var newMeasure_X = previousMeasure.node().getBBox().x+previousMeasure.node().getBBox().width;
        var staffs_Y = [];
        previousMeasure.selectAll(".staff").each(function(){
            staffs_Y.push(d3.select(this).select(".lines").node().getBBox().y);
        });
        shiftMeasuresInSystem(system,(mId-1),newMeasureSize,num)
        generatePaperMeasure(sId,mId,newMeasure_X,staffs_Y,newMeasureSize,staffGap,"next",num)// we generate a new measure after another, copying the previous one
    }
    
    
}


export function insertThreeMeasures(barlines){
    var shift_y = 230;
    var system_duplicate=d3.select("#system_3").node().cloneNode(true);
    d3.select("#osmdSvgPage1").node().appendChild(system_duplicate);
    d3.select(system_duplicate).attr("id","system_0").attr("number","0").attr("transform","translate(0,"+shift_y+")");
    d3.selectAll(".system").filter(function(){
        return d3.select(this).attr("number") > 3;
    }).each(function(){
        d3.select(this).attr("transform","translate(0,"+shift_y+")");
        d3.select(this).selectAll(".measureNumber").remove();
    });

    
    
    d3.select("#system_0").selectAll(".measure").filter(function(){
        return d3.select(this).attr("number") < 8;
    }).selectAll("g").filter(function(){
        return !this.classList.contains("vf-keysignature") && !this.classList.contains("clef") && !this.classList.contains("time-signature") && !this.classList.contains("barLines") && !this.classList.contains("lines") && !this.classList.contains("staff") && !this.classList.contains("bracket") && !this.classList.contains("symbols");
    }).remove();
    
    d3.select("#system_3").select("#measure_8").selectAll("g,rect").filter(function(){
        return !this.classList.contains("barLines") && !this.classList.contains("lines") && !this.classList.contains("staff") && !this.classList.contains("barLineLeft");
    }).remove();
    d3.select("#system_0").select("#measure_7").select(".barLines").remove();
    d3.select("#system_0").select(".measureNumber").remove();


    var rightLimit = d3.select("#borderlineRight").node().getBBox().x;
    var size = 30;
    d3.selectAll(".system").filter(function(){
        return Number(d3.select(this).attr("number")) == 3 || Number(d3.select(this).attr("number")) == 0;
    }).each(function(){
        var top = d3.select(this).select(".staffLineTop").node().getBBox().y - 15;
        d3.select(this).append("image").attr("href","./css/brownResize.svg").attr("class","resize").attr("x",rightLimit - size).attr("y",top - size).attr("width",size).attr("height",size).attr("number",d3.select(this).attr("number"))
    });
}






function shiftMeasuresInSystem(system,previousmId,width,num){

    system.selectAll(".measure").filter(function(){
        return d3.select(this).attr("number") > previousmId;
    }).each(function(){
        d3.select(this).transition().duration(500).attr("transform","translate("+(num*width)+",0)")
    })

    d3.selectAll(".measure").filter(function(){
        return d3.select(this).attr("number") > previousmId;
    }).each(function(){
        var old_mId = Number(d3.select(this).attr("number"))
        d3.select(this).attr("id","measure_"+(old_mId+num)).attr("number",old_mId+num)

        d3.select(this).selectAll('.staff').each(function(){
            var old_stId = Number(d3.select(this).attr("number"))
            d3.select(this).attr("id","staff_"+(old_stId+num)).attr("measure",old_mId+num).attr("number",old_stId+num)
        })
    })
}







function generatePaperMeasure(sId,mId,x,vector_y,width,gap,position,num){

    if(position == "first"){
        var exampleMeasure = d3.select("#measure_"+(mId+num))
    } else if (position == "next"){
        var exampleMeasure = d3.select("#measure_"+(mId-1))
    }
   
    var barLineY = exampleMeasure.select(".barLines").node().getBBox().y;
    var barLineHeight = exampleMeasure.select(".barLines").node().getBBox().height;
    
    var system = d3.select("#system_"+sId);
   
    for(var j = 1; j <= num; j++){
        var measure = system.append("g").attr("class","measure").attr("id","measure_"+(mId+j-1)).attr("system",sId).attr("number",(mId+j-1));
        generateBarLines(measure,(x+width*(j-1)),barLineY,width,barLineHeight)
        
        if(position == "first"){
            exampleMeasure.selectAll(".staff").each(function(d,i){
                var nextstId = Number(d3.select(this).attr("number"));
                var staff = measure.append("g").attr("class","staff").attr("id","staff_"+(nextstId-j)).attr("measure",mId).attr("system",sId).attr("number",(nextstId-j));  
                generateStaffLines(staff,(x+width*(j-1)),vector_y[i],width,gap,100)
            })
        } else if (position == "next"){
            exampleMeasure.selectAll(".staff").each(function(d,i){
                var previousstId = Number(d3.select(this).attr("number"));
                var staff = measure.append("g").attr("class","staff").attr("id","staff_"+(previousstId+j)).attr("measure",mId).attr("system",sId).attr("number",(previousstId+j));  
                generateStaffLines(staff,(x+width*(j-1)),vector_y[i],width,gap,100)
            })
        }
    }
    
    

    
    
}





export function generateBarLines(measure,x,y,width,height){
    var color = "black";
    var barLines = measure.append("g").attr("class","barLines")

    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none")
            .attr("x",x).attr("y",y).attr("width",1).attr("height",height).attr("class","barLineLeft")
    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none")
            .attr("x",x+width).attr("y",y).attr("width",1).attr("height",height).attr("class","barLineRight")
}

export function generateThreeBarLines(measure,x,y,width,height){
    var color = "black";
    var barLines = measure.append("g").attr("class","barLines")

    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none").style("opacity",0.2)
            .attr("x",x).attr("y",y).attr("width",1).attr("height",height).attr("class","barLineLeft")
    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none")
            .attr("x",x+110).attr("y",y).attr("width",1).attr("height",height)
    barLines.append("rect").attr("stroke-width",0.3).attr("fill",color).attr("stroke",color).attr("stroke-dasharray","none")
            .attr("x",x+width).attr("y",y).attr("width",1).attr("height",height).attr("class","barLineRight")
}

export function generateStaffLines(staff,x,y,width,gap,dur){
    
    var lines = staff.append("g").attr("class","lines")
    for(var i = 0; i < 5; i++){
        lines.append("path").transition().delay(i*dur+dur).duration(5*dur).attr("stroke-width",1).attr("stroke","black").attr("stroke-dasharray","none")
            .attr("d","M"+x+" "+(y+gap*i)+" H"+(x+width))
    }
}

export function generateFakeStaffLines(staff,x,y,width,gap,dur){
    
    var lines = staff.append("g").attr("class","lines")
    for(var i = 0; i < 5; i++){
        lines.append("path").transition().delay(i*dur+dur).duration(5*dur).attr("stroke-width",1).attr("stroke","black").attr("stroke-dasharray","none").style("opacity",0.2)
            .attr("d","M"+x+" "+(y+gap*i)+" H"+(x+width))
    }
}