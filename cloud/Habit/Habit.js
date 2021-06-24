module.exports = { getHabitsForUser, constructHabitQuery };

Parse.Cloud.define('getHabits', async (req) => {
    const habitId = req.params.habitId
    const query = constructHabitQuery(habitId)
    if (req.user === undefined) {
        return await getHabitsForUnauthorisedUser(query)
    } else {
        return await getHabitsForUser(req.user.id, query)
    }
}, {
    fields: {
        habitId: {
            required: false
        }
    }
})

function constructHabitQuery(habitId) {
    const query = new Parse.Query("Habit");

    if (habitId !== undefined) {
        console.log("Query: fetch habit with id", habitId)
        query.equalTo("objectId", habitId);
    } else {
        console.log("Query: fetch all habits")
    }
    return query
}

async function getHabitsForUnauthorisedUser(query) {
    query.limit(1000)
    console.time('fetch habits no user');
    return await query.find({ useMasterKey: true }).then( facts => {
        console.timeEnd('fetch habits no user');
        return facts
    }).catch( error => {
        throw error
    });
}

async function getHabitsForUser(userId, query) {
    console.time('fetch habits');
    const pipeline = [
        {
            lookup: {
                from: 'Checklist',
                let: { 'habitId': '$_id' }, // определяем локальную переменную
                pipeline: [
                    { '$addFields': { 'isLiked': true } }, // добавляем новое поле в объект checklist, чтобы потом его вернуть
                    { '$project': {
                            'foreignHabit': { $substr: ["$_p_habit", 6, -1] }, // у чеклиста у поля _p_habit обрезаем ненужные символы и переименовываем его в foreignHabit
                            'isLiked': 1, // оставляем поле isLiked для показа
                            'user': { $substr: ["$_p_user", 6, -1] }
                        }
                    },
                    { '$match': {
                            '$and': [ // фильтр AND
                                {'$expr': { '$eq': ['$$habitId', '$foreignHabit'] }}, // фильтр привычка чеклиста == привычке
                                {'$expr': { '$eq': [userId, '$user'] }} // фильтр юзер равен заданному
                            ]
                        }
                    },
                    { '$limit': 1 }, // возвращаем только одно значение
                    { '$project': { '_id': 0, 'isLiked': 1 } } // оставляем только поле isLiked
                ],
                as: 'checklist'
            }
        },
        // {
        //     lookup: {
        //         from: 'HabitFact',
        //         let: { 'habitId': '$_id' },
        //         pipeline: [
        //             { '$project': {
        //                       'foreignHabit': { $substr: ["$_p_habit", 6, -1] },
        //                       'lastFactDate': "$_created_at",
        //                       'user': { $substr: ["$_p_user", 6, -1] }
        //                   }
        //             },
        //             { '$match': {
        //                     '$and': [
        //                         {'$expr': { '$eq': ['$$habitId', '$foreignHabit'] }},
        //                         {'$expr': { '$eq': [userId, '$user'] }}
        //                     ]
        //                 }
        //             },
        //             { '$sort': {  'lastFactDate': -1 } },
        //             { '$limit': 1 },
        //             { '$project': { '_id': 0, 'lastFactDate': 1 } }
        //         ],
        //         as: 'facts'
        //     }
        // },
        {
            // из массивов объектов $checklist и $facts берем первые элементы и объединяем поля этих объектов с родителем
            replaceRoot: { newRoot: {
                    $mergeObjects: [ { $arrayElemAt: [ "$checklist", 0 ] }, "$$ROOT" ]  }
                // ,  { $arrayElemAt: [ "$facts", 0 ] }
            }
        },
        { project: { checklist: 0 } }
        // , facts: 0
    ]


    return await query.aggregate(pipeline, { userMasterKey: true })
      .then( results => {
          // console.log("res", results);
          console.timeEnd('fetch habits');
          return results
      })
      .catch( error => {
          throw error
      });
}
// Parse.Cloud.afterFind('Habit', async req => {

  // const checklistQuery = new Parse.Query("Checklist");
  // checklistQuery.equalTo("user", req.user);
  // const habits = req.objects;
  //
  // return await checklistQuery.find({useMasterKey:true}).then(function(checklists) {
  //     if (checklists.length === 0) {
  //       return habits;
  //     } else {
  //       habits.forEach(function(habit) {
  //         checklists.forEach(function(checklist) {
  //           if (checklist.get("habit").id === habit.id) {
  //             habit.set("isLiked", true);
  //           }
  //         });
  //       });
  //       return habits;
  //     }
  // });
// });
