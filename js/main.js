var DEFAULT_CITY = "Atlanta city, GA"
var DEFAULT_SECONDARY = "Chicago city, IL"

var PERCENT = d3.format(".1%")
var HOUSEHOLDS = d3.format(".3s") //max NYC white 1209318
var TOTALWEALTH = function(val){ return d3.format('$.3s')(val).replace("G","B") } //max NYC white 549000000000.00 -> $549B
var AVGWEALTH =  d3.format("$.3s") //max Santa Monica white, 4476061.069 -> $4.48M

const CHANGE_TYPE_DURATION = 1000;
const CHANGE_PLACE_DURATION = 1000;

const GROUPED_BAR_PADDING = .3;
const GROUPED_BAR_PAIR_PADDING = 10;
const CHART_MARGINS = {top: 20, right: 70, bottom: 100, left: 80}
const CHART_WIDTH = 315;  
const CHART_HEIGHT = 520;
const MAIN_STACKED_OFFSET = -40;
const SECONDARY_STACKED_OFFSET = -10;
const STACKED_DOUBLE_CAT_LABEL_POS = 180;
const STACKED_SINGLE_CAT_LABEL_POS = 90;
const STACKED_SINGLE_DATA_LABEL_POS = -30;
const HARD_TICK_ALIGN = {
                          "Black" : -22,
                          "Hispanic" : 0,
                          "Asian" : -20,
                          "White" : -16,
                          "Other" : -17
                        }

const ACTIVE_BLUE = "#1696d2"
const ACTIVE_GREEN = "#55B748"
const DEACTIVE_BLUE = "#A2D4EC"
const DEACTIVE_GREEN = "#BCDEB4"
const DEFAULT_TEXT = "#353535"

const CHART_TITLES = {
  "grouped": {
    "hhs": "Total households",
    "hw": "Total primary residence wealth",
    "ho_rate": "Homeownership rates",
    "mean_hv": "Home values"
  },
  "stacked": {
    "hhs": "Distribution of household population",
    "hw": "Distribution of primary residence wealth",
    "ho_rate": "Homeownership rates",
    "mean_hv": "Home values"
  }
}

function getChartType(varSuffix){
  if(varSuffix == "ho_rate" || varSuffix == "mean_hv") return "grouped";
  else return d3.select(".toggle").classed("on") ? "grouped" : "stacked";
}

function getChartMargins(){
  return CHART_MARGINS;
}
function getChartWidth(){
  var margin = getChartMargins();

  return CHART_WIDTH - margin.left - margin.right
}
function getChartHeight(varSuffix, chartType, secondaryVisible){
  var ct = chartType ?  chartType : getChartType(varSuffix),
      H = (secondaryVisible && ct == "grouped") ? 1 : .5,
      margin = getChartMargins()

  return (CHART_HEIGHT - margin.top - margin.bottom)*H;
}
function getActiveRace(){
  return 'white'
}
function getPlaceMain(){
  return d3.select(".dataBinder.placeMain").datum()
}
function getPlaceSecondary(){
  return d3.select(".dataBinder.placeSecondary").datum()
}
function getSecondaryVisible(){
  return d3.select("#placeClose").classed("active")
}

function formatLabel(val, varSuffix, chartType){
  if(typeof(chartType) == "undefined") chartType = getChartType(varSuffix)

  if(chartType == "stacked") return PERCENT(val)
  if(varSuffix == "hhs") return HOUSEHOLDS(val)
  if(varSuffix == "mean_hv") return AVGWEALTH(val)
  if(varSuffix == "ho_rate") return PERCENT(val)
  if(varSuffix == "hw") return TOTALWEALTH(val)
}


d3.csv("data/source/by_place_noCDPs_2019.csv")
  .then(function(data){
    initControls(data)

    var placeMain = DEFAULT_CITY,
        placeSecondary = "",
        // placeSecondary = DEFAULT_SECONDARY,
        default_datum = data.filter(function(c){ return c.placenm == placeMain})[0],
        secondary_datum = (placeSecondary == "" || placeSecondary == placeMain) ?
                        default_datum :
                        data.filter(function(c){ return c.placenm == placeSecondary})[0],
        secondaryVisible = (placeSecondary != "" && placeSecondary != placeMain)

    d3.select(".dataBinder.placeMain").datum(default_datum)
    d3.select(".dataBinder.placeSecondary").datum(secondary_datum)

    d3.selectAll(".placeMain.placeLabel").text(default_datum.placenm)

    init(default_datum, secondary_datum, secondaryVisible)
  })


