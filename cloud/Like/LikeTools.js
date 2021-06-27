module.exports = { canLikeHabit, createLike, removeLike, getOneLike };


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

/**
 @deprecated Проверка может ли юзер лайкнуть привычку или он это уже сделал. Устаревший метод. Проверка теперь выполняется на уровне БД
 * @param user
 * @param habit
 * @returns {Promise<void>}
 */
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