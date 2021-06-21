Parse.Cloud.define('getHabits',  (req) => {
    console.time('fetch habits');
    const pipeline = [
        {
            lookup: {
                from: 'Checklist',
                let: {
                    'habitId': '$_id'
                },
                pipeline: [
                    {
                        '$addFields': {
                            'isLiked': true
                        }
                    },
                    {
                        $project:
                          {
                              'foreignHabit': { $substr: ["$_p_habit", 6, -1] },
                              'isLiked': 1
                          }
                    },
                    {
                        '$match': { '$expr': { '$eq': ['$foreignHabit', '$$habitId'] } }
                    },
                    {
                        '$limit': 1
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'isLiked': 1
                        }
                    }
                ],
                as: 'checklist'
            }
        },
        {
            lookup: {
                from: 'HabitFact',
                // localField: '_id',
                // foreignField: 'habId',
                let: {
                    'habitId': '$_id'
                },
                pipeline: [
                    {
                        $project:
                          {
                              'foreignHabit': { $substr: ["$_p_habit", 6, -1] },
                              'lastFactDate': "$_created_at"
                          }
                    },
                    {
                        '$match':
                          {
                              '$expr': { '$eq': ['$$habitId', '$foreignHabit'] }
                          }
                    },
                    {
                        '$sort': {  'lastFactDate': -1 }
                    },
                    {
                        '$limit': 1
                    },

                    {
                        '$project': {
                            '_id': 0,
                            'lastFactDate': 1
                        }
                    }
                ],
                as: 'facts'
            }
        },
        {
            replaceRoot: {
                newRoot: {
                    $mergeObjects: [ { $arrayElemAt: [ "$checklist", 0 ] },  { $arrayElemAt: [ "$facts", 0 ] }, "$$ROOT" ]  }
            }
        },
        {
            project: {
                checklist: 0,
                facts: 0
            }
        }
    ]

    const query = new Parse.Query("Habit");
    return query.aggregate(pipeline, { userMasterKey: true })
      .then( results => {
          console.log("res", results);
          console.timeEnd('fetch habits');
          return results
      })
      .catch( error => {
          throw error
      });
})

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
