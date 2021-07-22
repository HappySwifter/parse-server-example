const dateTools = require('../DateTools.js');

Parse.Cloud.define('getChecklist', async req => {
    const user = req.user
    console.log('fetch checklist for user', user)
    const query = constructChecklistQuery(undefined, user)
    return await fetchChecklist(query)
}, {
    requireUser: true
})

function constructChecklistQuery(checklistId, user) {
    const query = new Parse.Query("Checklist");
    query.equalTo("user", user.id);
    if (checklistId !== undefined) {
        console.log("Query: fetch checklist with id", checklistId)
        query.equalTo("objectId", checklistId);
    } else {
        console.log("Query: fetch all checklists")
    }
    return query
}


async function fetchChecklist(query) {
    console.time('fetch checklist');
    const pipeline = [
        {
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
                    { '$limit': 1 },
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
        { addFields: {
                __type: "Object",
                className: "Checklist"
            }
        },
        { project: { facts: 0 } }
    ]

    const results = await query.aggregate(pipeline, { useMasterKey: true })
    console.log('fetched checklist count:', results.length)
    console.timeEnd('fetch checklist');
    return filterChecklistToShowInTodayTab(results)
}


function filterChecklistToShowInTodayTab(results) {
    const currentDate = new Date()
    console.log("--- Фильтруем чеклист на Сегодня ---")
    const filtered = results.filter((check) => {
        console.log("-----------")
        if (!check.lastFactDate) {
            check.isCompleted = false
            console.log("привычка без факта, показываем в сегодня")
            return true
        }
        const lastFactDate = new Date(check.lastFactDate.iso)
        const createdAt = new Date(check.createdAt)

        console.log("check.createdAt", createdAt)
        console.log("currentDate", currentDate)
        console.log("check.lastFactDate.iso", lastFactDate)

        if (check.frequency === 1) {
            console.log("ежедневная привычка, показываем")
            return true
        }

        if (dateTools.isToday(createdAt, currentDate)) {
            console.log("привычка была добавлена в этот день, показываем")
            return true
        }
        // неправильно. Если он поставил лайк из списка привычек, это не значит, что нам ее нужно в чеклисте отобразить
        // if (dateTools.isToday(lastFactDate, currentDate)) {
        //     console.log("факт был проставлен сегодня, показываем")
        //     return true
        // }
        console.log("check.frequency", check.frequency)
        const withFreq = dateTools.addDays(lastFactDate, check.frequency)
        if (dateTools.isToday(withFreq, currentDate)) {
            console.log("привычка назначена на сегодня, показываем")
            return true
        }

        const checkNextShowDay = dateTools.addDays(createdAt, check.frequency)
        if (dateTools.isToday(checkNextShowDay, currentDate)) {
            console.log("createdAt + freq == today, показываем")
            return true
        }

        const diff = dateTools.dateDiffInDays(createdAt, withFreq)
        if (diff < 0) {
            console.log("diff(createdAt, (lastFactDate + freq)) < 0, показываем")
            return true
        }

        console.log("Не показываем в сегодня")
        return false
    });
    console.log("--------------------------------------\n")
    console.log("--- Устанавливаем поля isCompleted ---")
    filtered.forEach(function(check) {
        console.log("------")
        if (!check.lastFactDate) {
            check.isCompleted = false
            console.log("isCompleted: false. Привычка без факта, еще НЕ выполнена")
            return true
        }
        const lastFactDate = new Date(check.lastFactDate.iso)
        console.log("checklist frequency", check.frequency)
        const factDateWithFr = dateTools.addDays(lastFactDate, check.frequency)
        const dayBetweenTodayAndFact = dateTools.dateDiffInDays(currentDate, factDateWithFr)
        const isCompleted = dayBetweenTodayAndFact > 0
        console.log("isCompleted", isCompleted)
        check.isCompleted = isCompleted
    });
    console.log("--------------------------------------\n")
    return filtered
}