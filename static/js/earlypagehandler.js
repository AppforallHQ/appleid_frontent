function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

var enable_submit = function(email){
    if(validateEmail(email)){
	$('#apple_id_req .submit').attr('disabled', false);
    } else {
	$('#apple_id_req .submit').attr('disabled', true);
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

function form_clean_up(){
    // Clean up the form
    $('#email').val('');
    $('input[name="ref_id"]').val('');

    $('#apple_id_req .submit').attr('disabled', true);
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
		    $('.slide-success').html('درخواست شما با موفقیت ثبت شد. در اولین فرصت بعد از رفع مشکل با شما تماس خواهیم گرفت.');
		    form_clean_up();
		    $('.slide-success').show();
		    fadeOutSuccessAlert();
		} else {
		    $('#loader').fadeOut();
		    $('.slide-error').html('مشکلی در ثبت درخواست شما رخ داده است.');
		    $('.slide-error').show();
		    fadeOutErrorAlert();
		}
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
