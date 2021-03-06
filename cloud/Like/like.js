const habitTools = require('../Habit/Habit.js');
const likeTools = require('./LikeTools.js');


Parse.Cloud.define('likeHabit', async req => {
    console.time("Parse.Cloud -> likeHabit")
    const habitId = req.params.habitId
    const user = req.user
    console.log('-->> req.user: ', user);
    console.log('-->> req.habit: ', habitId);
    // await likeTools.canLikeHabit(user, habit)
    await likeTools.createLike(habitId, user, req.params.frequency)
    const habitQuery = habitTools.constructHabitQuery(habitId)
    const habits = await habitTools.getHabitsForUser(user.id, habitQuery)
    console.timeEnd("Parse.Cloud -> likeHabit")
    return habits[0]
}, {
    fields: {
          habitId: {
              required: true,
              type: String
          },
          frequency: {
              required: true,
              type: Number,
              options: val => {
                  return val >= 1
              },
              error: "Frequency must be not less than one day"
          },
    },
    requireUser: true
  }
);


Parse.Cloud.define('dislikeHabit', async req => {
    console.time("Parse.Cloud -> dislikeHabit")
    const habitId = req.params.habitId;
    const checklist = await likeTools.getOneLike(req.user, habitId)
    if (checklist.get("user").id === req.user.id) {
        await likeTools.removeLike(checklist)
        const habitQuery = habitTools.constructHabitQuery(habitId)
        const habits = await habitTools.getHabitsForUser(req.user.id, habitQuery)
        console.timeEnd("Parse.Cloud -> dislikeHabit")
        return habits[0]
    } else {
        throw "Вы не можете удалить лайк у чужой привычки"
    }
}, {
    fields: {
        habitId: {
            required: true,
            type: String
        },
    },
    requireUser: true
});


