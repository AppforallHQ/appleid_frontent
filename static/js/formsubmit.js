function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@(gmail.com|outlook.com|yahoo.com|ymail.com|aol.com|me.com|icloud.com|mac.com|live.com|hotmail.com)$/i;
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

var check_captcha = function(captcha){
    if(captcha.length > 2)
	return true;
    else
	return false;
};

var password_confirm = function(password, confirm){
    if(password == confirm){
	return true;
    } else {
	return false;
    }
};

var enable_submit = function(email, password, confirm, captcha){
    if(validateEmail(email) && password_check(password) && password_confirm(password, confirm) && check_captcha(captcha)){
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
	$('div.error').fadeOut();
    },5000);
}

function fadeOutSuccessAlert(){
    setTimeout(function(){
	$('div.success').fadeOut();
    },5000);
}

var bind_keyup = function(){
    $('#apple_id_req input').keyup(function(){
	// Check form data in every keypress
	var email = $('#apple_id').val();
	var password = $('#password').val();
	var confirm = $('#confirm').val();
	var captcha = $('#recaptcha_widget_div input[type=text]').val();
	enable_submit(email, password, confirm, captcha);
    });
};

$(document).ready(function(){
    form_clean_up();

    var bound = false;
    $("div.page-body").bind("DOMSubtreeModified", function() {
	if($('#apple_id_req input').length == 7 && !bound){
	    bound = true;
	    bind_keyup();
	}
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
		    $('.success').show();
		    fadeOutSuccessAlert();
		} else {
		    $('#loader').fadeOut();
		    $('.error').html(response.error);
		    $('.error').show();
		    fadeOutErrorAlert();
		}
		Recaptcha.reload();
		// grecaptcha.reset(); // New recaptcha
	    },
	    error: function(response)
	    {
		$('#loader').fadeOut();
		$('.error').html(response.error);
		$('.error').show();
		fadeOutErrorAlert();
		Recaptcha.reload();
		// grecaptcha.reset(); // New recaptcha
	    }
	});
    });
});
