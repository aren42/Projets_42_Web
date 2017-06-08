$(document).ready(function() {


    socket.emit('get_all_comments', $('#movie_id').val());

    socket.on('view_all_comments', function(data) {
        for (var i = 0 ; i < data.length ; i++) {
            $('<div class="comments comments-'+data[i].comment.id+'">').appendTo("#comment-container");
            $('<p class="p-comments-'+data[i].comment.id+'">').appendTo(".comments-"+data[i].comment.id);
            $('<a href="/user/'+data[i].user.id+'"></a>').append(data[i].user.login+ ' : ').appendTo(".p-comments-"+data[i].comment.id);
            $('<span>').append(data[i].comment.content).appendTo(".p-comments-"+data[i].comment.id);
        }
    });

    $('#send_comment').submit(function(e){
        e.preventDefault();
        if ($('#comment').val() !== '') {
            var data = {
                id_movie : $('#movie_id').val(),
                id_user  : $('#user_id').val(),
                content  : $('#comment').val() 
            }
            $('#comment').val('')
            socket.emit('send_comment', data);
        }
    });

    socket.on('view_comment', function(data) {
        $('<div class="comments comments-'+data.comment.id+'">').appendTo("#comment-container");
        $('<p class="p-comments-'+data.comment.id+'">').appendTo(".comments-"+data.comment.id);
        $('<a href="/user/'+data.user.id+'"></a>').append(data.user.login+ ' : ').appendTo(".p-comments-"+data.comment.id);
        $('<span>').append(data.comment.content).appendTo(".p-comments-"+data.comment.id);
        $('html,body').animate({
            scrollTop: $(document).height()-$(window).height()
        }, 250);
    });

});
