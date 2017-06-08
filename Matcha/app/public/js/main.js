/*
** MAIN TOOLS ET AFFICHAGES **
*/

var map;
var image_upload = null;
var socket = io();
var chat_users = {};
var state_user_list = Cookies.get('user_list');

if (state_user_list == "false") {
	$('.chat_body').slideToggle(0);
}

// Nouveau message
socket.on('nouveau_msg', function(data) {
	$('#audio-notif').trigger('play');
	if (!$('#' + data.chat).is('div')) {
		// Check l'historique de la conversation
		socket.emit('get_previous_msg', { 'id': data.chat });
		
		// Ouvre la boite de dialogue
		var html = '<div id=' + data.chat + ' class="msg_box">';
		html+= '<div class="msg_head">' + data.user.escape() + '<i style="float: right;" class="material-icons">close</i></div>';
		html += '<div class="msg_wrap"><div class="msg_body"></div>';
		html += '<div class="msg_footer"><textarea class="msg_input" rows="4"></textarea></div></div>';
		$('.chat_box').before(html);
		
		// Touche entrée pour envoyer message
		$('.msg_input').keypress(function(event) {
			// 13 touche clavier pour Enter
			if (event.keyCode != 13) return ;
				 
			event.preventDefault();
			var msg = $(this).val();
			$(this).val('');
			if(msg != '') {
				// Envoi du message
				var chatID = $($(this).parent().parent().parent()).attr('id');
				
				socket.emit('nouveau_msg', {
					'chat': chatID,
					'msg': msg
				});
				
				// Add message
				$($(this).parent().parent().children()[0]).append('<div class="msg_b">'+ msg.escape() +'</div>');
				// Defilement vers le bas
				$($(this).parent().parent().children()[0]).scrollTop($($(this).parent().parent().children()[0])[0].scrollHeight);
			}
		});
		// Fermer la fenêtre
		$('.msg_head').click(function(event){
			$(this).parent().remove();
		});
	} else {
		var body = $('#' + data.chat + ' > .msg_wrap').children()[0];
		// Add message
		$(body).append('<div class="msg_a">'+ data.msg.escape() +'</div>');
		// Defilement vers le bas
		$(body).scrollTop($(body)[0].scrollHeight);
	}
});

//  Notifications
socket.on('alerts', function(data) {
	$('#alert_nbr').html(data.nbr);
});

//  Nouvelles Notifications
socket.on('new_alerts', function(data) {
	var current = parseInt($('#alert_nbr').html());
	$('#alert_nbr').html(current + 1 + "");
});

// Historique des anciens messages
socket.on('get_previous_msg', function(data) {
	if (!$('#' + data.chat).is('div')) return ;
	
	var body = $('#' + data.chat + ' > .msg_wrap').children()[0];
	for (var i = 0; i < data.msgs.length; i++) {
		if (data.msgs[i].user === data.user)
			$(body).prepend('<div class="msg_b">'+ data.msgs[i].msg.escape() +'</div>');
		else 
			$(body).prepend('<div class="msg_a">'+ data.msgs[i].msg.escape() +'</div>');
	}
	$(body).scrollTop($(body)[0].scrollHeight);
});

// Fonction qui convertit les balises html (htmlspecialchars en php)
String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

