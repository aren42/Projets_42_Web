function create_movie(data) {
  var div = document.createElement('div');
  div.className = "col-sm-12 col-md-6 miniaturize";
  var div2 = document.createElement('div');
  div2.className = "col-sm-6";
  var thumb = document.createElement('a');
  thumb.href = "movie/"+data.id
  thumb.className = "thumbnail movie-tile";
  var div3 = document.createElement('a');
  div3.href = "movie/"+data.id
  div3.className = "col-sm-6 caption-wrapper";
  var div4 = document.createElement('div');
  div4.className = "caption";
  div4.style = "color: white;"
  var img = new Image();
  img.src = data.imdb ? data.imdb.poster : data.large_cover_image;
  img.alt = data.title
  // thumb.prepend($('<img>',{src: data.large_cover_image}))
  thumb.prepend(img)

  var container = document.getElementById('list_movies')
  // container.insertBefore(div, container.firstChild);
  div2.prepend(thumb)
  var btn = document.createElement('a')
  btn.className = "btn prim_button_min"
  btn.role = "button"
  btn.href = "movie/"+data.id
  btn.append("More")
  var p = document.createElement('p')
  p.append(btn)
  div2.append(p)
  div.prepend(div2)
  div4.innerHTML = "<h3>"+data.title+"</h3>\
	<h4>Year : "+data.year+"</h4>\
    <h4>Rating : "+data.rating+"</h4>";
  div4.innerHTML += data.seen == 1 ?  '<h6 style="color:#bb9e9e">Allready see</h6>' : '';
  div3.append(div4);
  div.append(div3)
  container.append(div);
  // container.appendChild(div);
  // $('<p class="" >').append()
}

// var kind = document.getElementById('select_kind')
// kind.onchange = function() {
//   console.log('hoho')
//   console.log(this)
// }

function update_list(argument) {
  if (argument.name == "order") {
    data.order_by = argument.value
    data.page = 1
    document.getElementById('list_movies').innerHTML = ""
    socket.emit('get_page', data)
  }
  else if (argument.name == "sortBy") {
    data.sort = argument.value
    data.page = 1
    document.getElementById('list_movies').innerHTML = ""
    socket.emit('get_page', data)
  }
  else if (argument.name == "browsers") {
    data.genre = argument.value
    data.page = 1
    // console.log(data)
    document.getElementById('list_movies').innerHTML = ""
    socket.emit('get_page', data)
  }
  else if (argument.name == "submit") {
    // console.log("hoh", document.getElementById("search_input").value)
    // console.log("WTF")
    data.query = document.getElementById("search_input").value;
    data.page = 1
    document.getElementById('list_movies').innerHTML = ""
    socket.emit('get_page', data)
  }  
}

function update_list2(argument) {
  // console.log("form", argument)
  data.page = 1
  document.getElementById('list_movies').innerHTML = ""
  socket.emit('get_page', data)
}

var data = {
	sort: 'download_count',
	order_by: 'desc',
	limit:10,
	page: 1,
  id_user: document.getElementById('ID_user').value
}

document.addEventListener('scroll', function (event) {
    if (document.body.scrollHeight == 
        document.body.scrollTop +        
        window.innerHeight) {
        data.page = data.page + 1;
        socket.emit('get_page', data)
    }
});

socket.emit('get_page', data)
socket.on('send_page', function(entity) {
	for (var i = 0; i < entity.length; i++) {
		create_movie(entity[i]);
	}
})
