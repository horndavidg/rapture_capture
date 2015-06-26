$(function() {

 // require('dotenv').load();

$('#localattractions').click(function(e) {
    e.preventDefault();

      $('#localattractions').hide();

var location = $('#location').val();

$.ajax({
  url: 'http://terminal2.expedia.com/x/activities/search?location=' + location + '&apikey=1QuJvV20cJTx4gtsq6AyOY4wtJ8YjoL6',
  method: "GET",
  success: function(data) {
  var info = JSON.stringify(data);
  var info2 = JSON.parse(info);

var title = '<h3 class="ui dividing header" id="indent">Local Attractions:</h3>';  


$('#placehere').append(title);


info2.activities.forEach(function(activity){

  var html =   '<div id="takeaway" class="ui two column centered grid"><div class="four column centered row">' +
  '<div class="column"><div class="ui info message"><p class="lp_p">' + 
  activity.title + '<strong> Price: ' + activity.fromPrice + '</strong></p></div>' +
  '</div></div></div>';

   $('#placehere').append(html);

		});
      }
	});
});



// $.ajax({
//   url: 'http://terminal2.expedia.com/x/activities/search?location=Boston&apikey=1QuJvV20cJTx4gtsq6AyOY4wtJ8YjoL6',
//   method: "GET",
//   success: function(data) {

//     alert(JSON.stringify(data));
//   }
// });









	// END OF THE UPON LOAD TAG //
// ************************************************************
});