// Liste des utilisateurs
socket.on('user_list', function (data) {
	for(var i = 0; i < data.length; i++) {
		chat_users[data[i].id] = data[i];
		var state = data[i].last_visit == "0000-00-00 00:00:00" ? "online" : "offline";
		$('.chat_body').append('<div chatID="' + data[i].id + '"class="user_' + state +' chat_click">' + data[i].firstname.escape() + ' ' + data[i].lastname.escape() + ' </div>');
	}
	
	$('.chat_click').click(function (event) {
		var id = $(this).attr('chatID');
		// Si la boite de dialogue est fermé
		if (!$('#' + id).is('div')) {
			// Check si y a un historique
			socket.emit('get_previous_msg', { 'id': id });
			
			// Ouvre la boite de dialogue
			var html = '<div id=' + id + ' class="msg_box">';
			html+= '<div class="msg_head">' + event.target.innerHTML + '<i style="float: right;" class="material-icons">close</i></div>';
			html += '<div class="msg_wrap"><div class="msg_body"></div>';
			html += '<div class="msg_footer"><textarea class="msg_input" rows="4"></textarea></div></div>';
			$('.chat_box').before(html);
			
			// Touche entrée pour envoyer message
			$('.msg_input').keypress(function(event) {
				// 13 touche clavier pour Enter
				if (event.keyCode != 13) return ;
				 
				event.preventDefault();
				var msg = $(this).val();
				$(this).val('');
				if(msg != '') {
					// Envoi du message
					var chatID = $($(this).parent().parent().parent()).attr('id');
					
					socket.emit('nouveau_msg', {
						'chat': chatID,
						'msg': msg
					});
					
					// Add html
					$($(this).parent().parent().children()[0]).append('<div class="msg_b">'+ msg.escape() +'</div>');
					// Defilement vers le bas
					$($(this).parent().parent().children()[0]).scrollTop($($(this).parent().parent().children()[0])[0].scrollHeight);
				}
			});
			// Fermer la fenêtre
			$('.msg_head').click(function(event){
				$(this).parent().remove();
			});
		}
	})
});


// Fonction pour effacer un tableau
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

