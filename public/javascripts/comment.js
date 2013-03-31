

$(function(){
        
		
        //var commentBtn = $(".comment-btn:eq");
		var form = $("#form1");
        
		$("1").click(function(){
			 form.attr("action","/comment/1/");
			 form.submit();
		});
		/*
        commentForm.on("submit",function(){
            
            //build up an object to submit
            var pic_id = commentBtn.val();
            
            //POST to the server
            $.ajax({				
                url: "/comment/" + pic_id + "/",
                type: "POST",
                error:function(){
                    //oh no! Something went wrong!
                }
            });
                        
            return false;
        });
        */
});