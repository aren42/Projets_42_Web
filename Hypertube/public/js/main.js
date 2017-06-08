function create_message(message, type) {
  // TYPE = 1 -> SUCESS 
  // TYPE = 2 -> ALERT 
  var div = document.createElement('div')
  var container = document.getElementById('message')
  if (type == 1) {
    div.className = "alert alert-success one_notif"
  }
  else if (type == 2) {
    div.className = "alert alert-danger one_notif"
  }
  div.onclick = function() {
    this.style.display = "none"
  }
  div.append(message)
  container.append(div)
  $(".one_notif").delay(1500).fadeOut(1500, function() { $(this).remove(); });
}

$(document).ready(function() {
	// Checker Connexion
	$("#login_btn").click(function (event) {
			var mail = $('#email_login').val();
			var pwd = $('#password_login').val();

			if (mail.length == 0 || pwd.length == 0)
			{
				create_message("You must fill in all fields.", 2)
				event.preventDefault();
			}
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
			{
				create_message("Invalid email address.", 2)
				event.preventDefault();
			}
	});

	// Checker Oublie mot de passe
	$("#forgot_btn").click(function (event) {
			var mail = $('#email_forgot').val();
			
			if (mail.length == 0)
			{
				create_message("You must fill in all fields.", 2)
				event.preventDefault();
			}
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
			{
				create_message("Invalid email address.", 2)
				event.preventDefault();
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
			{
				create_message("You must fill in all fields.", 2)
				event.preventDefault();
			}
			else if (pwd !== pwdConfirm)
			{
				create_message("Passwords don't match !", 2)
				event.preventDefault();
			}
			else if (!mail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
			{
				create_message("Invalid email address", 2)
				event.preventDefault();
			}
	});
});
