function createSvgElement(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag)
}

// <path stroke-width="1" fill="none" stroke="#000000" stroke-dasharray="none" d="M455.5595062255861 134L741.2516524511723 134"></path>
// <line x1="20" y1="100" x2="100" y2="20"/>
function pathToLine(path) {
  const line = createSvgElement('line')
  
  // copy attrs
  for (let i = 0; i < path.attributes.length; i++){
    const attr = path.attributes.item(i)
    if (attr.nodeName === 'd') continue // do not copy d attr    
    line.setAttribute(attr.nodeName, attr.value)
  }

  const p = path.getAttribute('d').match(/-?\d+(\.\d+)?/g)
  line.setAttribute('x1', p.at(0))
  line.setAttribute('y1', p.at(1))
  line.setAttribute('x2', p.at(-2))
  line.setAttribute('y2', p.at(-1))

  return line
}

export function getRealGap(measure) {
  const staffs = measure.querySelectorAll('.staff')
  return staffs.length <= 1 ? 0 : staffs[1].querySelector('.staffLineTop').getBoundingClientRect().y
      - staffs[0].querySelector('.staffLineBottom').getBoundingClientRect().y
}

export function getGap(measure) {
  const staffs = measure.querySelectorAll('.staff')
  return staffs.length <= 1 ? 0 : staffs[1].querySelector('.staffLineTop').getBBox().y
      - staffs[0].querySelector('.staffLineBottom').getBBox().y
}

export function getGapHeight(measure) {
  const staffs = measure.querySelectorAll('.staff')
  return staffs.length <= 1 ? 0 : staffs[1].querySelector('.staffLineBottom').getBBox().y
      - staffs[0].querySelector('.staffLineTop').getBBox().y
}

