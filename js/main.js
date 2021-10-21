var DEFAULT_CITY = "Atlanta, GA"
var DEFAULT_SECONDARY = "Chicago, IL"

var PERCENT = d3.format(".1%")
var PERCENT_TEXT = function(val){ return PERCENT(val).replace("%"," percent") }
var PERCENTAGE_POINTS = function(val){ return PERCENT(val).replace("%"," percentage points") }
var HOUSEHOLDS = d3.format(".3s") //max NYC white 1209318
var TOTALWEALTH = function(val){ return d3.format('$.3s')(val).replace("G","B") } //max NYC white 549000000000.00 -> $549B
var AVGWEALTH =  d3.format("$.3s") //max Santa Monica white, 4476061.069 -> $4.48M
var DOLLARS_LONG = d3.format("$,.0f")

const CHANGE_TYPE_DURATION = 1000;
const CHANGE_PLACE_DURATION = 1000;

const GROUPED_BAR_PADDING = .3;
const GROUPED_BAR_PAIR_PADDING = 10;
const CHART_MARGINS = {top: 20, right: 70, bottom: 100, left: 80}
const CHART_WIDTH = 322;  
const CHART_HEIGHT = 520;
const MAIN_STACKED_OFFSET = -15;
const SECONDARY_STACKED_OFFSET = 15;
const STACKED_DOUBLE_CAT_LABEL_POS = 215;
const STACKED_SINGLE_CAT_LABEL_POS = 115;
const HARD_TICK_ALIGN = {
                          "Black" : -22,
                          "Hispanic" : 0,
                          "Asian" : -20,
                          "White" : -16,
                          "Other" : -17
                        }
const SOCIAL_RACE_NAMES = {
  "asian": "Asian",
  "black": "Black",
  "hispanic": "Hispanic",
  "other": "all other",
  "white": "white"
}

const ACTIVE_BLUE = "#12719e"
const ACTIVE_GREEN = "#408941"
const DEACTIVE_BLUE = "#12719e"
const DEACTIVE_GREEN = "#408941"
const DEFAULT_TEXT = "#353535"

const CHART_TITLES = {
  "grouped": {
    "hhs": "Total households",
    "hw": "Total primary-residence wealth",
    "ho_rate": "Homeownership rates",
    "mean_hv": "Average home values"
  },
  "stacked": {
    "hhs": "Distribution of household population",
    "hw": "Distribution of primary-residence wealth",
    "ho_rate": "Homeownership rates",
    "mean_hv": "Average home values"
  }
}


const STATE_NAMES = {
  "AL": "Alabama", "AK": "Alaska", "AS": "American Samoa", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FM": "Federated States of Micronesia", "FL": "Florida", "GA": "Georgia", "GU": "Guam", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MH": "Marshall Islands", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "MP": "Northern Mariana Islands", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PW": "Palau", "PA": "Pennsylvania", "PR": "Puerto Rico", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VI": "Virgin Islands", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
}
function placeFormat(place, includeState){
  var abbr = place.split(",")[1].trim(),
      pl = place.split(",")[0].trim()
      state = (includeState) ? ", " + STATE_NAMES[abbr] : ""
  return pl + state
}

