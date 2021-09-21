var DEFAULT_CITY = "Atlanta city, GA"

function getChartType(varSuffix){
  if(varSuffix == "ho_rate" || varSuffix == "mean_hv") return "grouped"
  else return d3.select(".toggle").classed("on") ? "grouped" : "stacked"
}

function getChartMargins(){
  return {top: 0, right: 30, bottom: 0, left: 40}
}
function getChartWidth(){
    var margin = getChartMargins()
    return 240 - margin.left - margin.right
}
function getChartHeight(chartType){
  var margin = getChartMargins()
  return 190 - margin.top - margin.bottom;
}
function getActiveRace(){
  return 'white'
}

d3.csv("data/source/by_place_noCDPs_2019.csv")
  .then(function(data){
    populateDropdowns(data)
    var default_datum = data.filter(function(c){ return c.placenm == DEFAULT_CITY})[0]
    buildCharts(default_datum)
  })


function populateDropdowns(data){
  var placeNames = data.map(d => d.placenm)
  $( function() {
      $( "#mainCity" ).autocomplete({
        source: placeNames,
        select: function( event, ui ) {
          var placeName = ui.item.value
          var place = data.filter(d => d.placenm == placeName)[0]
          updatePlaces(place, false)
        }
      })
      .click(function(){
        $(this).val("")
      })

  } );
}
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


function buildCharts(place){
  d3.select("#chartContainer").selectAll("svg").remove()
  d3.select("#chartContainer").selectAll(".tmpTitle").remove()
  $("#mainCity").val(place.placenm)

  buildChart("hhs", place)
  buildChart("hw", place)
  buildChart("ho_rate", place)
  buildChart("mean_hv", place)

  updateChartType("hhs", "stacked", false)
  updateChartType("hw", "stacked", false)

}

function updatePlaces(placeMain, placeSecondary){
  updatePlace("hhs", placeMain, placeSecondary)
  updatePlace("hw", placeMain, placeSecondary)
  updatePlace("ho_rate", placeMain, placeSecondary)
  updatePlace("mean_hv", placeMain, placeSecondary)
}
function updateChartTypes(chartType){
  updateChartType("hhs", chartType, true)
  updateChartType("hw", chartType, true)
}

function shapeData(varSuffix, place){
  var denom;
  if(varSuffix == "hhs") denom = place["hhs"]
  else if(varSuffix == "hw") denom = place["hw"]
  else denom = 1;

  var placeAvg;
  if(varSuffix == "ho_rate") placeAvg = place["ho_rate"]
  else if(varSuffix == "hv") placeAvg = place["mean_hv"]
  else placeAvg = 1

  return [
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
function buildChart(varSuffix, place){
  var data = shapeData(varSuffix, place)
  // set the dimensions and margins of the graph
  var margin = getChartMargins()
  width = getChartWidth(),
  height = getChartHeight()

  var titles = {
    "hhs": "Households",
    "hw": "Housing wealth",
    "ho_rate": "Homeownership rate",
    "mean_hv": "Mean home values"
  }

  d3.select("#chartContainer").append("div")
    .attr("class", "tmpTitle")
    .text(titles[varSuffix])
  // append the svg object to the body of the page
  var svg = d3.select("#chartContainer")
  .append("svg")
  // .data(data)
  .attr("class", varSuffix)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, d3.max(data, d => +d.value )])
  .range([ 0, width]);
  svg.append("g")
  .attr("class","axis x")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  // .selectAll("text")
  // .attr("transform", "translate(-10,0)rotate(-45)")
  // .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.label; }))
  .padding(.3);
  svg.append("g")
  .call(d3.axisLeft(y))



  svg.selectAll(".bar.placeMain.hidden." + varSuffix)
  .data(data)
  .enter()
  .append("rect")
  .attr("class", function(d){ return "bar placeMain hidden " + varSuffix + " " + d.label.toLowerCase() })
  .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
  .attr("x", x(0) )
  .attr("y", function(d) { return y(d.label); })
  .attr("width", function(d) { return x(d.value); })
  .attr("height", y.bandwidth() )


  //Bars
  svg.selectAll(".bar.placeMain.show." + varSuffix)
  .data(data)
  .enter()
  .append("rect")
  .attr("class", function(d){ return "bar placeMain show " + varSuffix + " " + d.label.toLowerCase() })
  .classed("active", function(d){ return d.label.toLowerCase() == getActiveRace() })
  .attr("x", x(0) )
  .attr("y", function(d) { return y(d.label); })
  .attr("width", function(d) { return x(d.value); })
  .attr("height", y.bandwidth() )
  // .attr("fill", "#1696d2")
}
function updatePlace(varSuffix, placeMain, placeSecondary){
  var data = shapeData(varSuffix, placeMain, placeSecondary),
      chartType = getChartType(varSuffix),
      width = getChartWidth()

  var x = d3.scaleLinear()
  .domain([0, d3.max(data, d => +d.value )])
  .range([ 0, width]);
var svg = d3.select("svg." + varSuffix)


    var height = getChartHeight("stacked")
    var y = d3.scaleLinear()
      .domain([0, 1 ])
      .range([ 0, height]);



  var cat = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.label; }))
  .padding(.3);



