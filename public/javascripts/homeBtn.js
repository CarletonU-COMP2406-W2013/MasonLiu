$(function(){
	$("#homeBtnUpload").on("click",function(){
		var $form = $("form");
		$form.attr("action","/upload");
		$form.submit();
	});
	$("#homeBtnMyUploads").on("click",function(){
		var $form = $("form");
		$form.attr("action","/myUploads");
		$form.submit();
	});
	$("#homeBtnLogout").on("click",function(){
		var $form = $("form");
		$form.attr("action","/logout");
		$form.submit();
	});
	$("#homeBtnViewer").on("click",function(){
		var $form = $("form");
		$form.attr("action","/viewer");
		$form.submit();
	});
	$("#homeBtnViewer2").on("click",function(){
		var $form = $("form");
		$form.attr("action","/viewer2");
		$form.submit();
	});
});
