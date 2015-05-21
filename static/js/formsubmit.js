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

$(document).ready(function(){

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
