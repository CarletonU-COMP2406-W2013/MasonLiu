
(function($,W,D) {

		$(function(){
			var $form = $("form");
			$("#catBtnFunny").on("click",function(){		
				$form.attr("action","/catFunny");
				$form.submit();
			});
			$("#catBtnSports").on("click",function(){
				$form.attr("action","/catSports");
				$form.submit();
			});
			$("#catBtnNature").on("click",function(){
				$form.attr("action","/catNature");
				$form.submit();
			});
			$("#catBtnPeople").on("click",function(){
				$form.attr("action","/catPeople");
				$form.submit();
			});
			$("#catBtnArt").on("click",function(){
				$form.attr("action","/catArt");
				$form.submit();
			});
			$("#catBtnMisc").on("click",function(){
				$form.attr("action","/catMisc");
				$form.submit();
			});
	});


})(jQuery, window, document);