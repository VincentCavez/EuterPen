
import {deselect_all, findThisMeasure, findThisStaff, measureDeselection, measureSelection,staffSelection, popIcons} from '../tools.js';




export function graduallySelectMeasures(xstart,ystart,x,y){
    var firstMeasure = findThisMeasure(xstart,ystart)
    var lastMeasure = findThisMeasure(x,y)
    var firstMeasureNum = d3.min([Number(firstMeasure.attr("number")),Number(lastMeasure.attr("number"))])
    var lastMeasureNum = d3.max([Number(firstMeasure.attr("number")),Number(lastMeasure.attr("number"))])
    var arrayNum = Array(lastMeasureNum-firstMeasureNum+1).fill(0).map((x,i)=>i+firstMeasureNum)
    var measures = d3.selectAll(".measure").filter(function(){return arrayNum.includes(Number(d3.select(this).attr("number")))})
    
    deselect_all()
    measureContentSelection(measures)
    popIcons()
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
    popIcons()
}
