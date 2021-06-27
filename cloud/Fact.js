const habitTools = require('./Habit/Habit.js');
const dateTools = require('./DateTools.js');

/**
 * Создать новый факт.
 * 1. Проверяет можно ли создать факт для данной привычки
 * 2. Создает факт
 * 3. Устанавливает прва на факт
 * 4. Прибавляет к значению поля point у юзера поинты, которые указаны в привычке
 // * 5. В таблице чеклист выставляет время исполнения факта
 * 6. Делает aggregate запрос привычки (с лайком и датой факта) и отпавляем ее клиенту
 */
Parse.Cloud.define('createFact', async (req) => {
    console.time("Parse.Cloud -> createFact")
    let habit = await fetchHabit(req.params.habit.objectId)
    let facts = await findLastFact(req.user, habit)
    if ((facts.length === 0) || (facts.length > 0) && canCreate(facts[0].createdAt, habit.get("frequency"))) {
        let fact = await saveFact(habit, req.user)
        await updateUserPoints(fact.get("points"), req.user)
        // await updateChecklist(fact, req.user)
        const habitQuery = habitTools.constructHabitQuery(req.params.habit.objectId)
        const habits = await habitTools.getHabitsForUser(req.user.id, habitQuery)
        console.timeEnd("Parse.Cloud -> createFact")
        return habits[0]
    } else {
        throw 'Завтра эту привычку можно будет отметить снова'
    }
}, {
    fields: {
        habit: {
            required: true
        }
    },
    requireUser: true
});


/**
 * Получить ACL для факта по переданному юзеру
 * @param {Parse.User} user юзер для настройки прав
 * @returns {Parse.ACL}  ACL
 */
function getFactACL(user) {
    const acl = new Parse.ACL();
    acl.setReadAccess(user, true);
    acl.setWriteAccess(user, true);
    acl.publicRead = false;
    acl.publicWrite = false;
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;
}

/**
 * Возвращает факт по ссылке
 * @param habitId id объекта
 * @returns Habit факт
 */
async function fetchHabit(habitId) {
    console.time('fetch habit');
    const Habit = Parse.Object.extend("Habit");
    const habitQuery = new Parse.Query(Habit);
    return await habitQuery.get(habitId, { useMasterKey: true }).then((habit) => {
        console.timeEnd('fetch habit');
        return habit
    }, (error) => {
        console.timeEnd('fetch habit');
        throw error
    });
}

async function findLastFact(user, habit) {
    const habitFactQuery = new Parse.Query('HabitFact');
    habitFactQuery.equalTo('user', user);
    habitFactQuery.equalTo('habit', habit);
    habitFactQuery.limit(1);
    habitFactQuery.descending('createdAt');
    return await habitFactQuery.find({ useMasterKey: true }).then( facts => {
        return facts
    }).catch( error => {
        throw error
    });
}

/**
 * Проверяет, можно ли создать новый факт, основываясь на информации о частоте привычки и дате последнего по ней факта
 * @param createdAt дата последнего факта по привычке
 * @param freq частота привычки (через сколько дней можно повторить)
 * @returns {boolean} можно ли создать новую привычку
 */
function canCreate(createdAt, freq) {
    const currentDate = new Date()
    console.log('-->> fact.createdAt', createdAt);
    console.log('-->> current time', currentDate);
    if (dateTools.isToday(createdAt, currentDate)) {
        console.log('-->> can\'t create');
        return false;
    } else {
        console.log('-->> can create');
        return true;
    }

    // let currentDate = new Date();
    // console.log('-->> comparing', currentDate, '>', addDays(createdAt, freq));
    // if (currentDate > addDays(createdAt, freq)) {
    //     console.log('-->> can create');
    //     return true;
    // } else {
    //     console.log('-->> can\'t create');
    //     return false;
    // }
}

/**
 * Создает новый факт
 * @param habit привычка
 * @param user юзер
 * @returns возвращает созданный факт
 */
async function saveFact(habit, user) {
    const HabitFact = Parse.Object.extend('HabitFact')
    const habitFact = new HabitFact()
    const acl = getFactACL(user)
    habitFact.setACL(acl)

    return await habitFact.save({
        user: user,
        habit: habit,
        points: habit.get("points"),
    }).then((fact) => {
        console.log('-->> fact saved');
        return fact;
    }, (error) => {
        throw error;
    });
}


async function updateUserPoints(points, user) {
    console.time('updateUserPoints');
    const userPoints = user.get('points');
    const totalPoints = userPoints + points;
    console.log('-->> user', user);
    console.log('-->> user points', userPoints);
    console.log('-->> habit points', points);
    console.log('-->> setting total points', totalPoints);
    user.set('points', totalPoints);
    await user.save(null, { useMasterKey: true });
    console.timeEnd('updateUserPoints');
}

async function updateChecklist(habitFact, user) {
    const habit = habitFact.get('habit');
    const checklistQuery = new Parse.Query('Checklist');
    checklistQuery.equalTo('user', user);
    checklistQuery.equalTo('habit', habit);
    checklistQuery.limit(1);
    await checklistQuery.first({ useMasterKey: true })
      .then(function(checklist) {
          if (checklist) {
              const createdAt = habitFact.get('createdAt');
              checklist.set('lastFactDate', createdAt);
              console.log('-->> set lastCheckDate', createdAt, 'for', checklist);
              checklist.save(null, { useMasterKey: true });
          }
      })
      .catch(function(error) {
          throw error;
      });
}
