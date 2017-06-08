$(document).ready(function() {
    // Openmodal fermante quand une autre s'ouvre
    $('.vmariot').click(function(){
        $('#Signin').modal('hide')
    });
    // Dropdown open avec la souris
    $('.dropdown').hover(function() {
        $('#Header').toggleClass("open");
    });
});
