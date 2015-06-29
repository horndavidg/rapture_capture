$(function() {


$('#localattractions').click(function(e) {
    e.preventDefault();
    // Prevents the form from submitting and allows access
    // to hidden values.

      $('#localattractions').hide();

var location = $('#location').val();

var key = $('#key').val();

$.ajax({
  url: 'https://terminal2.expedia.com/x/activities/search?location=' + location + '&apikey=' + key,
  method: "GET",
  success: function(data) {
  var info = JSON.stringify(data);
  var info2 = JSON.parse(info);

var title = '<h3 class="ui dividing header" id="indent"><span class="white">Local Attractions:</span></h3>';  


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










	// END OF THE UPON LOAD TAG //
// ************************************************************
});