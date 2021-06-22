const functionTools = require('../functions.js');

Parse.Cloud.beforeSave('Habit', async (req, res) => {
    const user = req.user
    if(!user){
        throw 'Нужно авторизоваться для создания новой привычки'
    }
    else {
        await functionTools.userHasRole(user.id, 'adminRole') // ex: check if user has "super" role
          .then(function(hasRole){
                if(hasRole){

                } else {
                    throw "У Вас нет прав на создание новой привычки"
                }
            },
            function(error){
              throw error
            });
    }
});

