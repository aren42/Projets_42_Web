$(document).ready(function() {

    $(window).scroll(function(){
        $('#scroll_top').show()
    })

    $('#scroll_top').click(function() {
        $('html,body').animate({
            scrollTop: 0
        }, 700);
        $('#scroll_top').hide()
        $('#scroll_top_r').hide()
    })

    $(window).scroll(function(){
        $('#scroll_top_r').show()
    })

    $('#scroll_top_r').click(function() {
        $('html,body').animate({
            scrollTop: 0
        }, 700);
        $('#scroll_top').hide()
        $('#scroll_top_r').hide()
    })

});