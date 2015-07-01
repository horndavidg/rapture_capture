// Page that runs single page functionality (with jQuery) through 
// the “views/show” page. Makes XML GET Request to Expedia API. 
// Currently NOT functioning with Heroku in deployment so code not in use, 
// works on “localhost:” deployment....

$(function() {

$('#localattractions').click(function(e) {
    e.preventDefault();
    // Prevents the form from submitting and allows access
    // to hidden values.

      $('#localattractions').hide();

var location = $('#location').val();

var key = $('#key').val();

$.ajax({
  url: 'http://terminal2.expedia.com/x/activities/search?location=' + location + '&apikey=' + key,
  method: "GET",
  // makes request to Expedia API with ajax (single page functionality)
  success: function(data) {
  var info = JSON.stringify(data);
  var info2 = JSON.parse(info);

var title = '<h3 class="ui dividing header" id="indent"><span class="white">Local Attractions:</span></h3>';  


$('#placehere').append(title);

// Amends the found information to the page without refreshing 

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