function initControls(data){
  var placeNames = data.map(d => d.placenm)

  $( function() {
    $( "#placeMain" ).autocomplete({
      source: placeNames,
      select: function( event, ui ) {
        var placeName = ui.item.value,
            place = data.filter(d => d.placenm == placeName)[0]

        updatePlaces(place, false)
      }
    })
    .click(function(){
      $(this).val("")
    })
    .blur(function(){
      $(this).val(getPlaceMain().placenm)
    })
  });

  $( function() {
    $( "#placeSecondary" ).autocomplete({
      source: placeNames,
      select: function( event, ui ) {
        var placeName = ui.item.value,
            place = data.filter(d => d.placenm == placeName)[0]
      
        d3.select("#placeClose").classed("active", true)

        updatePlaces(false, place)
      }
    })
    .click(function(){
      $(this).val("")
    })
    .blur(function(){
      if(getPlaceSecondary()){ $(this).val(getPlaceSecondary().placenm) }
    })
  });

  d3.select("#placeClose")
    .on("click", function(){
      d3.select("#placeClose").classed("active", false)
      $( "#placeSecondary" ).val('')
      updatePlaces(false, false)
    })

  d3.select(".toggle").on("click", function(){
    var chartType;
    if(d3.select(this).classed("on")){
      d3.select(this).classed("on", false)
      d3.select(this).classed("off", true)
      chartType = "stacked"
    }else{
      d3.select(this).classed("on", true)
      d3.select(this).classed("off", false)
      chartType = "grouped"
    }
    updateChartTypes(chartType)
  })
}



function init(placeMain, placeSecondary, secondaryVisible){
  $("#placeMain").val(placeMain.placenm)

  if(secondaryVisible){
    $("#placeSecondary").val(placeSecondary.placenm)
    d3.select("#placeClose").classed("active", true)
  }else{
    $("#placeSecondary").val('')
    d3.select("#placeClose").classed("active", false)
  }

  buildChart("hhs", placeMain, placeSecondary, secondaryVisible)
  buildChart("hw", placeMain, placeSecondary, secondaryVisible)
  buildChart("ho_rate", placeMain, placeSecondary, secondaryVisible)
  buildChart("mean_hv", placeMain, placeSecondary, secondaryVisible)

  updateChartType("hhs", "stacked", false, secondaryVisible)
  updateChartType("hw", "stacked", false, secondaryVisible)
}

function updatePlaces(placeMain, placeSecondary){
  if(placeMain){ d3.select(".dataBinder.placeMain").datum(placeMain) }
  d3.select(".dataBinder.placeSecondary").datum(placeSecondary)

  if(placeMain){ d3.selectAll(".placeMain.placeLabel").text(placeMain.placenm) }

  updatePlace("hhs", placeMain, placeSecondary)
  updatePlace("hw", placeMain, placeSecondary)
  updatePlace("ho_rate", placeMain, placeSecondary)
  updatePlace("mean_hv", placeMain, placeSecondary)
}
function updateChartTypes(chartType){
  updateChartType("hhs", chartType, true, getSecondaryVisible())
  updateChartType("hw", chartType, true, getSecondaryVisible())
}

