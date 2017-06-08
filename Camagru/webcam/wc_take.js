document.addEventListener("DOMContentLoaded", function ()  {

	var streaming = false,
video        = document.querySelector('#video'),
canvas       = document.querySelector('#canvas'),
snap         = document.querySelector('#snap'),
photo        = document.querySelector('#photo'),
submit       = document.querySelector('#submit'),
filtre       = document.querySelector('#filtre'),
width = 400,
height = 0;

navigator.getMedia = ( navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia);

navigator.getMedia(
	{
		video: true,
	audio: false
	},
	function(stream) {
		if (navigator.mozGetUserMedia) {
			video.mozSrcObject = stream;
		} else {
			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL.createObjectURL(stream);
		}
		video.play();
	},
	function(err) {
		console.log("An error occured! " + err);
	}
	);

video.addEventListener('canplay', function(ev){
	if (!streaming) {
		height = video.videoHeight / (video.videoWidth/width);
		video.setAttribute('width', width);
		video.setAttribute('height', height);
		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);
		streaming = true;
	}
}, false);



function takepicture() {
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d').drawImage(video, 0, 0, width, height);
	var data = canvas.toDataURL('image/jpeg');
	canvas.setAttribute('value', data);
	photo.setAttribute('value', data);
	submit.setAttribute('type', 'submit');
	filtre.setAttribute('style', 'z-index:0;height:300px;');
}

snap.addEventListener('click', function(ev){
	if (!this.classList.contains('disabled')){
		ev.preventDefault();
		takepicture();    
	}
}, false);
});
