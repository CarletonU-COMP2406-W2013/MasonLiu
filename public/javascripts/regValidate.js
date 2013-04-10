
(function($,W,D) {
	
	var page = {};
	
	page.util = {
		setupFormValidation: function() {
			// form validation rules
			$("#registerForm").validate({
				 onfocusout: function(element) {
					$(element).valid();
				},
				rules: {
					username: {
						required: true,
						minlength: 6
					},
					password: {
						required: true,
						minlength: 6
					},
					passconf: {
						required: true,
						minlength: 6
					}
				},
				messages: {
					username: {
						required: "Please enter a username",
						minlength: "Your username must be at least 6 characters"
					},
					password: {
						required: "Please enter a password",
						minlength: "Your password must be at least 6 characters"
					},
					passconf: {
						required: "Please confirm your password",
						minlength: "Your password must be at least 6 characters"
					}
				},
				submitHandler: function(form) {
					form.submit();
				}
			});
		}		
	}
	
	 // when the dom has loaded setup form validation rules
    $(D).ready(function($) {
        page.util.setupFormValidation();
    });	

})(jQuery, window, document);