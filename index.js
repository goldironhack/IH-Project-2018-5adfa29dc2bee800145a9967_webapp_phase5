const API_KEY = "AIzaSyBwTL-fCgMYyPAPkpd_vRQfQnBuU_uLbOs";
const NEIGHBORHOOD_NAMES = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const CRIMES_DATES = "https://data.cityofnewyork.us/api/views/qqpn-33w6/rows.json?accessType=DOWNLOAD";
const HOUSING = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";
var infoRows = [];
var ubications= [];
var houses= [];
var housesLat= [];
var centers = [];
var crimes = [];
var polis = [];
var latsLongs=[];
var housings = [];

var estoy=false;
var t;
var neiLat;
var neiLng;
var latPol;
var table1Got=false;
var table2Got=false;
var table3Got=false;

var map;
var nyu_coordinates={lat:40.729100, lng: -73.996500}


//var NYUlt= new LatLng(40.729100,-73.996500);
var nyu_marker;
var mak;
var directionsService;
var directionsRenderer;

function getData(URL){
  var data = $.get(NEIGHBORHOOD_NAMES, function(){})
  .done(function(){
    var dataR = data.responseJSON.data;
    for (var i=0;i<dataR.length;i++){
      infoRows.push([dataR[i][10],dataR[i][9],dataR[i][16]]);
      neiLat= parseFloat(dataR[i][9].split(" ")[1].split("(")[1]);
      neiLng= parseFloat(dataR[i][9].split(" ")[2].split(")")[0]);
      t={lat: neiLng, lng: neiLat};
      ubications.push(t);
      //console.log(t);
    }
    /*var tableReference = $("#tableBody")[0];
    var newR,neighborhood,ubication,borough;
    for(var j=0;j<dataR.length;j++){
      newR = tableReference.insertRow(tableReference.rows.length);
      neighborhood = newR.insertCell();
      ubication = newR.insertCell();
      borough = newR.insertCell();
      neighborhood.innerHTML = infoRows[j][0];
      ubication.innerHTML = infoRows[j][1];
      borough.innerHTML = infoRows[j][2];
    }
    console.log(infoRows);*/
  })
  .fail(function error(){
    console.log(error);
  })
}

function getData2(URL){
  var data = $.get(CRIMES_DATES, function(){})
  .done(function(){
    var dataR = data.responseJSON.data;
    for (var i=0;i<dataR.length;i++){
      crimes.push([dataR[i][21],dataR[i][19],dataR[i][29],dataR[i][30]]);
    }
    var tableReference = $("#tableBody2")[0];
    var newR,boro,crimen,latw,lngw;
    for(var j=0;j<dataR.length;j++){
      newR = tableReference.insertRow(tableReference.rows.length);
      boro = newR.insertCell();
      crimen = newR.insertCell();
      latw = newR.insertCell();
      lngw = newR.insertCell();
      boro.innerHTML = crimes[j][0];
      crimen.innerHTML = crimes[j][1];
      latw.innerHTML = crimes[j][2];
      lngw.innerHTML = crimes[j][3];
    }
    console.log(crimes);
  })
  .fail(function error(){
    console.log(error);
  })
}

function getData3(URL){
  var data = $.get(HOUSING, function(){})
  .done(function(){
    var dataR = data.responseJSON.data;
    for (var i=0;i<dataR.length;i++){
      houses.push([0,dataR[i][15],dataR[i][19],parseInt(dataR[i][33])]);
      if(estoy==false){
        housings.push([0,dataR[i][15],dataR[i][19],parseInt(dataR[i][33])]);
        estoy=true;
      }
var toy = false;
      for (var h = 0; h < housings.length; h++){
          if(dataR[i][19]==housings[h][2]){
          housings[h][3]= (parseInt(housings[h][3]) + parseInt(dataR[i][33]));
          toy = true;
      }
    }
    if(toy==false){
      housings.push([0,dataR[i][15],dataR[i][19],parseInt(dataR[i][33])]);
    }
      neiLat= parseFloat(dataR[i][23]);
      neiLng= parseFloat(dataR[i][24]);
      t={lat: neiLng, lng: neiLat};
      housesLat.push(t);
  }
  housings.splice(58,1);

  housings.sort(function compare(a, b) {
  if (a[3]>b[3]) {
    return -1;
  }
  if (a[3]<b[3]) {
    return 1;
  }
  // a debe ser igual b
  return 0;
});
//console.log(tabla3);
  for (var i = 0; i < housings.length; i++) {
    housings[i][0]=i+1;
    console.log(i);
  }


    var tableReference = $("#tableBody3")[0];
    var newR,position,borough,borDist,lows;
    for(var j=0;j<housings.length;j++){
      newR = tableReference.insertRow(tableReference.rows.length);
      position = newR.insertCell();
      borough = newR.insertCell();
      borDist = newR.insertCell();
      lows = newR.insertCell();
      position.innerHTML = housings[j][0]
      borough.innerHTML = housings[j][1];
      borDist.innerHTML = housings[j][2];
      lows.innerHTML    = housings[j][3];
    }
    console.log(infoRows);
  })
  .fail(function error(){
    console.log(error);
  })
}