function shapeData(varSuffix, placeRaw){
  var denom;
  var dummyPlace = {
    "placenm" : ""
  }
  
  for(vs in ["hhs", "hv", "ho_rate", "hw"]){
    dummyPlace[vs] = 1
    for(r in "asian_", "black_", "hispanic_","other_","white_"){
      dummyPlace[r + vs] = 1
    }
  }
  
  var place = (placeRaw) ? placeRaw : dummyPlace;
  if(varSuffix == "hhs") denom = place["hhs"]
  else if(varSuffix == "hw") denom = place["hw"]
  else denom = 1;

  var placeAvg;
  if(varSuffix == "ho_rate") placeAvg = place["ho_rate"]
  else if(varSuffix == "mean_hv") placeAvg = place["mean_hv"]
  else placeAvg = 1

  return  [
            {
              "place": place.placenm,
              "label": "Asian",
              "value": place["asian_" + varSuffix],
              "percent": +place["asian_" + varSuffix]/+denom,
              "placeAvg": placeAvg
            },
            {
              "place": place.placenm,
              "label": "Black",
              "value": place["black_" + varSuffix],
              "percent": +place["black_" + varSuffix]/+denom,
              "placeAvg": placeAvg
            },
            {
              "place": place.placenm,
              "label": "Hispanic",
              "value": place["hispanic_" + varSuffix],
              "percent": +place["hispanic_" + varSuffix]/+denom,
              "placeAvg": placeAvg
            },
            {
              "place": place.placenm,
              "label": "Other",
              "value": place["other_" + varSuffix],
              "percent": +place["other_" + varSuffix]/+denom,
              "placeAvg": placeAvg
            },
            {
              "place": place.placenm,
              "label": "White",
              "value": place["white_" + varSuffix],
              "percent": +place["white_" + varSuffix]/+denom,
              "placeAvg": placeAvg
            }
          ]

}
function buildChart(varSuffix, placeMain, placeSecondary, secondaryVisible){

  var dataMain = shapeData(varSuffix, placeMain),
      dataSecondary = shapeData(varSuffix, placeSecondary),
      margin = getChartMargins(),
      width = getChartWidth(),
      height = getChartHeight(varSuffix, false, secondaryVisible)

  d3.select(".chartTitle." + varSuffix)
    .html(CHART_TITLES["grouped"][varSuffix])

  var svg = d3.select(".chart." + varSuffix)
    .append("svg")
      .attr("class", varSuffix)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
  
  var x = d3.scaleLinear()
    .domain([0, d3.max(dataMain.concat(dataSecondary), d => +d.value )])
    .range([ 0, width]);

  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(dataMain.map(function(d) { return d.label; }))
    .padding(GROUPED_BAR_PADDING);
  
  svg.append("g")
    .attr("class", "axis y")
    .call(d3.axisLeft(y))
    .selectAll(".tick text").attr("dy", "5px")

  svg.selectAll(".bar.placeMain.hidden." + varSuffix)
    .data(dataMain)
    .enter()
    .append("rect")
      .attr("class", function(d){ return "bar placeMain hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.label); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : y.bandwidth() })

  svg.selectAll(".bar.placeMain.show." + varSuffix)
    .data(dataMain)
    .enter()
    .append("rect")
      .attr("class", function(d){ return "bar placeMain show " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.label); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : y.bandwidth() })



  svg.selectAll(".bar.placeSecondary.hidden." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("rect")
      .attr("class", function(d){
        var collapseClass = (d.placenm == "") ? "collapsed" : "open"
        return "bar placeSecondary hidden " + varSuffix + " " + d.label.toLowerCase() + " " + collapseClass
      })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.label) + y.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5 })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : y.bandwidth() })

  svg.selectAll(".bar.placeSecondary.show." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("rect")
      .attr("class", function(d){
        var collapseClass = (d.placenm == "") ? "collapsed" : "open"
        return "bar placeSecondary show " + varSuffix + " " + d.label.toLowerCase() + " " + collapseClass
      })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", x(0) )
      .attr("y", function(d) {
        return (secondaryVisible) ? y(d.label) + y.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5 : y(d.label);
      })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : 0 })


  if(varSuffix == "mean_hv" || varSuffix == "ho_rate"){
    var avgOpacity = (secondaryVisible) ? 0 : 1,
        placeAvg = dataMain[0]["placeAvg"];

    var avgLine = svg.append("g")
      .attr("class", "avgEl avgLine " + varSuffix)
      .attr("transform", "translate(" + x(placeAvg) + ",0)")
   
    avgLine.append("line")
      .attr("y1", 0)
      .attr("y2", y("White") + y.bandwidth() -1)
      .style("stroke", "#000")
      .style("opacity", avgOpacity)

    avgLine.append("circle")
      .attr("r",3.5)
      .attr("cy", 0)
      .attr("cx", 0)
      .style("fill", "#000")
      .style("opacity", avgOpacity)

     var label = d3.select(".chart." + varSuffix) 
      .append("div")
      .attr("class", "avgEl avgLabel " + varSuffix)
      .text("City average: " + formatLabel(placeAvg, varSuffix, "grouped") )
      .style("left", (x(placeAvg) + margin.left + 7) + "px")

  }

  svg.selectAll(".barLabel.placeMain.hidden." + varSuffix)
    .data(dataMain)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeMain hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", 0)
      .attr("y", 0)
      .html(function(d){ return formatLabel(d.value, varSuffix) })
  
  svg.selectAll(".barLabel.placeSecondary.hidden." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeSecondary hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", 0)
      .attr("y", 0)
      .html(function(d){ return formatLabel(d.percent, varSuffix) })

  svg.selectAll(".barLabel.placeMain.visible." + varSuffix)
    .data(dataMain)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeMain visible " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", function(d) { return x(d.value) + 5; })
      .attr("y", function(d) { return (secondaryVisible) ? y(d.label) + y.bandwidth()/4 + 5 : y(d.label) + y.bandwidth()/2 + 5; })
      .html(function(d){ return formatLabel(d.value, varSuffix) })
      .style("fill", DEFAULT_TEXT)
  

  svg.selectAll(".barLabel.placeSecondary.visible." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeSecondary visible " + varSuffix + " " + d.label.toLowerCase() })
      .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
      .attr("x", function(d) { return x(d.value) + 5; })
      .attr("y", function(d) { return y(d.label) + y.bandwidth() - 2; })
      .html(function(d){ return (secondaryVisible) ? formatLabel(d.value, varSuffix) : "" })
      .style("fill", DEFAULT_TEXT)


}
function updatePlace(varSuffix, placeMain, placeSecondary){

  var dataMain = shapeData(varSuffix, placeMain),
      dataSecondary = shapeData(varSuffix, placeSecondary),
      chartType = getChartType(varSuffix),
      width = getChartWidth(),
      margin = getChartMargins(),
      dataActive = (placeMain) ? dataMain : dataSecondary,
      removeSecondary = (!placeMain && !placeSecondary);

  var svg = d3.select("svg." + varSuffix)

  var selector = (placeMain) ? "placeMain" : "placeSecondary",
      data = (placeMain) ? dataMain : dataSecondary,
      stackedOffset = (placeMain) ? MAIN_STACKED_OFFSET : SECONDARY_STACKED_OFFSET;

  if(placeMain){ dataSecondary = d3.selectAll(".bar.placeSecondary." + varSuffix).data() }
  if(placeSecondary){ dataMain = d3.selectAll(".bar.placeMain." + varSuffix).data() }

  if(removeSecondary) {
    d3.selectAll(".avgEl")
      .transition()
      .duration(CHANGE_PLACE_DURATION)
      .style("opacity", 1)
  }
  else if(placeSecondary){
    d3.selectAll(".avgEl")
      .transition()
      .duration(CHANGE_PLACE_DURATION)
      .style("opacity", 0)
  }
  else if(placeMain && (varSuffix == "ho_rate" || varSuffix == "mean_hv")){
    var placeAvg = dataMain[0]["placeAvg"];

    var x = d3.scaleLinear()
          .domain([0, d3.max(dataMain, d => +d.value )])
          .range([ 0, width])

    svg.select(".avgLine." + varSuffix)
      .transition()
      .duration(CHANGE_PLACE_DURATION)
      .attr("transform", "translate(" + x(placeAvg) + ",0)")

    d3.select(".avgLabel." + varSuffix)
      .text("City average: " + formatLabel(placeAvg, varSuffix, "grouped") )
      .transition()
      .duration(CHANGE_PLACE_DURATION)
        .style("left", (x(placeAvg) + margin.left + 7) + "px")

  }

  if(chartType == "grouped"){

    if(removeSecondary){
    //grouped, remove secondary
    console.log("remove grouped 2", varSuffix)
      var height = getChartHeight(varSuffix, "stacked", placeSecondary),
          margin = getChartMargins(),
          width = getChartWidth(),
          dataMain = d3.selectAll(".bar.placeMain." + varSuffix).data(),
          x = d3.scaleLinear()
            .domain([0, d3.max(dataMain, d => +d.value )])
            .range([ 0, width]),
          cat = d3.scaleBand()
            .range([ 0, height ])
            .domain(dataMain.map(function(d) { return d.label; }))
            .padding(GROUPED_BAR_PADDING);

      svg.selectAll(".bar.show." + selector + "." + varSuffix)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("width", 0)
          .attr("height", 0)

      svg.transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("height", height + margin.top + margin.bottom)

      svg.selectAll(".bar.show.placeMain." + varSuffix)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("y", function(d) { return cat(d.label); })
          .attr("height",  cat.bandwidth() )
          .attr("width", function(d) { return x(d.value); })

      svg.selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
        .data(dataSecondary)
console.log(dataMain)
      svg.selectAll(".barLabel.visible.placeMain." + varSuffix)
        .data(dataMain)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("x", function(d) { return x(d.value) + 5; })
          .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5 })
          .style("fill", DEFAULT_TEXT)
      
      svg.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
        .data(dataSecondary)
        .html(function(d){ return "" })
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("x", function(d) {
            var mainDatum = svg.select(".barLabel.visible.placeMain." + d.label.toLowerCase()).datum()
            return x(mainDatum.value) + 5;
          })
          .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5; })
          .style("fill", DEFAULT_TEXT)

      d3.select(".chartContainer svg." + varSuffix + " .axis.y")
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .call(d3.axisLeft(cat))

    }else{
    //grouped, add bar
      var height = getChartHeight(varSuffix, "grouped", placeSecondary),
          cat = d3.scaleBand()
            .range([ 0, height ])
            .domain(dataActive.map(function(d) { return d.label; }))
            .padding(GROUPED_BAR_PADDING);

      var addingBar = false;
      if(placeSecondary){
        var dataMain = svg.selectAll(".bar.placeMain").data()
        if(svg.selectAll(".bar." + selector + ".show").attr("height") == 0){
        //add secondary grouped bar
        console.log("add grouped 2", varSuffix)
          addingBar = true;
          var x = d3.scaleLinear()
            .domain([0, d3.max(dataMain.concat(dataSecondary), d => +d.value )])
            .range([ 0, width]),
            height = getChartHeight(varSuffix, "grouped", placeSecondary),
            margin = getChartMargins(),
            y = d3.scaleLinear()
              .domain([0, 1 ])
              .range([ 0, height]);

          svg.selectAll(".bar.show.placeSecondary")
            .data(dataSecondary)
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("transform",function(d,i){ return "translate(0,0) rotate(0 0 0)" })
              .attr("width", function(d) { return x(d.value); })
              .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5 })
              .attr("height", cat.bandwidth()/2 )

          svg.selectAll(".bar.show.placeMain")
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("transform",function(d,i){ return "translate(0,0) rotate(0 0 0)" })
              .attr("width", function(d) { return x(d.value); })
              .attr("y", function(d) { return cat(d.label) })
              .attr("height", cat.bandwidth()/2 )

          svg.selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
            .data(dataSecondary)
            .html(function(d){ return formatLabel(d.percent, varSuffix) })

          svg.selectAll(".barLabel.visible.placeMain." + varSuffix)
            .data(dataMain)
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("x", function(d) { return x(d.value) + 5; })
              .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/4 + 5 })
              .style("fill", DEFAULT_TEXT)

          svg.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
            .data(dataSecondary)
            .html(function(d){ return formatLabel(d.value, varSuffix) })
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("x", function(d) { return x(d.value) + 5; })
              .attr("y", function(d) { return cat(d.label) + cat.bandwidth() - 2; })
              .style("fill", DEFAULT_TEXT)

          svg.select(".axis.y")
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .call(d3.axisLeft(cat))

          svg.transition()
            .duration(CHANGE_PLACE_DURATION)
            .attr("height", height + margin.top + margin.bottom)

        }else{
          //update secondary grouped bar
          var x = d3.scaleLinear()
            .domain([0, d3.max(dataMain.concat(dataSecondary), d => +d.value )])
            .range([ 0, width]);
          
          svg
            .selectAll(".bar.show.placeMain")
            .data(dataMain)
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("width", function(d) { return x(d.value); })

          svg
            .selectAll(".bar.hidden.placeMain")
            .data(dataMain)
            .attr("width", function(d) { return x(d.value); })

          svg
            .selectAll(".bar.show.placeSecondary")
            .data(dataSecondary)
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("width", function(d) { return x(d.value); })

          svg
            .selectAll(".bar.hidden.placeSecondary")
            .data(dataSecondary)
            .attr("width", function(d) { return x(d.value); })

          svg
            .selectAll(".barLabel.hidden.placeMain." + varSuffix)
            .data(dataMain)
            .html(function(d){ return formatLabel(d.value, varSuffix) })

          svg
            .selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
            .data(dataSecondary)
            .html(function(d){ return formatLabel(d.value, varSuffix) })

          svg
            .selectAll(".barLabel.visible.placeMain." + varSuffix)
            .data(dataMain)
            .html(function(d){ return formatLabel(d.value, varSuffix) })
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("x", function(d) { return x(d.value) + 5; })
              .style("fill", DEFAULT_TEXT)

          svg
            .selectAll(".barLabel.visible.placeSecondary." + varSuffix)
            .data(dataSecondary)
            .html(function(d){ return formatLabel(d.value, varSuffix) })
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("x", function(d) { return x(d.value) + 5; })
              .style("fill", DEFAULT_TEXT)
          console.log("update grouped 2", varSuffix)
        }
      }else{
      //update main grouped bar
      console.log("update grouped 1", varSuffix)
        var dataSecondary = svg.selectAll(".bar.placeSecondary").data()
        var dataVisible = (getSecondaryVisible() ? dataMain.concat(dataSecondary) : dataMain)
        var x = d3.scaleLinear()
          .domain([0, d3.max(dataVisible, d => +d.value )])
          .range([ 0, width]);
        
        svg
          .selectAll(".bar.show.placeMain")
          .data(dataMain)
          .transition()
          .duration(CHANGE_PLACE_DURATION)
            .attr("width", function(d) { return x(d.value); })

        svg
          .selectAll(".bar.hidden.placeMain")
          .data(dataMain)
          .attr("width", function(d) { return x(d.value); })

        svg
          .selectAll(".bar.show.placeSecondary")
          .data(dataSecondary)
          .transition()
          .duration(CHANGE_PLACE_DURATION)
            .attr("width", function(d) { return x(d.value); })

        svg
          .selectAll(".bar.hidden.placeSecondary")
          .data(dataSecondary)
          .attr("width", function(d) { return x(d.value); })

        svg
          .selectAll(".barLabel.hidden.placeMain." + varSuffix)
          .data(dataMain)
          .html(function(d){ return formatLabel(d.value, varSuffix) })

        svg
          .selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
          .data(dataSecondary)
          .html(function(d){ return formatLabel(d.value, varSuffix) })

        svg
          .selectAll(".barLabel.visible.placeMain." + varSuffix)
          .data(dataMain)
          .html(function(d){ return formatLabel(d.value, varSuffix) })
          .transition()
          .duration(CHANGE_PLACE_DURATION)
            .attr("x", function(d) { return x(d.value) + 5; })
            .style("fill", DEFAULT_TEXT)

        svg
          .selectAll(".barLabel.visible.placeSecondary." + varSuffix)
          .data(dataSecondary)
          .html(function(d){ return getSecondaryVisible() ? formatLabel(d.value, varSuffix) : "" })
          .transition()
          .duration(CHANGE_PLACE_DURATION)
            .attr("x", function(d) { return x(d.value) + 5; })
            .style("fill", DEFAULT_TEXT)
      }

      // if(!addingBar){

      // }
    }

  }else{
    var height = getChartHeight(varSuffix, "stacked", placeSecondary),
        y = d3.scaleLinear()
          .domain([0, 1 ])
          .range([ 0, height]),
        cat = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) { return d.label; }))
          .padding(GROUPED_BAR_PADDING);
    
    if(removeSecondary){
    //stacked, remove secondary
    console.log("stacked remove", varSuffix)
      svg.selectAll(".bar.show." + selector + "." + varSuffix)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
        .attr("height", 0)

      svg.select(".axis.y")
        .selectAll(".tick")
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("transform", function(d,i){
            return "translate(" + STACKED_SINGLE_CAT_LABEL_POS + "," + (cat(d) + cat.bandwidth()*.5) + ")"
          })

      d3.selectAll(".barLabel.hidden.placeMain." + varSuffix)
        .html(function(d){ return formatLabel(d.percent, varSuffix, chartType); })

      d3.selectAll(".barLabel.visible.placeMain." + varSuffix)
        .html(function(d){ return formatLabel(d.percent, varSuffix, chartType); })
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("x", function(d){

            var w = d3.select(".barLabel.hidden.placeMain." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()

            return  -78 - w + STACKED_SINGLE_CAT_LABEL_POS
          })
          .style("fill", DEFAULT_TEXT)

      d3.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
        .html("")
        .attr("x", function(d){
            var w = d3.select(".barLabel.hidden.placeMain." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()

            return  -78 - w + STACKED_SINGLE_CAT_LABEL_POS
        })


    }else{
    //stacked, add bar
console.log("stacked add", varSuffix, selector)
      svg.selectAll(".bar.hidden." + selector + "." + varSuffix)
        .data(data)
        .attr("transform",function(d,i){
          return "translate(" + stackedOffset + "," + (0) + ") rotate(90 0 " + cat(d.label) + ")"
        })
        .attr("width", function(d){
          return y(d.percent)
        })

      d3.selectAll(".bar.show." + selector + "." + varSuffix)
        .data(data)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("transform",function(d,i){
            var ypos = 0;
            for(var j = 0; j< i; j++){
              ypos += data[j]["percent"]
            }

            var isSecondary = selector == "placeSecondary",
                xOffset = (isSecondary) ? SECONDARY_STACKED_OFFSET : MAIN_STACKED_OFFSET,
                yPosBar = (isSecondary) ? cat(d.label) + cat.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5: cat(d.label),
                translatedPos = +d3.select(".bar.hidden." + varSuffix + "." + d.label.toLowerCase() + "." + selector).attr("y")
      
            return "translate(" + xOffset + "," + (-translatedPos+y(ypos)) + ") rotate(90 0 " + yPosBar + ")"
          })
          .attr("height", cat.bandwidth())
          .attr("width", function(d){ return y(d.percent) })

console.log(selector, getSecondaryVisible())

      d3.selectAll(".barLabel.hidden.placeMain." + varSuffix)
        .data(dataMain)
        .html(function(d){
          var label = formatLabel(d.percent, varSuffix, chartType);
          return (getSecondaryVisible()) ? label + "<tspan> /<tspan>" : label
        })
      d3.selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
        .data(dataSecondary)
        .html(function(d){
          return  (getSecondaryVisible()) ? formatLabel(d.percent, varSuffix, chartType) : "";
        })


      d3.selectAll(".barLabel.visible.placeMain." + varSuffix)
        .data(dataMain)
        .html(function(d){
          var label = formatLabel(d.percent, varSuffix, chartType);
          return (getSecondaryVisible()) ? label + "<tspan> /<tspan>" : label
        })
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("x", function(d){

            var w = d3.select(".barLabel.hidden.placeMain." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()
            var wSecondary = d3.select(".barLabel.hidden.placeSecondary." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()

            return (getSecondaryVisible()) ? -78 - w - wSecondary + STACKED_DOUBLE_CAT_LABEL_POS : -78 - w + STACKED_SINGLE_CAT_LABEL_POS
          })
          .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5; })
          .style("fill", function(){
            return d3.select(this).classed("active") ? ACTIVE_BLUE : DEACTIVE_BLUE
          })


      d3.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
        .data(dataSecondary)
        .html(function(d){
          return  (getSecondaryVisible()) ? formatLabel(d.percent, varSuffix, chartType) : "";
        })
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("x", function(d){
            var w = d3.select(".barLabel.hidden.placeSecondary." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()
            return getSecondaryVisible() ? -75 - w + STACKED_DOUBLE_CAT_LABEL_POS : 5 - w + STACKED_SINGLE_CAT_LABEL_POS
          })
          .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5; })
          .style("fill", function(){ return d3.select(this).classed("active") ? ACTIVE_GREEN : DEACTIVE_GREEN })

      svg.select(".axis.y")
        .selectAll(".tick")
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("transform", function(d,i){
            var catLabelPos = (getSecondaryVisible()) ? STACKED_DOUBLE_CAT_LABEL_POS : STACKED_SINGLE_CAT_LABEL_POS;
            return "translate(" + catLabelPos + "," + (cat(d) + cat.bandwidth()*.5) + ")"
          })

    }
  }
}

