const functionTools = require('../../functions.js');

Parse.Cloud.beforeSave('Challenge', async (req, res) => {

    const user = req.user
    if(!user){
        throw 'Please log in to create a new Challenge'
    }
    else {
        await functionTools.userHasRole(user.id, 'adminRole') // ex: check if user has "adminRole"
          .then(function(hasRole){
                if(hasRole){
                    console.log("User has admin role. Creating new challenge")
                    const acl = getChallengeACL(req.user)
                    req.object.setACL(acl);
                } else {
                    throw "You have no permissions to create new challenge"
                }
            },
            function(error){
                throw error
            });
    }
});

function getChallengeACL(user) {
    const acl = new Parse.ACL();
    acl.setWriteAccess(user, false);
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;
}