function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: nyu_coordinates
  });

  nyu_marker = new google.maps.Marker({
    position: nyu_coordinates,
    map: map
  });
  mak= new google.maps.Marker({
    position: t,
    map: map
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  //markerEvents(ny_marker);
  var ny = new google.maps.LatLng(40.729100,-73.996500);

  map.data.loadGeoJson('https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson')
  var n=0;
  map.data.setStyle(function(df) {
    polis[n]= df;
    n++;

    var boro = df.getProperty('BoroCD')/100>>0;
    var noHab = df.getProperty('BoroCD')%100;

    var color = getRandomColor();
    var state = false;
    if(boro == 1 || boro==2 || boro==3 || boro==4 || boro==5)state = true;
    return {
      fillColor: color,
      strokeWeight: 1,
      visible :state
    };
});
}
function showCenter(){
  for (var i = 0; i < centers.length; i++) {
    var mak= new google.maps.Marker({
     position: centers[i],
     map: map
   });
  }
}
function getCen(){
  for (var i = 0; i < polis.length; i++) {
    console.log(polis[i]);
    var boro = polis[i].getProperty('BoroCD');
    console.log(boro);

    latPol= new google.maps.LatLngBounds();
      if(polis[i].b.b.length>1){

        for (var j = 0; j < polis[i].b.b.length; j++) {

          for (var k = 0; k < polis[i].b.b[j].b["0"].b.length; k++) {
            latPol.extend(polis[i].b.b[j].b["0"].b[k]);
          }
        }
      }else {
        for (var r = 0; r < polis[i].b.b["0"].b.length; r++) {
        latPol.extend(polis[i].b.b["0"].b[r]);
        }
      }
        //latPol.extend(polis[i].b.b["0"].b["0"]);
        //console.log(latPol.getCenter().lat());
        //console.log(latPol.getCenter().lng());
        //console.log(latPol.getCenter());
        var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(40.729100,-73.996500), new google.maps.LatLng(latPol.getCenter().lat(),latPol.getCenter().lng()));
  centers.push([0,boro,latPol.getCenter(),distance]);
}
console.log(centers);
  centers.sort(function compare(a, b) {
  if (a[3]<b[3]) {
    return -1;
  }
  if (a[3]>b[3]) {
    return 1;
  }
  // a debe ser igual b
  return 0;
});
for (var i = 0; i < centers.length; i++) {
  centers[i][0]=i+1;
}

  var tableReference = $("#tableBody")[0];
  var newR,rank,boro,ubication,distance;
  for(var j=0;j<centers.length;j++){
    newR = tableReference.insertRow(tableReference.rows.length);
    rank = newR.insertCell();
    boro = newR.insertCell();
    ubication = newR.insertCell();
    distance = newR.insertCell();
    rank.innerHTML = centers[j][0];
    boro.innerHTML = centers[j][1];
    ubication.innerHTML = centers[j][2];
    distance.innerHTML = centers[j][3]
  }
  console.log(infoRows)

  }
function showCenters(){
  for (var i = 0; i < centers.length; i++) {
    console.log(centers[i]);
    var mark = new google.maps.Marker({
      position: centers[i][2],
      map: map
    });
  }
}

function showNei(){
  for (var i = 0; i < ubications.length; i++) {

  }
}
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function mostrarTabla1(){
document.getElementById('tabla1').style.display = 'block';
}
function ocultaTabla1(){
  document.getElementById('tabla1').style.display = 'none';
}
function mostrarTabla2(){
document.getElementById('tabla2').style.display = 'block';
}
function ocultaTabla2(){
  document.getElementById('tabla2').style.display = 'none';
}
function mostrarTabla3(){
document.getElementById('tabla3').style.display = 'block';
}
function ocultaTabla3(){
  document.getElementById('tabla3').style.display = 'none';
}

$("document").ready(function (){


  $("#ShowLocations").on("click",function (){
    if(table1Got==false){
    getData();
    table1Got = true;
  }
    mostrarTabla1();
    setTimeout(function(){
      showNei();
}, 10);

  })

  $('#centers').on("click",function (){
    getCen();
    setTimeout(function(){
      showCenters();
}, 10);

  })
  $("#getLocations").on("click",showNei)

  $(".distance").on("click",function (){
    ocultaTabla2();
    ocultaTabla3();
    if(table1Got==false){
      getCen();
      table1Got=true;
      mostrarTabla1();
    }
    mostrarTabla1();
    setTimeout(function(){
      showNei();
}, 10);

  })
  $(".safety").on("click",function (){
    ocultaTabla1();
    ocultaTabla3();
    if(table2Got==false){
      getData2();
      table2Got=true;
      mostrarTabla2();
    }
    mostrarTabla2();
  })
  $(".afford").on("click",function (){
    ocultaTabla1();
    ocultaTabla2();
    if(table3Got==false){
      getData3();
      table3Got=true;
      mostrarTabla3();
    }
    mostrarTabla3();
  })


  $("#ShowCenter").on("click",showCenter)
})




/*function markerEvents(marker){
  if(marker != "undefined"){
    marker.addListener("click",)
  }
}*/
