jQuery(document).ready(function(){

$('#menu-toggle').click(function() {
	if ($('ul#menu').css('display') == 'none') {
		$(this).parent('#head').children('ul').show();
		$(this).addClass('open');
	}
    else {
    	$(this).parent('#head').children('ul').hide();
		$(this).removeClass('open');
    }
});

var eventFired = 0;
$(window).on('resize', function() {
    if (!eventFired) {
        if ($(window).width() > 780) {
            $('#head').children('ul').show();
        } else {
			$('#head').children('ul').hide();
        }
    }
});

$(document).click(function(event) {
	if (!$(event.target).closest('header').length && $(window).width() <= 780) {
		$('#head ul').hide();
		$('#menu-toggle').removeClass('open');
	}
	if (!$(event.target).closest('header').length) {
		$('#menu-toggle').removeClass('open');
	}
});

$('ul#menu li a').click(function() {
	if ($(window).width() <= 780) {
		$(this).parents('#head').children('ul').slideUp();
	}
});


$(window).scroll(function () {
    var $heightScrolled = $(window).scrollTop();
    var $defaultHeight = 100;

    if ( $heightScrolled < $defaultHeight )
    {
        $('header').removeClass('sticky')
        }
    else {
        $('header').addClass('sticky')
        }
});


})

