
(function($,W,D) {

	$(function(){
		var $form = $("#track-form");
		$("#trackUser").on("click",function(){		
			$form.attr("action","/trackUser");
			$form.submit();
		});
		$("#trackCat").on("click",function(){
			$form.attr("action","/trackCat");
			$form.submit();
		});
	});

})(jQuery, window, document);