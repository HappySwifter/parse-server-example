const habitTools = require('./Habit/Habit.js');



Parse.Cloud.define('likeHabit', async req => {
    console.time("Parse.Cloud -> likeHabit")
    const habit = req.params.habit;


    console.log('-->> req.user: ', req.user);
    console.log('-->> req.habit: ', habit);

    const query = new Parse.Query('Checklist');
    query.equalTo('user', req.user);
    query.equalTo('habit', habit);
    query.limit(1);
    const count = await query.count({ useMasterKey: true });
    if (count > 0) {
        throw 'Вы уже лайкнули эту привычку';
    }

    const Checklist = Parse.Object.extend('Checklist');
    const checklist = new Checklist();

    const acl = new Parse.ACL();
    acl.setReadAccess(req.user, true);
    acl.setWriteAccess(req.user, true);
    acl.publicRead = false;
    acl.publicWrite = false;
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    checklist.setACL(acl);

    await checklist.save({
        user: req.user,
        habit: habit,
        frequency: req.params.frequency,
    }).then(() => {
        console.log('-->> Like saved');
    }, (error) => {
        throw error;
    });
    const habitQuery = habitTools.constructHabitQuery(req.params.habit.objectId)
    const habits = await habitTools.getHabitsForUser(req.user.id, habitQuery)
    console.timeEnd("Parse.Cloud -> likeHabit")
    return habits[0]

}, {
    fields: {
          habit: {
              required: true
          },
          frequency: {
              required: true,
              type: Number,
              options: val => {
                  return val > 0
              },
              error: "Frequency must be not less than one day"
          },
    },
    requireUser: true
  }
);




Parse.Cloud.define('dislikeHabit', async req => {
    console.time("Parse.Cloud -> dislikeHabit")
    const habit = req.params.habit;
    const query = new Parse.Query('Checklist');
    query.equalTo('user', req.user);
    query.equalTo('habit', habit);
    query.limit(1);
    const result = await query.first({ useMasterKey: true });
    console.log('-->> удаляем привычку из избранного: ', result);
    await result.destroy({ useMasterKey: true }).then((checklist) => {
        req.log.info('-->> Like deleted');
    }, (error) => {
        console.log('Failed to delete object, with error code: ' + error.message);
        console.timeEnd("Parse.Cloud -> dislikeHabit")
        throw error;
    });
    const habitQuery = habitTools.constructHabitQuery(req.params.habit.objectId)
    const habits = await habitTools.getHabitsForUser(req.user.id, habitQuery)
    console.timeEnd("Parse.Cloud -> dislikeHabit")
    return habits[0]
}, {
    fields: {
        habit: {
            required: true,
        },
    },
    requireUser: true
});


