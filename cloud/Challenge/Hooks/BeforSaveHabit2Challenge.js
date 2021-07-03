const functionTools = require('../../functions.js');

Parse.Cloud.beforeSave('Habit2Challenge', async (req, res) => {

    const user = req.user
    if(!user){
        throw 'Please log in to create a new Habit2Challenge'
    }
    else {
        await functionTools.userHasRole(user.id, 'adminRole') // ex: check if user has "adminRole"
          .then(function(hasRole){
                if(hasRole){
                    console.log("User has admin role. Creating new Habit2Challenge")
                    const acl = getHabit2ChallengeACL(req.user)
                    req.object.setACL(acl);
                } else {
                    throw "You have no permissions to create new Habit2Challenge"
                }
            },
            function(error){
                throw error
            });
    }
});

function getHabit2ChallengeACL(user) {
    const acl = new Parse.ACL();
    acl.setWriteAccess(user, false);
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;
}