function widthUnder(w){
  return d3.select(".widthTester.w" + w).style("display") == "block"
}
function getQueryString(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
function betterEncodeURIComponent(str) {
    str = encodeURIComponent(str);
    return str.replace(/'/gi, "%27");
}

function amperoctoplus(s) {
    s = s.replace(/&/g, '%26');
    s = s.replace(/#/g, '%23');
    s = s.replace(/\+/g, '%2B');
    s = s.replace(/@/g, '%40');
    s = s.replace(/:/g, '%3A');
    return s;
}
function getTwitterShare(url, blurb) {
    if(blurb == ""){
      blurb = "Tracking homeownership wealth gaps: Is housing wealth equitable in your city? (via @urbaninstitute)"
    }else{
      blurb += " (via @urbaninstitute)"
    }
    return "https://twitter.com/intent/tweet?text=" + betterEncodeURIComponent(blurb + " " + url);
}
function getFacebookShare(url) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + amperoctoplus(encodeURI(url));
}
function getEmailShare(url, blurb){
  if(blurb == ""){
    blurb = 'mailto:%20?Subject=New Urban Institute interactive&Body=Hi! I thought you’d be interested in this new interactive from the Urban Institute: “Tracking Homeownership Wealth Gaps: Is Housing Wealth Equitable in Your City?” '
  }else{
      blurb = 'mailto:%20?Subject=New Urban Institute interactive&Body=Hi! I thought you’d be interested in this new interactive from the Urban Institute: “Tracking Homeownership Wealth Gaps: Is Housing Wealth Equitable in Your City?”%0d%0a%0d%0a' + blurb + "%0d%0a%0d%0a"
  }
  return blurb + url
}

function buildShareURL(){
  var shareURL = window.location.origin + window.location.pathname + "?",
      placeString = betterEncodeURIComponent(getPlaceMain().placenm),
      comparedWithString = (getPlaceSecondary()) ? betterEncodeURIComponent(getPlaceSecondary().placenm) : "",
      raceEthnicityString = getActiveRace(),
      showTotalsString = (getChartType() == "grouped") ? "yes" : "no"

  shareURL += "place=" + placeString + "&comparedWith=" + comparedWithString + "&raceEthnicity=" + raceEthnicityString + "&showTotals=" + showTotalsString

  return shareURL;

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

  var w;
  if(widthUnder(600)) w = window.innerWidth - 30
  else if(widthUnder(900)) w = 500
  else w = CHART_WIDTH

  return w - margin.left - margin.right
}
function getChartHeight(varSuffix, chartType, secondaryVisible){
  var ct = chartType ?  chartType : getChartType(varSuffix),
      H = (secondaryVisible && ct == "grouped") ? 1 : .5,
      margin = getChartMargins()

  return (CHART_HEIGHT - margin.top - margin.bottom)*H;
}
function getActiveRace(){
  return $("#raceMenu").val()
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


d3.csv("data/by_place-bc_edits.csv")
  .then(function(data){
    initControls(data)

    var placeMain = (getQueryString('place') == '') ? DEFAULT_CITY : decodeURIComponent(getQueryString('place')),
        placeSecondary = (getQueryString('comparedWith') == '') ? "" : decodeURIComponent(getQueryString('comparedWith')),
        // placeSecondary = DEFAULT_SECONDARY,
        default_datum = data.filter(function(c){ return c.placenm == placeMain})[0],
        secondary_datum = (placeSecondary == "" || placeSecondary == placeMain) ?
                        default_datum :
                        data.filter(function(c){ return c.placenm == placeSecondary})[0],
        secondaryVisible = (placeSecondary != "" && placeSecondary != placeMain),
        defaultRace = (getQueryString('raceEthnicity') == '') ? 'black' : decodeURIComponent(getQueryString('raceEthnicity')),
        defaultChartType = (getQueryString('showTotals') == 'yes') ? 'grouped' : 'stacked'

    d3.select(".dataBinder.placeMain").datum(default_datum)
    if(secondaryVisible) d3.select(".dataBinder.placeSecondary").datum(secondary_datum)
    else d3.select(".dataBinder.placeSecondary").datum(false)

    d3.selectAll(".placeMain.placeLabel").text(placeFormat(default_datum.placenm, true))
    d3.selectAll(".placeMain.placeLabelShort").text(" " + placeFormat(default_datum.placenm, false))
    if(secondaryVisible){
      d3.selectAll(".placeSecondary.placeLabelFiller").style("display", "inline-block")
      d3.selectAll(".placeMain.placeLabelFiller").style("display", "none")
      d3.selectAll(".placeSecondary.placeLabel").text(" " + placeFormat(secondary_datum.placenm, true))
      d3.selectAll(".placeSecondary.placeLabelShort").text(" " + placeFormat(secondary_datum.placenm, false))
    }else{
      d3.selectAll(".placeSecondary.placeLabelFiller").style("display", "none")
      d3.selectAll(".placeMain.placeLabelFiller").style("display", "inline-block")
      d3.selectAll(".placeSecondary.placeLabel").text("")
      d3.selectAll(".placeSecondary.placeLabelShort").text("")
    }

    init(default_datum, secondary_datum, secondaryVisible, defaultRace, defaultChartType)
  })


function initControls(data){
  var placeNames = data.map(function(d){ return d.placenm })

  $( function() {
    $( "#placeMain" ).autocomplete({
      source: placeNames,
      select: function( event, ui ) {
        var placeName = ui.item.value,
            place = data.filter(function(d){ return (d.placenm == placeName) })[0]

        updatePlaces(place, false)
        updateRace(false, "click")
        d3.select(".placeSearch.placeMain").attr("src", "img/placeSearch.png")

        d3.select(".textBinder.placeMain").text(placeName)
        var pad;
        if(widthUnder(900)) pad = -25
        else pad = -20
        $(this).css("width", (pad + d3.select(".textBinder.placeMain").node().getBoundingClientRect().width) + "px")


      }
    })
    .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
      var disabledClass = (item.label == getPlaceSecondary().placenm) ? "disabled" : "enabled"
      return $( "<li></li>" )
        // .data( "item.autocomplete", item )
        .addClass("ui-menu-item")
        .addClass(disabledClass)
        .append( "<div class = 'ui-menu-item-wrapper'>" + item.label + "</div>")
        .appendTo( ul );
    }
  $( "#placeMain" )
    .click(function(){
      $(this).val("")
      d3.select(".placeSearch.placeMain").attr("src", "img/placeSearchActive.png")
    })
    .blur(function(){
      $(this).val(getPlaceMain().placenm)
      d3.select(".placeSearch.placeMain").attr("src", "img/placeSearch.png")
    })
  });

  $( function() {
    $( "#placeSecondary" ).autocomplete({
      source: placeNames,
      select: function( event, ui ) {
        var placeName = ui.item.value,
            place = data.filter(function(d){ return d.placenm == placeName })[0]
      
        d3.select("#placeClose").classed("active", true).classed("searching", false)

        updatePlaces(false, place)
        updateRace(false, "click")

        d3.select(".textBinder.placeSecondary").text(placeName)
        var pad;
        if(widthUnder(900)) pad = -25
        else pad = -20
        var w; 
        if(widthUnder(600)) w = Math.min(pad + d3.select(".textBinder.placeSecondary").node().getBoundingClientRect().width, 140)
        else w = pad + d3.select(".textBinder.placeSecondary").node().getBoundingClientRect().width
          console.log(w)
        $(this).css("width", w + "px")

      }


    })
    .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
      var disabledClass = (item.label == getPlaceMain().placenm) ? "disabled" : "enabled"
      return $( "<li></li>" )
        // .data( "item.autocomplete", item )
        .addClass("ui-menu-item")
        .addClass(disabledClass)
        .append( "<div class = 'ui-menu-item-wrapper'>" + item.label + "</div>")
        .appendTo( ul );
    }

  $( "#placeSecondary" )
    .click(function(){
      $(this).val("").removeClass("defaultText")
      d3.select("#placeClose").classed("searching",true)
    })
    .blur(function(){
      d3.select("#placeClose").classed("searching",false)
      if(getPlaceSecondary()){ $(this).val(getPlaceSecondary().placenm).removeClass("defaultText") }
      else{ $(this).val("Search for a city").addClass("defaultText") }
    })
  });

  d3.select("#placeClose")
    .on("click", function(){
      d3.select("#placeClose").classed("active", false)
      $( "#placeSecondary" ).val('Search for a city').addClass("defaultText")
      updatePlaces(false, false)
      updateRace(false, "click")
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
  $("#raceMenu").selectmenu({
    change: function(event, data){
      updateRace(data.item.value, "click")
    },
    open: function(event, ui){
      d3.selectAll(".ui-selectmenu-icon.ui-icon.ui-icon-triangle-1-s").classed("open", true)
    },
    close: function(event, ui){
      d3.selectAll(".ui-selectmenu-icon.ui-icon.ui-icon-triangle-1-s").classed("open", false)
    }
  })
  $(window).on("scroll", function(){
    var pBottom = d3.select("#lastPBeforeMenu").node().getBoundingClientRect().bottom
    var footerTop = d3.select("footer").node().getBoundingClientRect().bottom

    if(pBottom <= -6){
      d3.select("#mainMenuContainer")
        .style("position", "fixed")
        .style("top", "44px")
        .style("padding-bottom","20px")
        .style("padding-top","20px")

      if(widthUnder(600)){
        d3.select("#mainMenuContainer")
          .style("width", "calc(100% - 46px)")
          .style("background", "#f5f5f5")
        d3.selectAll(".menuBgEl")
          .style("background", "#f5f5f5")
      }


      d3.select("#lastPBeforeMenu")
        .style("margin-bottom", "90px")

      d3.select("#lastH3BeforeMenu")
        .style("margin-top","208px")
    }else{
      d3.select("#mainMenuContainer")
        .style("position", "relative")
        .style("top", "0px")
        .style("padding-bottom","0px")
        .style("padding-top","0px")

      if(widthUnder(600)){
        d3.select("#mainMenuContainer")
          .style("width", "100%")
          .style("background", "#ffffff")
        d3.selectAll(".menuBgEl")
          .style("background", "#ffffff")
      }
      
      d3.select("#lastPBeforeMenu")
        .style("margin-bottom", "70px")

      d3.select("#lastH3BeforeMenu")
        .style("margin-top","48px")
    }
  })

  d3.selectAll(".shareIcon")
    .on("click", function(){
      var blurb;
      if(this.classList.contains("top")) blurb = d3.select("#ttTopText").text()
      else if(this.classList.contains("ho")) blurb = d3.select("#ttHoText").text()
      else if(this.classList.contains("hw")) blurb = d3.select("#ttHvText")
      else blurb = ""

      var url = buildShareURL();
      var shareURL;
      if(this.classList.contains("twitterShare")) shareURL = getTwitterShare(url, blurb)
      else if(this.classList.contains("fbShare")) shareURL = getFacebookShare(url)
      else shareURL = getEmailShare(url, blurb)
        console.log(getEmailShare(url, blurb))

      window.open(shareURL, '_blank').focus();
      if(this.classList.contains('head')) toggle_visibility('shareBox')
 
    })

}



function init(placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType){
// stripped city, village, town, borough, municipality
// only 1 county in there, Hartsville/Trousdale County, TN
  $("#placeMain").val(placeMain.placenm)
   var pad;
   if(widthUnder(900)) pad = -25
   else pad = -20
   d3.select(".textBinder.placeMain").text(placeMain.placenm)
   $("#placeMain").css("width", (pad + d3.select(".textBinder.placeMain").node().getBoundingClientRect().width) + "px")

  if(secondaryVisible){
    $("#placeSecondary").val(placeSecondary.placenm).removeClass("defaultText")
    d3.select("#placeClose").classed("active", true)
  }else{
    $("#placeSecondary").val('Search for a city').addClass("defaultText")
    d3.select("#placeClose").classed("active", false)
  }

  buildChart("hhs", placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType)
  buildChart("hw", placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType)
  buildChart("ho_rate", placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType)
  buildChart("mean_hv", placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType)

  updateChartType("hhs", defaultChartType, false, secondaryVisible)
  updateChartType("hw", defaultChartType, false, secondaryVisible)
  if(defaultChartType == "grouped") d3.select(".toggle").classed("on", true).classed("off", false)

  updateRace(defaultRace)
}

function updatePlaces(placeMain, placeSecondary){
  if(placeMain){ d3.select(".dataBinder.placeMain").datum(placeMain) }
  if(placeMain){
    d3.selectAll(".placeMain.placeLabel").text(placeMain.placenm)
    d3.selectAll(".placeMain.placeLabelShort").text(" " + placeFormat(placeMain.placenm, false))
  }

    // d3.selectAll(".placeMain.placeLabel").text(placeFormat(default_datum.placenm, true))
    if(placeSecondary){
      d3.selectAll(".placeSecondary.placeLabelFiller").style("display", "inline-block")
      d3.selectAll(".placeMain.placeLabelFiller").style("display", "none")
      d3.selectAll(".placeSecondary.placeLabel").text(" " + placeFormat(placeSecondary.placenm, true))
      d3.selectAll(".placeSecondary.placeLabelShort").text(" " + placeFormat(placeSecondary.placenm, false))
    }
    else if(!getSecondaryVisible()){
      d3.selectAll(".placeSecondary.placeLabelFiller").style("display", "none")
      d3.selectAll(".placeMain.placeLabelFiller").style("display", "inline-block")
      d3.selectAll(".placeSecondary.placeLabel").text("")
      d3.selectAll(".placeSecondary.placeLabelShort").text("")
    }


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
function updateSvgMouseover(varSuffix){
  // console.log(y.step(), margin.top)
  var svg = d3.select("svg." + varSuffix)
  // var dataMain = svg.selectAll(".bar").data()
  // console.log(dataMain)
  // var eachBand = y.step();
  svg.on("mouseover", function(event){
    // console.log(event)
    var secondaryVisible = getSecondaryVisible()
    var chartType = getChartType()
    var height = getChartHeight(false, chartType, secondaryVisible)

    var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(["asian", "black", "hispanic", "other", "white"])
    .padding(GROUPED_BAR_PADDING);

    var eachBand = y.step();
    var margin = getChartMargins()

    var index = Math.round(((d3.pointer(event)[1] -margin.top ) / eachBand));
    
    var val = y.domain()[index ];
    console.log(val, index, d3.pointer(event)[1])
    
    if(typeof(val) == "undefined"){
      updateRace(false, "dehover")
    }else{
      updateRace(val.toLowerCase(), "hover")
    }
  })
  .on("mouseout", function(){
    updateRace(false, "dehover")
  })
  .on("click", function(event){
    var secondaryVisible = getSecondaryVisible()
    var chartType = getChartType()
    var height = getChartHeight(false, chartType, secondaryVisible)

    var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(["asian", "black", "hispanic", "other", "white"])
    .padding(GROUPED_BAR_PADDING);

    var eachBand = y.step();
    var margin = getChartMargins()

    var index = Math.round(((d3.pointer(event)[1] -eachBand ) / eachBand));
    
    var val = y.domain()[index];
    console.log(val, index, d3.pointer(event)[1])
    
    if(typeof(val) == "undefined"){
      updateRace(false, "dehover")
    }else{
      updateRace(val.toLowerCase(), "click")
    }
  })
}
function buildChart(varSuffix, placeMain, placeSecondary, secondaryVisible, defaultRace, defaultChartType){

  var dataMain = shapeData(varSuffix, placeMain),
      dataSecondary = shapeData(varSuffix, placeSecondary),
      margin = getChartMargins(),
      width = getChartWidth(),
      height = getChartHeight(varSuffix, false, secondaryVisible)

  d3.select(".chartTitle." + varSuffix)
    .html(CHART_TITLES["grouped"][varSuffix])

  var svg = d3.select(".chart." + varSuffix)
    .append("svg")
      .attr("class", varSuffix + " " + defaultChartType)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
  
  var x = d3.scaleLinear()
    .domain([0, d3.max(dataMain.concat(dataSecondary), function(d){ return +d.value } )])
    .range([ 0, width]);

  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(dataMain.map(function(d) { return d.label; }))
    .padding(GROUPED_BAR_PADDING);

var colors = ["#fff","#fff","#fff","#fff","#fff"]
  svg.selectAll(".bgRect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("class", "bgRect")
    .attr("x", -margin.left)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height/5)
    .attr("y", function(d,i){return i*(height/5)})
    .style("fill", function(d){ return d})
  
  svg.append("g")
    .attr("class", "axis y")
    .call(d3.axisLeft(y))
    .selectAll(".tick text")
      .attr("dy", "5px")
      .attr("class",function(d,i){
        return (defaultRace == d.toLowerCase()) ? "activeRace " + d.toLowerCase() : d.toLowerCase()
      })

  svg.selectAll(".bar.placeMain.hidden." + varSuffix)
    .data(dataMain)
    .enter()
    .append("rect")
      .attr("class", function(d){ return "bar placeMain hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.label); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : y.bandwidth() })

  svg.selectAll(".bar.placeMain.show." + varSuffix)
    .data(dataMain)
    .enter()
    .append("rect")
      .attr("class", function(d){ return "bar placeMain show " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.label); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : y.bandwidth() })
      .on("mouseenter", function(event){
        event.stopPropagation()
        updateRace(d3.select(this).datum().label.toLowerCase(), "hover")
      })
      .on("click", function(event){
        event.stopPropagation()
        updateRace(d3.select(this).datum().label.toLowerCase(), "click")
      })
      .on("mouseleave", function(event){
        updateRace(false, "dehover")
      })

  svg.selectAll(".bar.placeSecondary.hidden." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("rect")
      .attr("class", function(d){
        var collapseClass = (d.placenm == "") ? "collapsed" : "open"
        return "bar placeSecondary hidden " + varSuffix + " " + d.label.toLowerCase() + " " + collapseClass
      })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
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
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", x(0) )
      .attr("y", function(d) {
        return (secondaryVisible) ? y(d.label) + y.bandwidth()/2 + GROUPED_BAR_PAIR_PADDING*.5 : y(d.label);
      })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", function(){ return (secondaryVisible) ?  y.bandwidth()/2 : 0 })
      .on("mouseover", function(event){
        event.stopPropagation()
        updateRace(d3.select(this).datum().label.toLowerCase(), "hover")

      })
      .on("click", function(event){
        event.stopPropagation()
        updateRace(d3.select(this).datum().label.toLowerCase(), "click")

      })
      .on("mouseleave", function(event){
        updateRace(false, "dehover")
      })


  if(varSuffix == "mean_hv" || varSuffix == "ho_rate"){
    var avgOpacity = (secondaryVisible) ? 0 : 1,
        placeAvg = dataMain[0]["placeAvg"];

    var avgLine = svg.append("g")
      .attr("class", "avgEl avgLine " + varSuffix)
      .attr("transform", "translate(" + x(placeAvg) + ",0)")
   
    avgLine.append("line")
      .attr("class", "avgEl")
      .attr("y1", 0)
      .attr("y2", 187.67924528301887)
      .style("stroke", "#000")
      .style("opacity", avgOpacity)

    avgLine.append("circle")
      .attr("class", "avgEl")
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
      .style("opacity", avgOpacity)

  }else{
    svg.append("text")
      .text('100%')
      .attr('x',-80)
      .attr('y',12)
      .attr("class", "stackedAxisLabel")
      .style("opacity",0)
    svg.append("text")
      .text('0%')
      .attr('x',-63)
      .attr('y',196)
      .attr("class", "stackedAxisLabel")
      .style("opacity",0)
  }

  svg.selectAll(".barLabel.placeMain.hidden." + varSuffix)
    .data(dataMain)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeMain hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", 0)
      .attr("y", 0)
      .html(function(d){ return formatLabel(d.value, varSuffix) })
  
  svg.selectAll(".barLabel.placeSecondary.hidden." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeSecondary hidden " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", 0)
      .attr("y", 0)
      .html(function(d){ return formatLabel(d.percent, varSuffix) })

  svg.selectAll(".barLabel.placeMain.visible." + varSuffix)
    .data(dataMain)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeMain visible " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", function(d) { return x(d.value) + 5; })
      .attr("y", function(d) { return (secondaryVisible) ? y(d.label) + y.bandwidth()/4 + 5 : y(d.label) + y.bandwidth()/2 + 5; })
      .html(function(d){ return formatLabel(d.value, varSuffix) })
      .style("fill", DEFAULT_TEXT)
  

  svg.selectAll(".barLabel.placeSecondary.visible." + varSuffix)
    .data(dataSecondary)
    .enter()
    .append("text")
      .attr("class", function(d){ return "barLabel placeSecondary visible " + varSuffix + " " + d.label.toLowerCase() })
      .classed("activeRace", function(d){ return d.label.toLowerCase() == defaultRace })
      .attr("x", function(d) { return x(d.value) + 5; })
      .attr("y", function(d) { return y(d.label) + y.bandwidth() - 2; })
      .html(function(d){ return (secondaryVisible) ? formatLabel(d.value, varSuffix) : "" })
      .style("fill", DEFAULT_TEXT)

  updateSvgMouseover(varSuffix)

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
    d3.select(".dataBinder.placeSecondary").datum(false)
  }
  else if(placeSecondary){
    d3.selectAll(".avgEl")
      .transition()
      .duration(CHANGE_PLACE_DURATION)
      .style("opacity", 0)
    d3.select(".dataBinder.placeSecondary").datum(placeSecondary)
  }
  else if(placeMain && (varSuffix == "ho_rate" || varSuffix == "mean_hv")){
    var placeAvg = dataMain[0]["placeAvg"];

    var x = d3.scaleLinear()
          .domain([0, d3.max(dataMain, function(d){ return +d.value } )])
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
      var height = getChartHeight(varSuffix, "stacked", placeSecondary),
          margin = getChartMargins(),
          width = getChartWidth(),
          dataMain = d3.selectAll(".bar.placeMain." + varSuffix).data(),
          x = d3.scaleLinear()
            .domain([0, d3.max(dataMain, function(d){ return +d.value } )])
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

      svg.selectAll(".bgRect")
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("height", height/5)
          .attr("y", function(d,i){return i*(height/5)})

      svg.selectAll(".bar.show.placeMain." + varSuffix)
        .transition()
        .duration(CHANGE_PLACE_DURATION)
          .attr("y", function(d) { return cat(d.label); })
          .attr("height",  cat.bandwidth() )
          .attr("width", function(d) { return x(d.value); })

      svg.selectAll(".barLabel.hidden.placeSecondary." + varSuffix)
        .data(dataSecondary)

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
          .on("end", function(){
            updateSvgMouseover(varSuffix)
          })

      

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
          addingBar = true;
          var x = d3.scaleLinear()
            .domain([0, d3.max(dataMain.concat(dataSecondary), function(d){ return +d.value } )])
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
            

          svg.selectAll(".bgRect")
            .transition()
            .duration(CHANGE_PLACE_DURATION)
              .attr("height", height/5)
              .attr("y", function(d,i){return i*(height/5)})
              .on("end", function(){
                updateSvgMouseover(varSuffix)
              })

          // updateSvgMouseover(svg, margin, cat)

        }else{
          //update secondary grouped bar
          var x = d3.scaleLinear()
            .domain([0, d3.max(dataMain.concat(dataSecondary), function(d){ return +d.value } )])
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
        }
      }else{
      //update main grouped bar
        var dataSecondary = svg.selectAll(".bar.placeSecondary").data()
        var dataVisible = (getSecondaryVisible() ? dataMain.concat(dataSecondary) : dataMain)
        var x = d3.scaleLinear()
          .domain([0, d3.max(dataVisible, function(d){ return +d.value } )])
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
            return d3.select(this).classed("activeRace") ? ACTIVE_BLUE : DEACTIVE_BLUE
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
          .style("fill", function(){ return d3.select(this).classed("activeRace") ? ACTIVE_GREEN : DEACTIVE_GREEN })

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
  var duration = (transition) ? CHANGE_TYPE_DURATION : 0,
      dataMain = d3.selectAll(".bar.show.placeMain." + varSuffix).data(),
      dataSecondary = d3.selectAll(".bar.show.placeSecondary." + varSuffix).data(),
      dataActive = (secondaryVisible) ? dataMain.concat(dataSecondary) : dataMain,
      width = getChartWidth()
      x = d3.scaleLinear()
        .domain([0, d3.max(dataActive, function(d){ return +d.value } )])
        .range([ 0, width]),
      margin = getChartMargins()

  d3.selectAll("svg." + varSuffix).classed("grouped", false).classed("stacked", false).classed(chartType, true)

  d3.select(".chartTitle." + varSuffix)
    .html(CHART_TITLES[chartType][varSuffix])

  if(chartType == "stacked"){
  //stacked bar

    d3.selectAll(".stackedAxisLabel")
      .transition()
      .duration(duration)
      .style("opacity",1)

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
          else return d3.select(this).classed("activeRace") ? ACTIVE_BLUE : DEACTIVE_BLUE
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
        .style("fill", function(){ return d3.select(this).classed("activeRace") ? ACTIVE_GREEN : DEACTIVE_GREEN })


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

    d3.selectAll(".stackedAxisLabel")
      .transition()
      .duration(duration)
      .style("opacity",0)


    var height = getChartHeight(varSuffix, "grouped", secondaryVisible),
        y = d3.scaleLinear()
          .domain([0, 1 ])
          .range([ 0, height]),
        x = d3.scaleLinear()
          .domain([0, d3.max(dataActive, function(d){ return +d.value } )])
          .range([ 0, width]),
        data = d3.selectAll(".bar." + varSuffix).data(),
        cat = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) { return d.label; }))
          .padding(GROUPED_BAR_PADDING);

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

  d3.select(".chart svg." + varSuffix)
    .selectAll(".bgRect")
      .transition()
      .duration(duration)
          .attr("height", height/5)
          .attr("y", function(d,i){return i*(height/5)})

}


function updateRace(race, eventType){

  if(!race) race = getActiveRace()
  else($("#raceMenu").val(race).selectmenu("refresh"))

  d3.select(".textBinder.race").text($("#raceMenu option:selected").text())

  var pad;
  if(widthUnder(900)) pad = -5
  else pad = 10
  d3.select("#raceMenu-button").style("width", function(){ return (pad + d3.select(".textBinder.race").node().getBoundingClientRect().width) + "px" })

  var raceClass = (eventType == "click") ? "activeRace" : "hover"
  if(eventType == "hover"){
    d3.selectAll(".bar").classed("hoverChart", true)
    d3.selectAll(".barLabel").classed("hoverChart", true)
    d3.selectAll(".tick text").classed("hoverChart", true)
  }
  if(eventType == "dehover"){
    d3.selectAll(".hoverChart").classed("hoverChart",false)
    d3.selectAll(".hover").classed("hover",false)
    race = d3.select(".bar.activeRace").datum().label.toLowerCase()
    raceClass = "activeRace"

    $("#raceMenu").val(race).selectmenu("refresh")

    d3.select(".textBinder.race").text($("#raceMenu option:selected").text())

    var pad;
    if(widthUnder(900)) pad = -5
    else pad = 10
    d3.select("#raceMenu-button").style("width", function(){ return (pad + d3.select(".textBinder.race").node().getBoundingClientRect().width) + "px" })

  }
  
  d3.selectAll("." + raceClass).classed(raceClass,false)
  d3.selectAll(".bar." + race).classed(raceClass, true)
  d3.selectAll(".barLabel")
    .style("fill", function(){
    if(getSecondaryVisible()){
      return (d3.select(this).classed("placeMain")) ? DEACTIVE_BLUE : DEACTIVE_GREEN
    }else{
      return DEFAULT_TEXT
    }
  })
  d3.selectAll(".barLabel." + race)
    .classed(raceClass, true)
    .style("fill", function(){
      if(getSecondaryVisible()){
        return (d3.select(this).classed("placeMain")) ? ACTIVE_BLUE : ACTIVE_GREEN
      }else{
        return DEFAULT_TEXT
      }
    })
  d3.selectAll(".tick text." + race).classed(raceClass, true)

  buildTooltips();
}

function buildTooltips(){
  var race = getActiveRace()
  var placeMain = getPlaceMain()
  var placeSecondary = getPlaceSecondary()
  var isSecondaryVisible = getSecondaryVisible()
  // var hhsMain = 

  var topText;
  var conjunctionJunctionMain = (Math.abs(+placeMain[race + "_" + "hhs"]/+placeMain["hhs"] -  +placeMain[race + "_" + "hw"]/+placeMain["hw"]) <= .005) ? "and" : "but"

  if(isSecondaryVisible){
    var conjunctionJunctionSecondary = (Math.abs(+placeSecondary[race + "_" + "hhs"]/+placeSecondary["hhs"] -  +placeSecondary[race + "_" + "hw"]/+placeSecondary["hw"]) <= .005) ? "and" : "but"

    topText = "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households represent " + PERCENT_TEXT(+placeMain[race + "_" + "hhs"]/+placeMain["hhs"]) + " of those living in the city " + conjunctionJunctionMain + " they own " + PERCENT_TEXT(+placeMain[race + "_" + "hw"]/+placeMain["hw"]) + " of the housing wealth. And in <span class = 'placeSecondaryTT'>" + placeSecondary.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households are " + PERCENT_TEXT(+placeSecondary[race + "_" + "hhs"]/+placeSecondary["hhs"]) + " of all households " + conjunctionJunctionSecondary + " they own " + PERCENT_TEXT(+placeSecondary[race + "_" + "hw"]/+placeSecondary["hw"]) + " of the housing wealth."

  }else{
    topText = "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households make up " + PERCENT_TEXT(+placeMain[race + "_" + "hhs"]/+placeMain["hhs"]) + " of the city&rsquo;s total households " + conjunctionJunctionMain + " own " + PERCENT_TEXT(+placeMain[race + "_" + "hw"]/+placeMain["hw"]) + " of the housing wealth."
  }

  d3.select("#ttTopText").html(topText)


  var hoText;
  if(isSecondaryVisible){
    hoText =   "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have a homeownership rate of " + PERCENT_TEXT(placeMain[race + "_ho_rate"]) + ", and in <span class = 'placeSecondaryTT'>" + placeSecondary.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have a homeownership rate of " + PERCENT_TEXT(placeSecondary[race + "_ho_rate"]) + "."
  }else{
    var diff = Math.abs(+placeMain[race + "_ho_rate"] - +placeMain["ho_rate"])
    var diffText = (placeMain[race + "_ho_rate"] - placeMain["ho_rate"] < 0) ? "lower" : "higher"

    hoText = "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have a homeownership rate of " + PERCENT_TEXT(placeMain[race + "_ho_rate"]) + ", which is " + PERCENTAGE_POINTS(diff) + " " + diffText + " than the city average."
  }

  d3.select("#ttHoText").html(hoText)

  var hvText;

  if(isSecondaryVisible){
    hvText =   "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have an average home value of " + DOLLARS_LONG(placeMain[race + "_mean_hv"]) + ", and in <span class = 'placeSecondaryTT'>" + placeSecondary.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have an average home value of " + DOLLARS_LONG(placeSecondary[race + "_mean_hv"]) + "."
  }else{
    var diff = Math.abs(+placeMain[race + "_mean_hv"] - +placeMain["mean_hv"])
    var diffText = (+placeMain[race + "_mean_hv"] - +placeMain["mean_hv"] < 0) ? "lower" : "higher"

    hvText = "In <span class = 'placeMainTT'>" + placeMain.placenm + "</span>, " + SOCIAL_RACE_NAMES[race] + " households have an average home value of " + DOLLARS_LONG(placeMain[race + "_mean_hv"]) + ", which is " + DOLLARS_LONG(diff) + " " + diffText + " than the city average."
  }

  d3.select("#ttHvText").html(hvText);



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