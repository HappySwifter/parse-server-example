module.exports = { canLikeHabit, createLike, removeLike, getOneLike, fetchChecklist };


/**
 * Получить ACL для создания лайка по переданному юзеру
 * @param {Parse.User} user юзер для настройки прав
 * @returns {Parse.ACL}  ACL
 */
function getLikeACL(user) {
    const acl = new Parse.ACL();
    acl.setReadAccess(user, true);
    acl.setWriteAccess(user, true);
    acl.publicRead = false;
    acl.publicWrite = false;
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;

}

async function canLikeHabit(user, habit) {
    const query = new Parse.Query('Checklist');
    query.equalTo('user', user);
    query.equalTo('habit', habit);
    query.limit(1);
    const count = await query.count({ useMasterKey: true });
    if (count > 0) {
        throw 'Вы уже лайкнули эту привычку';
    }
}

async function getOneLike(user, habit) {
    const query = new Parse.Query('Checklist');
    query.equalTo('user', user);
    query.equalTo('habit', habit);
    query.limit(1);
    return await query.first({ useMasterKey: true });
}

async function fetchChecklist(user) {
    console.time('fetch checklist');
    const pipeline = [
        {
            // match: {
            //     _p_user: '_User$zq310K5K2D'
            // },
            lookup: {
                from: 'HabitFact',
                let: {
                    'checklistHabitId': { $substr: ["$_p_habit", 6, -1] },
                    'checklistUser': { $substr: ["$_p_user", 6, -1] }
                },
                pipeline: [
                    {
                        '$project': {
                            'foreignHabit': { $substr: ["$_p_habit", 6, -1] },
                            'lastFactDate': "$_created_at",
                            'foreignUser': { $substr: ["$_p_user", 6, -1] }
                        }
                    },
                    {
                        '$match': {
                            '$and': [
                                { '$expr': { '$eq': ['$$checklistHabitId', '$foreignHabit'] } },
                                { '$expr': { '$eq': ['$$checklistUser', '$foreignUser'] } }
                            ]
                        }
                    },
                    { '$sort': { 'lastFactDate': -1 } },
                    // { '$limit': 1 },
                    { '$project': { '_id': 0, 'lastFactDate': 1 } }
                ],
                as: 'facts'
            },
        },
        {
            replaceRoot: {
                newRoot: {
                    $mergeObjects: [{ $arrayElemAt: ["$facts", 0] }, "$$ROOT"]
                }
            }
        },
        { project: { facts: 0 } }
    ]

    const query = new Parse.Query("Checklist");
    query.equalTo("user", user);
    return await query.aggregate(pipeline, { userMasterKey: true })
      .then( results => {
          // console.log("res", results);
          console.log('fetched checklist count:', results.length)
          console.timeEnd('fetch checklist');
          return results
      })
      .catch( error => {
          throw error
      });

}

/**
 * Создает новый лайк
 * @param habit привычка
 * @param user юзер
 * @param frequency частота выполнения
 * @returns возвращает созданный факт
 */
async function createLike(habit, user, frequency) {

    const Checklist = Parse.Object.extend('Checklist');
    const checklist = new Checklist();
    const acl = getLikeACL(user)
    checklist.setACL(acl);

    await checklist.save({
        user: user,
        habit: habit,
        frequency: frequency,
    }).then(() => {
        console.log('-->> Like saved');
    }, (error) => {
        throw error;
    });

}

async function removeLike(checklist) {
    console.log('-->> удаляем привычку из избранного: ', checklist);
    await checklist.destroy({ useMasterKey: true }).then((checklist) => {
        console.log('-->> Like deleted');
    }, (error) => {
        throw error
    });
}