function updateChartType(varSuffix, chartType, transition, secondaryVisible){
  var duration = (transition == true) ? CHANGE_TYPE_DURATION : 0,
      dataMain = d3.selectAll(".bar.show.placeMain." + varSuffix).data(),
      dataSecondary = d3.selectAll(".bar.show.placeSecondary." + varSuffix).data(),
      dataActive = (secondaryVisible) ? dataMain.concat(dataSecondary) : dataMain,
      width = getChartWidth()
      x = d3.scaleLinear()
        .domain([0, d3.max(dataActive, d => +d.value )])
        .range([ 0, width]),
      margin = getChartMargins()


  d3.select(".chartTitle." + varSuffix)
    .html(CHART_TITLES[chartType][varSuffix])

  if(chartType == "stacked"){
  //stacked bar

    var height = getChartHeight(varSuffix, "stacked", secondaryVisible),
        y = d3.scaleLinear()
          .domain([0, 1 ])
          .range([ 0, height]),
        cat = d3.scaleBand()
          .range([ 0, height ])
          .domain(dataMain.map(function(d) { return d.label; }))
          .padding(GROUPED_BAR_PADDING);

    d3.selectAll(".bar.hidden." + varSuffix)
      // .attr("transform-origin",function(d){ return "0 " + cat(d.label) })
      .attr("transform",function(d,i){
        var xOffset = (d3.select(this).classed("placeSecondary")) ? SECONDARY_STACKED_OFFSET : MAIN_STACKED_OFFSET;
        return "translate(" + xOffset + "," + xOffset + ") rotate(90)"
      })
      .attr("height", function(d){ return cat.bandwidth() })
      .attr("width", function(d){ return y(d.percent) })

    d3.selectAll(".bar.show." + varSuffix)
      .transition()
      .duration(duration)
        .attr("y", function(d) {
            var isSecondary = d3.select(this).classed("placeSecondary")
            return (isSecondary) ? cat(d.label) + cat.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5: cat(d.label);
        })
        .attr("transform",function(d,i){
          var isSecondary = d3.select(this).classed("placeSecondary"),
              iOffset = (isSecondary) ? 5 : 0,
              ypos = 0;

          for(var j = 0; j< i - iOffset ; j++){
            if(isSecondary){
              ypos += dataSecondary[j]["percent"]
            }else{
              ypos += dataMain[j]["percent"]
            }
          }

          var xOffset = (isSecondary) ? SECONDARY_STACKED_OFFSET : MAIN_STACKED_OFFSET,
              placeClass = (isSecondary) ? "placeSecondary" : "placeMain",
              yPosBar = (isSecondary) ? cat(d.label) + cat.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5: cat(d.label),
              translatedPos = +d3.select(".bar.hidden." + varSuffix + "." + d.label.toLowerCase() + "." + placeClass).attr("y");
          
          return "translate(" + xOffset + "," + (-translatedPos+y(ypos)) + ") rotate(90 0 " + yPosBar + ")"
        })
        .attr("height", function(d){
            var isSecondary = d3.select(this).classed("placeSecondary")
            return (secondaryVisible || !isSecondary) ? cat.bandwidth() : 0;
        })
        .attr("width", function(d){ return y(d.percent) })

    d3.selectAll(".barLabel.hidden.placeMain." + varSuffix)
      .html(function(d){
        var label = formatLabel(d.percent, varSuffix, chartType);
        return (secondaryVisible) ? label + "<tspan> /<tspan>" : label
      })

    d3.selectAll(".barLabel.visible.placeMain." + varSuffix)
      .html(function(d){
        var label = formatLabel(d.percent, varSuffix, chartType);
        return (secondaryVisible) ? label + "<tspan> /<tspan>" : label
      })
      .transition()
      .duration(duration)
        .attr("x", function(d){

          var w = d3.select(".barLabel.hidden.placeMain." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()
          var wSecondary = d3.select(".barLabel.hidden.placeSecondary." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()

          return (secondaryVisible) ? -78 - w - wSecondary + STACKED_DOUBLE_CAT_LABEL_POS : -78 - w + STACKED_SINGLE_CAT_LABEL_POS
        })
        .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5; })
        .style("fill", function(){
          if(!secondaryVisible) return DEFAULT_TEXT
          else return d3.select(this).classed("active") ? ACTIVE_BLUE : DEACTIVE_BLUE
        })

    d3.selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
      .html(function(d){ return (secondaryVisible) ? formatLabel(d.percent, varSuffix, chartType) : "" })

    d3.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
      .html(function(d){ return (secondaryVisible) ? formatLabel(d.percent, varSuffix, chartType) : "" })
      .transition()
      .duration(duration)
        .attr("x", function(d){
          
        var w = d3.select(".barLabel.hidden.placeSecondary." + varSuffix + "." + d.label.toLowerCase() ).node().getComputedTextLength()

          return (secondaryVisible) ? -75 - w + STACKED_DOUBLE_CAT_LABEL_POS : 5 - w + STACKED_SINGLE_CAT_LABEL_POS
        })
        .attr("y", function(d) { return cat(d.label) + cat.bandwidth()/2 + 5; })
        .style("fill", function(){ return d3.select(this).classed("active") ? ACTIVE_GREEN : DEACTIVE_GREEN })


    d3.select(".chart svg." + varSuffix + " .axis.y")
      .selectAll(".tick")
      .transition()
      .duration(duration)
        .attr("transform", function(d,i){
          var catLabelPos = (secondaryVisible) ? STACKED_DOUBLE_CAT_LABEL_POS : STACKED_SINGLE_CAT_LABEL_POS;
          return "translate(" + catLabelPos + "," + (cat(d) + cat.bandwidth()*.5) + ")"
        })

    d3.selectAll(".chart svg." + varSuffix + " .axis.y .tick text")
      .transition()
      .duration(duration)
        .attr("dx", function(d,i){ return HARD_TICK_ALIGN[d] })

  }else{
  ///grouped bar

    var height = getChartHeight(varSuffix, "grouped", secondaryVisible),
        y = d3.scaleLinear()
          .domain([0, 1 ])
          .range([ 0, height]),
        x = d3.scaleLinear()
          .domain([0, d3.max(dataActive, d => +d.value )])
          .range([ 0, width]),
        data = d3.selectAll(".bar." + varSuffix).data(),
        cat = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) { return d.label; }))
          .padding(GROUPED_BAR_PADDING);

