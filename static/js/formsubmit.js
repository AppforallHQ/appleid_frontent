function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var password_check = function(password){
    // At least one lower case character
    // At least one capital character
    // At least one number
    // At least 8 character length
    var style_re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/);
    // Contains more than two consecutive character
    var consecutive_re = new RegExp(/(\w)\1{2,}/);
    if(password.length >= 8 && style_re.test(password) &&  !consecutive_re.test(password)){
	return true;
    } else {
	return false;
    }
};

var password_confirm = function(password, confirm){
    if(password == confirm){
	return true;
    } else {
	return false;
    }
};

var enable_submit = function(email, password, confirm){
    if(validateEmail(email) && password_check(password) && password_confirm(password, confirm)){
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

function form_clean_up(){
    // Clean up the form
    $('#apple_id').val('');
    $('#password').val('');
    $('#confirm').val('');

    $('#apple_id_req .form-submit').attr('disabled', true);
}

function run_loader(){
    $('#loader').fadeIn('');
}

function fadeOutErrorAlert(){
    setTimeout(function(){
	$('.slide-error').fadeOut();
    },5000);
}

function fadeOutSuccessAlert(){
    setTimeout(function(){
	$('.slide-success').fadeOut();
    },5000);
}

$(document).ready(function(){
    form_clean_up();

    $('#apple_id_req input').keyup(function(){
	// Check form data in every keypress
	var email = $('#apple_id').val();
	var password = $('#password').val();
	var confirm = $('#confirm').val();
	enable_submit(email, password, confirm);
    });

    $('#apple_id').change(function(){
	if(validateEmail($(this).val())){
	    succeed_field(this);
	} else {
	    error_field(this);
	}
    });

    $('#password').change(function(){
	if(password_check($(this).val())){
	    succeed_field(this);
	} else {
	    error_field(this);
	}
    });

    $('#confirm').change(function(){
	if(password_confirm($(this).val(), $('#password').val())){
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
		    $('#loader').fadeOut();
		    form_clean_up();
		    $('.slide-success').show();
		    fadeOutSuccessAlert();
		} else {
		    $('#loader').fadeOut();
		    $('.slide-error').html(response.error);
		    $('.slide-error').show();
		    fadeOutErrorAlert();
		}
	    },
	    error: function(response)
	    {
		$('#loader').fadeOut();
		$('.slide-error').html(response.error);
		$('.slide-error').show();
		fadeOutErrorAlert();
	    }
	});
    });
});