if(chartType == "grouped"){
  // console.log(data)

    svg.select(".axis.x")
    .transition()
    .call(d3.axisBottom(x))

    svg
      .selectAll(".bar.placeMain.show")
      .data(data)
      .transition()
      .attr("width", function(d) { return x(d.value); })
    svg
      .selectAll(".bar.placeMain.hidden")
      .data(data)
      .attr("width", function(d) { return x(d.value); })
    }else{
console.log(data)
  d3.selectAll(".bar.hidden." + varSuffix)
    .data(data)
      .attr("transform",function(d,i){
        return "translate(40," + (0) + ") rotate(90 0 " + cat(d.label) + ")"
      })
      .attr("width", function(d){
        return y(d.percent)
      })


              d3.selectAll(".bar.show." + varSuffix)
              .data(data)
                .transition()
                // .attr("y",0)
                // .attr("transform-origin",function(d){
                //  return "0 " + cat(d.label)
                // })
                .attr("transform",function(d,i){
                  var ypos = 0;
                  for(var j = 0; j< i; j++){
                    ypos += data[j]["percent"]
                  }
                  console.log(d)
                  var translatedPos = +d3.select(".bar.hidden." + varSuffix + "." + d.label.toLowerCase()).attr("y")
                  return "translate(40," + (-translatedPos+y(ypos)) + ") rotate(90 0 " + cat(d.label) + ")"
                })
                // .attr("y", function(d,i){
                //           var ypos = 0;
                //   for(var j = 0; j< i; j++){
                //     ypos += data[j]["percent"]
                //   }
                //   return ypos
                // })
                .attr("width", function(d){
                  // console.log(d)
                  return y(d.percent)
                })



    }
}
function updateChartType(varSuffix, chartType, transition){
    var duration = (transition == true) ? 1000 : 0;


    var height = getChartHeight("stacked")
    var y = d3.scaleLinear()
      .domain([0, 1 ])
      .range([ 0, height]);
    var data = d3.selectAll(".bar." + varSuffix).data()

  var x = d3.scaleLinear()
  .domain([0, d3.max(data, d => +d.value )])
  .range([ 0, width]);


  var cat = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.label; }))
  .padding(.3);

if(chartType == "stacked"){
  d3.selectAll(".bar.hidden." + varSuffix)
      .attr("transform-origin",function(d){
       return "0 " + cat(d.label)
      })
      .attr("transform",function(d,i){
        return "translate(40," + (0) + ") rotate(90)"
      })
      .attr("width", function(d){
        return y(d.percent)
      })



              d3.selectAll(".bar.show." + varSuffix)
                .transition()
                .duration(duration)
                // .attr("y",0)
                // .attr("transform-origin",function(d){
                //  return "0 " + cat(d.label)
                // })
                .attr("transform",function(d,i){
                  var ypos = 0;
                  for(var j = 0; j< i; j++){
                    ypos += data[j]["percent"]
                  }
                  var translatedPos = +d3.select(".bar.hidden." + varSuffix + "." + d.label.toLowerCase()).attr("y")
                  return "translate(40," + (-translatedPos+y(ypos)) + ") rotate(90 0 " + cat(d.label) + ")"
                })
                // .attr("y", function(d,i){
                //           var ypos = 0;
                //   for(var j = 0; j< i; j++){
                //     ypos += data[j]["percent"]
                //   }
                //   return ypos
                // })
                .attr("width", function(d){
                  return y(d.percent)
                })

  }else{

    var data = d3.selectAll(".bar." + varSuffix).data()
    

  var cat = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.label; }))
  .padding(.3);


        d3.selectAll(".bar." + varSuffix)
      .transition()
      .duration(duration)
      // .attr("y",0)
      // .attr("transform-origin","0 0")
      .attr("transform",function(d,i){

        return "translate(0,0) rotate(0 0 0)"
      })
      .attr("width", function(d){

        return x(d.value)
      })
  }
}

  // .attr("x", function(d) { return x(d.Country); })
  // .attr("y", function(d) { return y(d.Value); })
  // .attr("width", x.bandwidth())
  // .attr("height", function(d) { return height - y(d.Value); })
  // .attr("fill", "#69b3a2")