$(document).ready(function(){
	
	// Initialise JQuery Widgets
	$('.button-collapse').sideNav();
	$('.parallax').parallax();
	
	// Checker Connexion
	$("#login_btn").click(function (event) {
			var mail = $('#email_login').val();
			var pwd = $('#password_login').val();
			
			if (mail.length == 0 || pwd.length ==0) 
				Materialize.toast("Vous devez remplir tous les champs.", 3000, 'red lighten-1');
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
				Materialize.toast("Adresse mail invalide", 3000, 'red lighten-1');
			else if (!pwd.match(/^[a-zA-Z0-9!@#$%^&*]{8,30}$/)) 
				Materialize.toast("Mot de passe de 8 caractères minimum (max 30 !).", 3000, 'red lighten-1');
			else {
				// Bar de progression
				$('#progress_login').show();
				
				$.post("/auth/signin", { mail: mail, pwd: pwd})
				.done(function(data) {
					Materialize.toast("Vous êtes maintenant connecté !", 2500, 'indigo lighten-1');
					$('#progress_login').hide();
					setTimeout(function() {
						location.reload(true);
					}, 1000);
					
				})
				.fail(function( error ) {
					if (error.status == 404)
						Materialize.toast("Adresse mail et mot de passe incompatibles.", 3000, 'red lighten-1');
					else
						Materialize.toast("Erreur " + error.status + " " + error.responseText, 3000, 'red lighten-1');
					$('#progress_login').hide();
				});
			}
			event.preventDefault();
	});
	
	// Checker Oublie mot de passe
	$("#forgot_btn").click(function (event) {
			var mail = $('#email_forgot').val();
			
			if (mail.length == 0) 
				Materialize.toast("Vous devez remplir tous les champs.", 3000, 'red lighten-1');
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
				Materialize.toast("Adresse mail invalide", 3000, 'red lighten-1');
			else {
				
				$.post("/auth/reset", { mail: mail })
				.done(function(data) {
					Materialize.toast("Un mail a bien été envoyé pour réinitialiser votre mot de passe.", 2500, 'indigo lighten-1');
				})
				.fail(function( error ) {
					if (error.status == 404)
						Materialize.toast("Adresse mail inconnue.", 3000, 'red lighten-1');
					else
						Materialize.toast("Erreur " + error.status + " " + error.responseText, 3000, 'red lighten-1');
				});
			}
			event.preventDefault();
	});
	
	// Checker Inscription
	$("#submit_signup").click(function (event) {
			var mail = $('#email_signup').val();
			var pwd = $('#password_signup').val();
			var pwdConfirm = $('#passwordConfirm_signup').val();
			var username = $('#username_signup').val();
			var firstname = $('#firstname_signup').val();
			var lastname = $('#lastname_signup').val();
			
			if (mail.length == 0 || pwd.length ==0 || pwdConfirm == 0 || username == 0 || firstname == 0 || lastname == 0) 
				Materialize.toast("Vous devez remplir tous les champs.", 3000, 'red lighten-1');
			else if (pwd !== pwdConfirm) 
				Materialize.toast("Les mots de passe ne correspondent pas !", 3000, 'red lighten-1');
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
				Materialize.toast("Adresse mail invalide.", 3000, 'red lighten-1');
			else if (!pwd.match(/^[a-zA-Z0-9!@#$%^&*]{8,30}$/)) 
				Materialize.toast("Mot de passe de 8 caractères minimum (max 30 !).", 3000, 'red lighten-1');
			else {
				// Bar de progression
				$('#progress_signup').show();
				
				$.post("/auth/signup", { 'mail': mail, 'pwd': pwd, 'username': username, 'firstname': firstname, 'lastname': lastname})
				.done(function(data) {
					Materialize.toast("Bienvenue parmi nous !", 3000, 'indigo lighten-1');
					document.location.href="/";
					$('#progress_signup').hide();
					
				})
				.fail(function( error ) {
					if (error.status == 404)
						Materialize.toast("Adresse mail inconnue.", 3000, 'red lighten-1');
					else
						Materialize.toast("Erreur " + error.status + " " + error.responseText, 3000, 'red lighten-1');
					$('#progress_signup').hide();
				});
			}
			event.preventDefault();
	});


	/* MODIFICATIONS SUR LE PROFIL DE L'UTILISATEUR  */

	// Checker Sexe
    $('#gender_profile').material_select();
	$( "#gender_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#gender_profile" ).find(":selected").text();
		// Si pas de sexe choisi
		if (selected === "Choose") {
			Materialize.toast("You need to choose MEN or WOMEN to update your gender.", 3000, 'red lighten-1');
		}
		// Sinon change de sexe
		else {
			$.post("/me/update", { 'type': "gender", 'data': selected}).done(function(data) {
				Materialize.toast("Votre profil a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
	// Checker Adresse mail
	$( "#email_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#email_profile" ).val();
		// Si info invalide
		if (selected.length == 0 || !selected.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
			Materialize.toast("Adresse mail invalide", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "mail", 'data': selected}).done(function(data) {
				Materialize.toast("Votre profil a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});

	// Checker Pseudo
	$( "#username_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#username_profile" ).val();
		// Si info invalide
		if (selected.length == 0) {
			Materialize.toast("Pseudo invalide.", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "username", 'data': selected}).done(function(data) {
				Materialize.toast("Votre pseudo a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});

	// Checker Prénom
	$( "#firstname_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#firstname_profile" ).val();
		// Si info invalide
		if (selected.length == 0) {
			Materialize.toast("Prénom invalide", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "firstname", 'data': selected}).done(function(data) {
				Materialize.toast("Votre prénom a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
	// Checker Nom
	$( "#lastname_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#lastname_profile" ).val();
		// Si info invalide
		if (selected.length == 0) {
			Materialize.toast("Nom invalide.", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "lastname", 'data': selected}).done(function(data) {
				Materialize.toast("Votre nom a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
	// Checker Orientation
	$('#orientation_profile').material_select();
	$( "#orientation_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#orientation_profile" ).find(":selected").text();
		
		$.post("/me/update", { 'type': "orientation", 'data': selected}).done(function(data) {
			Materialize.toast("Votre orientation a bien été mis à jour.", 2000, 'indigo lighten-1');
		}).fail(function( error ) {
			Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		});
	});
	
	// Checker Tags
	$("#add_tags").click(function (event) {
		$('#add_tags_modal').openModal();
	});
	// Add Nouveau Tag
	$("#submit_new_tags").click(function (event) {
		var value = $("#new_tag").val();
		
		if (value.length <= 1 || value.length > 30) {
			Materialize.toast("Le tag doit être compris entre 2 et 30 caractères.", 2000, 'red lighten-1');
		} else if (value.indexOf(' ') != -1) {
			Materialize.toast("Pas d'espace !", 2000, 'red lighten-1');
		} else {
			$('#progress_new_tag').show();
			$.post("/me/tag/add", { 'tag': value }).done(function(data) {
				Materialize.toast("Tag ajouté !", 2000, 'indigo lighten-1');
				$('#progress_new_tag').hide();
				setTimeout(function() {
					location.reload(true);
				}, 1000);
			}).fail(function( error ) {
				if (error.status == 409)
					Materialize.toast("Vous avez déjà ce tag.", 2000, 'red lighten-1');
				else
					Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
				$('#progress_new_tag').hide();
			});
		}
		event.preventDefault();
	});
	
	// Checker Biographie
	$( "#bio_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#bio_profile" ).val();
		// Si info invalide
		if (selected.length > 250) {
			Materialize.toast("Votre biographie ne peut pas dépasser 250 caractères.", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "bio", 'data': selected }).done(function(data) {
				Materialize.toast("Votre biographie a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
	// Checker Age
	$( "#age_profile" ).change(function() {
		// Récupère l'information
		var selected = $( "#age_profile" ).val();
		// Si info invalide
		if (selected < 18 || selected > 100) {
			Materialize.toast("Vous devez avoir au moins 18 ans.", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
			$.post("/me/update", { 'type': "age", 'data': selected }).done(function(data) {
				Materialize.toast("Votre âge a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
	// Checker Mot de passe
	$( "#password_profile" ).change(function() {
		// Récupère l'information
		var oldpwd = $( "#oldpassword_profile" ).val();
		var newpwd = $( "#password_profile" ).val();
		// Si info invalide
		if (oldpwd.length == 0 || newpwd == 0) {
			Materialize.toast("Si vous souhaitez modifier votre mot de passe, mettez l'ancien et le nouveau dans leurs entrées respectives.", 3000, 'red lighten-1');
		}
		else if (!newpwd.match(/^[a-zA-Z0-9!@#$%^&*]{8,30}$/)) 
			Materialize.toast("Mot de passe de 8 caractères minimum (max 30 !).", 3000, 'red lighten-1');
		// Sinon change info
		else {
			$.post("/auth/changepwd", { 'old': oldpwd, 'pwd': newpwd }).done(function(data) {
				Materialize.toast("Votre mot de passe a bien été mis à jour.", 2000, 'indigo lighten-1');
			}).fail(function( error ) {
				if (error.status == 404) 
					Materialize.toast("Ancien mot de passe incorrect.", 2000, 'red lighten-1');
				 else
					Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
	});
	
    // Checker Localisation
	$( "#update_loc" ).click(function() {
		GMaps.geolocate({
			success: function(position) {
				map.setCenter(position.coords.latitude, position.coords.longitude);
				$.post("/me/update", { 'type': "location", "data": position.coords.latitude + "," + position.coords.longitude }).done(function(data) {
					Materialize.toast("Votre localisation a bien été mis à jour.", 2000, 'indigo lighten-1');
				});
			},
			error: function(error){
				$.post("/me/update", { 'type': "location", "data": "refused" }).done(function(data) {});
			}
		});
	});
    
    // Checker Image
	// Check l'image avant de upload en base 64
    $( "#image_input" ).change(function(event) {
        var file = event.target.files[0];
		var reader = new FileReader();
		reader.addEventListener("load", function (event) {
			console.log(reader.result.length);
			if (reader.result.length > 5)
				image_upload = reader.result;
			else if (reader.result.length <= 5)
				image_upload = 2;
		});
		if (image_upload != 1 && image_upload != 2)
			reader.readAsDataURL(file);
    });
    // Add nouvelle image
	$( "#submit_new_image" ).click(function(event) {
		// Si info invalide
		if (image_upload == null) {
			Materialize.toast("Vous devez choisir une image.", 3000, 'red lighten-1');
		}
		else if (image_upload == 2) {
			Materialize.toast("Image incorrecte.", 3000, 'red lighten-1');
		}
		// Sinon change info
		else {
            $.ajax({
               url:  "/me/image/add",
               type: "PUT",
               data: { 'img': image_upload }
            }).done(function(data) {
				Materialize.toast("Votre image a bien été upload !", 2000, 'indigo lighten-1');
			    setTimeout(function() {
					location.reload(true);
				}, 1000);
            }).fail(function( error ) {
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			});
		}
        event.preventDefault();
	});

	
	/* MODIFICATIONS SUR LE PROFIL D'UN USER À USER'  */

	// Checker Signaler
    $('#report_cause').material_select();
    $('#send_report').click(function(event) {
		event.preventDefault();
		var cause = $("#report_cause").val();
		// Récupère id user via l'url
		var path = window.location.pathname.split('/').clean('');
		var user = path[path.length - 1];
		 $.post("/profil/signaler", { 'id': user, 'reason': cause } ).done(function(data) {
			Materialize.toast("L'utilisateur a bien été signalé, merci.", 2000, 'indigo lighten-1');
			setTimeout(function() {
					$('#report_modal').closeModal();
			}, 1000);
		}).fail(function( error ) {
			if (error.status == 404) 
				Materialize.toast("Utilisateur inconnu.", 2000, 'red lighten-1');
			else if (error.status == 400) 
				Materialize.toast("Vous ne pouvez pas vous signaler vous même !", 2000, 'red lighten-1');
			else 
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			setTimeout(function() {
					$('#report_modal').closeModal();
			}, 1000);
		});
	});
	
	// Checker Bloquer
	$('#block_user').click(function() {
		// Récupère id user via l'url
		var path = window.location.pathname.split('/').clean('');
		var user = path[path.length - 1];
		$.post("/profil/bloquer", { 'id': user } ).done(function(data) {
			Materialize.toast("Utilisateur bloqué !", 2000, 'indigo lighten-1');
			setTimeout(function() {
				location.reload(true);
			}, 1000);
		}).fail(function( error ) {
			if (error.status == 400) 
				Materialize.toast("Vous ne pouvez pas vous bloquer vous même !", 2000, 'red lighten-1');
			else 
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		});
	});
	
	// Checker Like
	$('#match_user').click(function() {
		// Récupère id user via l'url
		var path = window.location.pathname.split('/').clean('');
		var user = path[path.length - 1];
		
		$.post("/profil/like", { 'id': user } ).done(function(data) {
			Materialize.toast("Done", 2000, 'indigo lighten-1');
			setTimeout(function() {
				location.reload(true);
			}, 1000);
		}).fail(function( error ) {
			if (error.status == 400) 
				Materialize.toast("Vous ne pouvez pas vous liker vous même !", 2000, 'red lighten-1');
			else 
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		});
	});
	
	// Checker Chat
	$('.chat_head').click(function(){
		$('.chat_body').slideToggle('slow');
		if (state_user_list === "true")
			state_user_list = "false";
		else
			state_user_list = "true";
		Cookies.set('user_list', state_user_list), { expires: 7 };
	});


	/* TOOLS PAGE RECHERCHE  */

	$('#select_tags').material_select();
	// Bar de recherche
	$("#search_user").change(function(event) {
		event.preventDefault();
		search_user();
	});
	$("#select_tags").change(function(event) {
		event.preventDefault();
		search_user();
	});
	
	var age_slider = document.getElementById('age_interval');
	var distance_slider = document.getElementById('distance_interval');
	var score_slider = document.getElementById('score_interval');
	
	if ($('#distance_interval').is('div')) {
		noUiSlider.create(distance_slider, {
			start: [0, 50],
			connect: true,
			step: 10,
			range: {
				'min': 0,
				'max': 100
			},
			format: wNumb({
				decimals: 0
			})
      });
		distance_slider.noUiSlider.on('change', function () {
			search_user();
		});
	}
	if ($('#score_interval').is('div')) {
		noUiSlider.create(score_slider, {
			start: [0, 1000],
			connect: true,
			step: 1,
			range: {
				'min': 0,
				'max': 1000
			},
			format: wNumb({
				decimals: 0
			})
      	});
		score_slider.noUiSlider.on('change', function () {
			search_user();
		});
	}
	if ($('#age_interval').is('div')) {
		noUiSlider.create(age_slider, {
			start: [18, 100],
			connect: true,
			step: 1,
			range: {
				'min': 18,
				'max': 100
			},
			format: wNumb({
				decimals: 0
			})
		});
		age_slider.noUiSlider.on('change', function () {
			search_user();
		});
		
		$("#order_by").material_select();
		$("#order_by").change(function () {
			search_user();
		});
	}
	
	function search_user() {
		var name = $("#search_user").val() || "";
		var age_min = age_slider.noUiSlider.get()[0];
		var age_max = age_slider.noUiSlider.get()[1];
		var distance_min = distance_slider.noUiSlider.get()[0];
		var distance_max = distance_slider.noUiSlider.get()[1];
		var score_min = score_slider.noUiSlider.get()[0];
		var score_max = score_slider.noUiSlider.get()[1];
		var order_by = $("#order_by").val();
		var tmp = $("#select_tags").val();
		var nb_tags = [];
		for(var i = 0; i < tmp.length; i++) {
			nb_tags.push($( "option[value='" + tmp[i] + "']" ).attr('id'));
		}
		// Reset
		$('#collection_search').hide();
		$("#collection_search").empty();
			
		$('#progress_search_user').show();
		$.post("/search", { 'name': name, 'age_min': age_min, 'age_max': age_max,
				'distance_min': distance_min, 'distance_max': distance_max, 'nb_tags': nb_tags, 
				'score_min': score_min, 'score_max': score_max, 'order_by': order_by} ).done(function(data) {
			$('#collection_search').show();
			for(var i = 0; i < data.length; i++) {
				if (data[i].picture == undefined || data[i].picture.length == 0) {
					data[i].picture = "/img/avatar_default.png";
				}	
				$('<a href="/profil/' + data[i].id.escape() + '" class="cardi"><img src="' + data[i].picture + '"><div class="containu"><div class="textu">' + data[i].firstname.escape() + ' ' + data[i].lastname.escape() + '</div></div></a>').appendTo("#collection_search");
			}
			$('#progress_search_user').hide();
		}).fail(function( error ) {
			if (error.status == 404) 
				Materialize.toast("Aucun utilisateur n'a été trouvé.", 2000, 'red lighten-1');
			else 
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			$('#progress_search_user').hide();
			$('#collection_search').hide();
		});
		event.preventDefault();
	}
	

	/* TOOLS PAGE SUGGESTION  */

	$('#select_tags_suggest').material_select();
	$("#select_tags_suggest").change(function(event) {
		event.preventDefault();
		suggest_user();
	});
	
	var age_slider_sugest = document.getElementById('age_interval_suggest');
	var distance_slider_sugest = document.getElementById('distance_interval_suggest');
	var score_slider_sugest = document.getElementById('score_interval_suggest');
	
	if ($('#distance_interval_suggest').is('div')) {
		noUiSlider.create(distance_slider_sugest, {
			start: [0, 100],
			connect: true,
			step: 10,
			range: {
				'min': 0,
				'max': 100
			},
			format: wNumb({
				decimals: 0
			})
      });
		distance_slider_sugest.noUiSlider.on('change', function () {
			suggest_user();
		});
	}
	if ($('#score_interval_suggest').is('div')) {
		noUiSlider.create(score_slider_sugest, {
			start: [0, 1000],
			connect: true,
			step: 1,
			range: {
				'min': 0,
				'max': 1000
			},
			format: wNumb({
				decimals: 0
			})
      	});
		score_slider_sugest.noUiSlider.on('change', function () {
			suggest_user();
		});
	}
	if ($('#age_interval_suggest').is('div')) {
		noUiSlider.create(age_slider_sugest, {
			start: [18, 100],
			connect: true,
			step: 1,
			range: {
				'min': 18,
				'max': 100
			},
			format: wNumb({
				decimals: 0
			})
		});
		age_slider_sugest.noUiSlider.on('change', function () {
			suggest_user();
		});
		suggest_user();
		
		$('#order_by_suggest').material_select();
		$('#order_by_suggest').change(function () {
			suggest_user();
		})
	}
	
	function suggest_user() {
		var age_min = age_slider_sugest.noUiSlider.get()[0];
		var age_max = age_slider_sugest.noUiSlider.get()[1];
		var distance_min = distance_slider_sugest.noUiSlider.get()[0];
		var distance_max = distance_slider_sugest.noUiSlider.get()[1];
		var score_min = score_slider_sugest.noUiSlider.get()[0];
		var score_max = score_slider_sugest.noUiSlider.get()[1];
		var order_by = $("#order_by_suggest").val();
		var tmp = $("#select_tags_suggest").val();
		var interests = [];
		for(var i = 0; i < tmp.length; i++) {
			interests.push($( "option[value='" + tmp[i] + "']" ).attr('id'));
		}
		// Reset
		$('#collection_suggest').hide();
		$("#collection_suggest").empty();
			
		$('#progress_suggest').show();
		$.post("/suggest", {'age_min': age_min, 'age_max': age_max,
				'distance_min': distance_min, 'distance_max': distance_max, 'interests': interests, 
				'score_min': score_min, 'score_max': score_max, 'order_by': order_by} ).done(function(data) {
			$('#collection_suggest').show();
			for(var i = 0; i < data.length; i++) {
				if (data[i].picture == undefined || data[i].picture.length == 0) {
					data[i].picture = "/img/avatar_default.png";
				}	
				$('<a href="/profil/' + data[i].id.escape() + '" class="cardi"><img src="' + data[i].picture + '"><div class="containu"><div class="textu">' + data[i].firstname.escape() + ' ' + data[i].lastname.escape() + '</div></div></a>').appendTo("#collection_suggest");
			}
			$('#progress_suggest').hide();
		}).fail(function( error ) {
			if (error.status == 404) 
				Materialize.toast("Aucun utilisateur n'a été trouvé.", 2000, 'red lighten-1');
			else 
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			$('#progress_suggest').hide();
			$('#collection_suggest').hide();
		});
		event.preventDefault();
	}
});

$( "#map_profile" ).ready(function() {
	if (!$( "#map_profile" ).is("div"))
		return ;
	var loc = $( "#map" ).attr("loc");
	if (loc !== undefined) {
		if (loc.length == 0) {
			Materialize.toast("Cet utilisateur n'a pas défini son emplacement.", 2000, 'red lighten-1');
			map = new GMaps({
				el: '#map',
				lat: -13.162880,
				lng: -72.544963,
				zoom: 0
			});
		}
		else {
			var loc = loc.split(",");
			map = new GMaps({
				el: '#map',
				lat: loc[0],
				lng: loc[1]
			});
		}
		return ;
	}

	$.post("/me/retrieve", { "type": "location" }).done(function(data) {
		if (data.location != "refused" && data.location != undefined) {
			var loc = data.location.split(",");
			map = new GMaps({
				el: '#map',
				lat: loc[0],
				lng: loc[1]
			});
		}
		else  {
			//console.log("heu");
			map = new GMaps({
				el: '#map',
				lat: 48.8582,
				lng: 2.3387
			});
		}

	}).fail(function( error ) {
	 	map = new GMaps({
			el: '#map',
			lat: 21.309571,
			lng: -157.805293,
			zoom: 0
		});
		Materialize.toast("Veuillez accepter la demande de localisation.", 2000, 'blue lighten-1');
		GMaps.geolocate({
			success: function(position) {
				map.setCenter(position.coords.latitude, position.coords.longitude);
				$.post("/me/update", { 'type': "location", "data": position.coords.latitude + "," + position.coords.longitude }).done(function(data) {
					Materialize.toast("Votre localisation a été mis à jour avec succès.", 2000, 'pink lighten-1');
				});
			},
			error: function(error) {
				$.post("/me/update", { 'type': "location", "data": "refused" }).done(function(data) {});
			}
		});
	});
});


/* TOOLS PAGE COMPTE SUITE */

// Supprimer une photo
function delete_image(obj) {
	var id =  $( obj ).attr("img");
    var state = confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
	if (!state)
		return ;
	$.post("/me/image/delete", { 'img': id }).done(function(data) {
		Materialize.toast("Cette image a bien été supprimée !", 2000, 'indigo lighten-1');
		$( obj ).closest("li").remove();
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
	});
}

// Mettre une photo en favori
function favorite_image(obj) {
	var id =  $( obj ).attr("img");
	var state = confirm("Êtes-vous sûr de vouloir mettre cette photo en photo de profil ?");
	if (!state)
		return ;
	$.post("/me/image/favorite", { 'img': id }).done(function(data) {
		Materialize.toast("Cette photo est maintenant votre photo de profil !", 2000, 'indigo lighten-1');
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
	});
}

// Supprimer un tag
function delete_tag(obj) {
	var chip = $(obj).closest(".chip");
	var id = chip.attr("id");
	var state = confirm("Êtes-vous sûr de vouloir supprimer ce tag ?");
	if (!state)
		return ;
	$.post("/me/tag/delete", { 'tag': id }).done(function(data) {
		Materialize.toast("Le tag a bien été supprimé !", 2000, 'indigo lighten-1');
		chip.remove();
		}).fail(function( error ) {
			if (error.status == 409)
				Materialize.toast("Vous avez déjà ce tag !", 2000, 'red lighten-1');
			else
				Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
			$('#progress_new_tag').hide();
		});
}


/* LES NOTIFICATIONS */

function load_alerts() {
	// Vider
	$('#alerts_list').empty();
	$.get("/me/alert").done(function(data) {
		// Ajouter une alerte
		for(var i = 0; i < data.length; i++) {
			var active = data[i].shown === 0 ? "active" : "";
			$('#alerts_list').append('<a href="/profil/' + data[i].actor + '" id="' + data[i].id + '" class="collection-item ' + active + '">' + data[i].msg.escape() +'<span class="badge">' + data[i].date.escape() + '</span></a>');
		}	
		$('#progress_alerts').hide();
		// Notif non lu
		$('#alerts_list').children(".active").hover(function(event) {
			// Notif lu
			socket.emit('notif_lu', {
				id: $(event.target).attr('id')
			});

			if ($(event.target).hasClass('active')) {
				// Mise à jour du nombre de notifications
				var current = parseInt($('#alert_nbr').html());
				$('#alert_nbr').html((current - 1) + "");
			}
			$(event.target).removeClass("active");
		});
	}).fail(function( error ) {
		if (error.status == 401)
			Materialize.toast("bipbip", 2000, 'red lighten-1');
		else
			Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		$('#progress_alerts').hide();
	});
}


/* Liste visites profil */

function load_visits() {
	$('#progress_visits').show();
	// Récupère id user via l'url
	var path = window.location.pathname.split('/').clean('');
	var user = path[path.length - 1];
	// Vider
	$('#visits_list').empty();
	
	$.post("/profil/visiter", { id: user }).done(function(data) {
		// Ajouter information dernière connexion
		for(var i = 0; i < data.length; i++) {
			$('#visits_list').append('<a class="collection-item">' + data[i].user.escape() +'<span class="badge">' + data[i].date.escape() + '</span></a>');
		}
		$('#progress_visits').hide();
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		$('#progress_visits').hide();
	});
}


/* Liste de visites */

function list_visits() {
	$('#progress_visits').show();
	// Récupère id user via l'url
	var user = $('#id_name').attr('value');
	// Vider
	$('#visits_list').empty();
	
	$.post("/me/visiter", { id: user }).done(function(data) {
		// Ajouter information dernière connexion
		for(var i = 0; i < data.length; i++) {
			$('#visits_list').append('<a href="/profil/' + data[i].tmp + '" class="collection-item">' + data[i].user.escape() +'<span class="badge">' + data[i].date.escape() + '</span></a>');
		}
		$('#progress_visits').hide();
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		$('#progress_visits').hide();
	});
}


/* Liste des bloqués */

function list_blockeds() {
	$('#progress_blockeds').show();
	// Récupère id user via l'url
	var user = $('#id_name_b').attr('value');
	// Vider
	$('#blockeds_list').empty();
	$.post("/me/bloquer", { id: user }).done(function(data) {
		// Ajouter information dernière connexion
		for(var i = 0; i < data.length; i++) {
			$('#blockeds_list').append('<a href="/profil/' + data[i].tmp + '" class="collection-item">' + data[i].blocked.escape() + '</a>');
		}
		$('#progress_blockeds').hide();
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		$('#progress_blockeds').hide();
	});
}


/* Liste de likes */

function list_likes() {
	$('#progress_likes').show();
	// Récupère id user via l'url
	var user = $('#id_name_c').attr('value');
	// Vider
	$('#likes_list').empty();
	
	$.post("/me/like", { id: user }).done(function(data) {
		// Ajouter information dernière connexion
		for(var i = 0; i < data.length; i++) {
			$('#likes_list').append('<a href="/profil/' + data[i].tmp + '" class="collection-item">' + data[i].user.escape() +'<span class="badge">' + data[i].date.escape() + '</span></a>');
		}
		$('#progress_likes').hide();
	}).fail(function( error ) {
		Materialize.toast("Erreur " + error.status + " " + error.responseText, 2000, 'red lighten-1');
		$('#progress_likes').hide();
	});
}