export function resizeMeasure(measure, opts) {
  if (!opts) return
  let {width, height, gap} = opts // TODO support height?

  if (!measure.__origSize__) {
    measure.__origSize__ = measure.getBBox()
  }
  if (!measure.__origGap__) {
    measure.__origGap__ = getGap(measure)
  }
  
  if (gap) {
    measure.querySelectorAll('.staff').forEach((staff, i) => {
      if (i === 0) return
      staff.setAttribute('transform', `translate(0,${gap - measure.__origGap__})`)
    })
    measure.querySelectorAll('.barLineLeft').forEach(barLine => {
      barLine.setAttribute('height', getGapHeight(measure) + gap - measure.__origGap__)
    })
    measure.querySelectorAll('.barLineRight').forEach(barLine => {
      barLine.setAttribute('height', getGapHeight(measure) + gap - measure.__origGap__)
    })
  }

  if (!width) return

  const mbox = measure.__origSize__
  function linearMove(symbol) {
    symbol.setAttribute('transform', '')

    const sbox = symbol.getBBox()
    const vx = (sbox.x - mbox.x) / mbox.width
    symbol.setAttribute(
      'transform',
      `translate(${vx*width + mbox.x - sbox.x},0)`
    )      
  }
  
  measure.querySelectorAll('.staff').forEach(staff => {
    // convert path to lines
    staff.querySelectorAll('.lines path').forEach(path => {
      const line = pathToLine(path)
      path.replaceWith(line)
    })
    // resize lines
    staff.querySelectorAll('.lines line').forEach(line => {
      line.setAttribute('x2', parseFloat(line.getAttribute('x1')) + width)
    })

    // move noteHead and rest
    staff.querySelectorAll('.symbols .noteHead').forEach(linearMove)
    staff.querySelectorAll('.symbols .rest').forEach(linearMove)

    function moveSymbolWithNote(symbol) {
      symbol.setAttribute('transform', '')

      const id = symbol.getAttribute('index')
      const note = staff.querySelector(`.noteHead[index="${id}"]`)
      const sbox = note.getBBox()
      
      const vx = (sbox.x - mbox.x) / mbox.width
      symbol.setAttribute(
        'transform',
        `translate(${vx*width + mbox.x - sbox.x},0)`
      )      
    }

    staff.querySelectorAll('.symbols .stem').forEach(moveSymbolWithNote)
    staff.querySelectorAll('.symbols .flag').forEach(moveSymbolWithNote)
    staff.querySelectorAll('.symbols .accidental').forEach(moveSymbolWithNote)
    staff.querySelectorAll('.symbols .ledgerLine').forEach(moveSymbolWithNote)

    // for each beam, compute the nearest end note
    staff.querySelectorAll('.symbols .beam path').forEach(path => {
      if (path.__nearest__) return // only the first time

      const x = path.getAttribute('d').match(/-?\d+(\.\d+)?/g).at(-2)
      const stems = Array.from(staff.querySelectorAll('.symbols .stem'))
      let nearest = stems[0]

      function stemX(stem) {
        return stem.querySelector('path').getAttribute('d').match(/-?\d+(\.\d+)?/g).at(0)
      }

      for (const stem of stems) {
        if (Math.abs(stemX(stem) - x) < Math.abs(stemX(nearest) - x)) {
          nearest = stem
        }
      }

      path.__nearest__ = nearest
      //path.parentElement.setAttribute('endIndex', nearest)
    })

    // set the path end of each beam to the nearest end note (precomputed before) 
    staff.querySelectorAll('.symbols .beam').forEach(beam => {
      moveSymbolWithNote(beam)
      const path = beam.querySelector('path')
      const d = path.getAttribute('d')
      const v = d.match(/-?\d+(\.\d+)?/g).map(parseFloat)
      const x = path.__nearest__.getBBox().x
      const no = parseFloat(path.__nearest__.getAttribute('transform').match(/-?\d+(\.\d+)?/g)[0])
      const so = parseFloat(beam.getAttribute('transform').match(/-?\d+(\.\d+)?/g)[0])

      // above or under the middle line
      const middleY = (beam.closest('.staff').querySelectorAll('line'))[2].getBBox().y
      let yOffset = (v[1] < middleY ? 1 : -1) * 2.5 // stroke-width * .5 = 2.5
      if (path.__offsetApplied) yOffset = 0 // only apply the offset the first time
      path.__offsetApplied = true

      path.setAttribute('d', `M${v[0]} ${v[1]+yOffset}L${x+no-so} ${v.at(-1)+yOffset}`)
      path.setAttribute('stroke', '#000000')
      path.setAttribute('stroke-width', '5')
    })
  })

  // move barLines
  measure.querySelectorAll('.barLineRight').forEach(linearMove)
  //measure.querySelectorAll('.barLineLeft').forEach(linearMove)
}

export function realign() {
  const offset = 25//largeur d'une accolade
  let y = 25
  document.querySelectorAll('.system').forEach(system => {
    system.setAttribute('transform', `translate(0, ${y - system.getBBox().y})`)
    y += system.getBoundingClientRect().height + 25

    let x = offset
    system.querySelectorAll('.measure').forEach(measure => {
      measure.setAttribute('transform', `translate(${x + offset - measure.getBBox().x},0)`)
      x += measure.getBoundingClientRect().width
    })
  })
}

// TODO function to compute min horizontal dist between notes (even after resizing)

export function resizeSystem(num){
  var measures = [];
  var measuresInitialSizes = [];
  var shift = 144;
  d3.select("#system_"+num).selectAll(".measure").each(function(){
    measures.push(this);
    measuresInitialSizes.push(this.getBoundingClientRect().width);
  })
 

  for(var i = 0; i < measures.length; i++){
    const measure = measures[i];
    const initial = measuresInitialSizes[i];
    resizeMeasure(measure,{ width: initial+ shift });
  }

  d3.select("#system_"+num).select("#measure_7").attr("transform", "translate(" +  (shift) + ",0)");
  d3.select("#system_"+num).select("#measure_8").attr("transform", "translate(" +  (shift*2) + ",0)");
  d3.select("#system_"+num).select("#measure_8").selectAll(".lines").remove()
  d3.select("#system_"+num).select(".resize").remove()

}