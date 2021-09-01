d3.csv("data/source/by_place_noCDPs_2019.csv")
  .then(function(data){
    populateDropdowns(data)
    buildCharts(data[0])
  })


function populateDropdowns(data){
  var placeNames = data.map(d => d.placenm)
  $( function() {
      $( "#tags" ).autocomplete({
        source: placeNames,
        select: function( event, ui ) {
          var placeName = ui.item.value
          var place = data.filter(d => d.placenm == placeName)[0]
          buildCharts(place)
        }
      })

  } );
}



function buildCharts(place){
  d3.select("#chartContainer").selectAll("svg").remove()
  d3.select("#chartContainer").selectAll(".tmpTitle").remove()

  buildChart("hhs", place)
  buildChart("hw", place)
  buildChart("ho_rate", place)
  buildChart("mean_hv", place)
}

function shapeData(varSuffix, place){
  return [
    {
      "place": place.placenm,
      "label": "Asian",
      "value": place["asian_" + varSuffix]
    },
    {
      "place": place.placenm,
      "label": "Black",
      "value": place["black_" + varSuffix]
    },
    {
      "place": place.placenm,
      "label": "Hispanic",
      "value": place["hispanic_" + varSuffix]
    },
    {
      "place": place.placenm,
      "label": "Other",
      "value": place["other_" + varSuffix]
    },
    {
      "place": place.placenm,
      "label": "White",
      "value": place["white_" + varSuffix]
    }
  ]

}
function buildChart(varSuffix, place){
// console.log(varSuffix, place)
  var data = shapeData(varSuffix, place)
  console.log(data)
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 30, bottom: 40, left: 90},
  width = 860 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

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
  .data(data)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, d3.max(data, d => +d.value )])
  .range([ 0, width]);
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  // .selectAll("text")
  // .attr("transform", "translate(-10,0)rotate(-45)")
  // .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.label; }))
  .padding(.1);
  svg.append("g")
  .call(d3.axisLeft(y))

  //Bars
  svg.selectAll("myRect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", x(0) )
  .attr("y", function(d) { return y(d.label); })
  .attr("width", function(d) { return x(d.value); })
  .attr("height", y.bandwidth() )
  .attr("fill", "#1696d2")
}


  // .attr("x", function(d) { return x(d.Country); })
  // .attr("y", function(d) { return y(d.Value); })
  // .attr("width", x.bandwidth())
  // .attr("height", function(d) { return height - y(d.Value); })
  // .attr("fill", "#69b3a2")
