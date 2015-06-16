function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var enable_submit = function(email){
    if(validateEmail(email)){
	$('#apple_id_req .form-submit').attr('disabled', false);
    } else {
	$('#apple_id_req .form-submit').attr('disabled', true);
    }
};

function succeed_field(obj){
    $(obj).removeClass('error');
    $(obj).addClass('success');
}

function error_field(obj){
    $(obj).removeClass('success');
    $(obj).addClass('error');
}

function run_loader(){
    $('#loader').fadeIn('');
}

$(document).ready(function(){
    $('#apple_id_req input').keyup(function(){
	var email = $('#email').val();
	enable_submit(email);
    });
    
    $('#email').change(function(){
	if(validateEmail($(this).val())){
	    succeed_field(this);
	} else {
	    error_field(this);
	}
    });


    $('#apple_id_req').submit(function(event){
	event.preventDefault();

	var postData = $(this).serializeArray();
	var formURL = $(this).attr("action");
	
	$.ajax({
	    url: formURL,
	    type: "POST",
	    data: postData,
	    beforeSend: run_loader(),
	    success: function(response)
	    {
		if(response.done == true){
		    console.log(response.share);
		    console.log(response.ql);
		    $('#loader').fadeOut();
		    form_clean_up();
		    $('.slide-success').show();
		    fadeOutSuccessAlert();
		} else {
		    $('#loader').fadeOut();
		    $('.slide-error').html('مشکلی در ثبت درخواست شما رخ داده است.');
		    $('.slide-error').show();
		    fadeOutErrorAlert();
		}
		Recaptcha.reload();
	    },
	    error: function(response)
	    {
		$('#loader').fadeOut();
		$('.slide-error').html('مشکلی در ثبت درخواست شما رخ داده است.');
		$('.slide-error').show();
		fadeOutErrorAlert();
	    }
	});
    });
});
