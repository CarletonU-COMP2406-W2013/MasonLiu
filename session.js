
/* NOTE *** THIS FILE NOT CURRENTLY IN USE */

function login(req, username){    
    req.session.username = username;
}

function logout(req){
    //manually delete this session
    req.session.destroy(function(err){
        if(err){
            console.log("Error: %s", err);
        }
    });
}



/*

function isAuthenticated(req, res, next){
    //if there's a username associated with this session, continue the request
    if(req.session.username){
        return next();
    }else{
        //Otherwise, redirect
        res.redirect("/?error=Not Logged In");
    }
    
}


exports.isAuthenticated = isAuthenticated;
*/

exports.login = login;
exports.logout = logout;