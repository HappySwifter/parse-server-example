const functionTools = require('../functions.js');

Parse.Cloud.beforeSave('Habit', async (req, res) => {
    const user = req.user
    if(!user){
        throw 'Нужно авторизоваться для создания новой привычки'
    }
    else {
        await functionTools.userHasRole(user.id, 'adminRole') // ex: check if user has "adminRole"
          .then(function(hasRole){
                if(hasRole){
                    const acl = getHabitACL(req.user)
                    req.object.setACL(acl);
                } else {
                    throw "У Вас нет прав на создание новой привычки"
                }
            },
            function(error){
              throw error
            });
    }
});

function getHabitACL(user) {
    const acl = new Parse.ACL();
    acl.setWriteAccess(user, false);
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;
}