// console.log(dataActive)
    d3.selectAll(".bar.show." + varSuffix)
      .transition()
      .duration(duration)
        .attr("transform",function(d,i){ return "translate(0,0) rotate(0 0 0)" })
        .attr("y", function(d) {
          var isSecondary = d3.select(this).classed("placeSecondary")
          return (isSecondary) ? cat(d.label) + cat.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5: cat(d.label);
        })
        .attr("width", function(d) { return x(d.value); })
        .attr("height", function(){
          var isSecondary = d3.select(this).classed("placeSecondary")
          if(!secondaryVisible && isSecondary) return 0
          else return (secondaryVisible) ? cat.bandwidth()/2 : cat.bandwidth()
        })

    d3.selectAll(".barLabel.visible.placeMain." + varSuffix)
      .html(function(d){ return formatLabel(d.value, varSuffix, chartType) })
      .transition()
      .duration(duration)
        .attr("x", function(d) { return x(d.value) + 5; })
        .attr("y", function(d) { return (secondaryVisible) ? cat(d.label) + cat.bandwidth()/4 + 5 : cat(d.label) + cat.bandwidth()/2 + 5; })
        .style("fill", DEFAULT_TEXT)

    d3.selectAll(".barLabel.visible.placeSecondary." + varSuffix)
      .html(function(d){ return (secondaryVisible) ? formatLabel(d.value, varSuffix, chartType) : "" })
      .transition()
      .duration(duration)
        .attr("x", function(d) { return x(d.value) + 5; })
        .attr("y", function(d) { return cat(d.label) + cat.bandwidth() - 2; })
        .style("fill", DEFAULT_TEXT)


    d3.select(".chart svg." + varSuffix + " .axis.y")
      .transition()
      .duration(duration)
        .call(d3.axisLeft(cat))

    d3.selectAll(".chart svg." + varSuffix + " .axis.y .tick text")
      .transition()
      .duration(duration)
        .attr("dx",-6)
  }

  d3.select(".chart svg." + varSuffix)
    .transition()
    .duration(duration)
    .attr("height", height + margin.top + margin.bottom)

}







function toggle_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'inline-block')
        e.style.display = 'none';
    else
        e.style.display = 'inline-block';
}

$(function () {
    var shrinkHeader = 200;
    $(window).scroll(function () {
        var scroll = getCurrentScroll();
        if (scroll >= shrinkHeader) {
            $('#header-pinned').addClass('is-visible');
        } else {
            $('#header-pinned').removeClass('is-visible');
        }
    });

    function getCurrentScroll() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }
});