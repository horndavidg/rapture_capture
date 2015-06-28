$(function() {
  
  var map;
  
  function initialize() {
    // Puts the Google Map on the page

    map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 2,
      center: {lat: 39.7643389, lng: -104.8551114}
    });


    var mapDiv = document.getElementById('map-canvas');

    google.maps.event.addListener(map, 'click', addMarker);
  
  }


  function addMarker(event) {
  	   // This adds a marker to the map when you click on a select
       // spot, then sends a ajax call and uses the Google API to 
       // populate a location name and adds it to the database.

          $('#searchhelpbox').remove();

        var lat = event.latLng.A;
        var long = event.latLng.F;
        var location = "";
     
   var data = {location:location, lat:lat, long:long};

      $.ajax({
        type: 'POST',
        url: '/show',
        data: data,
        dataType: 'json'
      }).done(function(data) {


          var html = placeHelp(data.place);
          $('#searchhelp').append(html);

  });

    console.log(event.latLng.A);
  	console.log(event.latLng.F);

  	// Add your code to add markers here ***********************

      // var myLatlng = new google.maps.LatLng(event.latLng.A,event.latLng.F);

      // var marker = new google.maps.Marker({
      //       position: myLatlng,
      //       map: map,
      //       title: 'Test!'
      // });

}

  initialize();

function placeHelp(place) {
   
return '<div id="searchhelpbox" class="ui info message">' + 
'<div class="header">Location Help</div><ul class="list"><li>Location: <strong>' + 
place.location + '</strong></li><li>Latitude: <strong>' + place.lat + 
'</strong></li><li>Longitude: <strong>' + place.long + '</strong></li></ul></div>';



  }

  function loadPlaces() {
      // Populates the list of places visited and puts markers
      // on the map for each location.

    $.getJSON("/places").done(function(data) {
        
        data.places.forEach(function(place) {

            var myLatlng = new google.maps.LatLng(place.lat,place.long);

            var marker = new google.maps.Marker({

                      position: myLatlng,
                      map: map,
                      title: place.name
                
                 });

            var html = placeHtml(place);
            $('#table').append(html);
        });
        
    });
  }

function placeHtml(place) {
    // Function used for formatting when appending data to
    // the index page. 


var start = place.startdate.slice(5,7) + "/" + place.startdate.slice(8,10) + "/" + place.startdate.slice(0,4);
var end = place.enddate.slice(5,7) + "/" + place.enddate.slice(8,10) + "/" + place.enddate.slice(0,4);

return '<tr><td><strong><a class="linkTitle" href="/places/' + place._id + '">' + place.name + 
'</a></strong></td><td><strong>' + start + '</strong> - to - <strong>' + end + '</strong></td><td><a href="/places/' + place._id + 
'/entries"> <button class="ui inverted button">' + place.entries.length + '</button></a></td><td><a href="/places/' + place._id + 
'/edit"><button class="ui inverted button">Edit</button></a></td>';


  }

  loadPlaces();

// Form for addind a new location to the database

$('#newlocation').click(function(e) {
    e.preventDefault();


     $('#newlocation').hide();


    var html = '<form action="/show" method="POST" id="newForm"><div class="ui form">' +
    '<div class="ui info message"><div class="header">Look up a place you have been before or maybe the location for your next adventure!' +
    '</div></div><div class="fields"><div class="six wide field">' +
    '<label><span class="white">I went to:</span></label><input placeholder="Enter closest location" id="location" type="text" name="location">' +
      '</div></div><br><div><input type="submit" value="Look for It" class="ui primary button">' +
     '</div></div></form><br>';

     // Form for entering a location to search for...


    $('.setpoint').after(html);


      var location = $('#location').val();
     
      var data = {place: {location:location}};

      $.ajax({
        type: 'POST',
        url: '/show',
        data: data,
        dataType: 'json'
      }).done(function(data) {
          
      
         $('#newlocationform').remove();
        
      });     
 });














// END OF THE UPON LOAD TAG //
// ************************************************************
});
