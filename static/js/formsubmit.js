$(document).ready(function(){
    $('#apple_id_req').submit(function(event){
	event.preventDefault();

	var postData = $(this).serializeArray();
	var formURL = $(this).attr("action");
	
	$.ajax({
	    url: formURL,
	    type: "POST",
	    data: postData,
	    success: function(response)
	    {
		if(response.done == true){
		    $('.slide-success').show();
		} else {
		    $('.slide-error').show();
		}
	    },
	    error: function(response)
	    {
		$('.slide-error').show();
	    }
	});
    });
});
