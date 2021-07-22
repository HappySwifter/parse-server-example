module.exports = { createLike, removeLike, getOneLike };


/**
 * Получить ACL для создания лайка по переданному юзеру
 * @param {Parse.User} user юзер для настройки прав
 * @returns {Parse.ACL}  ACL
 */
function getLikeACL(user) {
    const acl = new Parse.ACL();
    acl.setReadAccess(user, true);
    acl.setWriteAccess(user, true);
    acl.setPublicReadAccess(false)
    acl.setPublicWriteAccess(false)
    acl.setRoleWriteAccess('adminRole', true);
    acl.setRoleReadAccess('adminRole', true);
    return acl;
}

/**
 Get one like
 * @param user
 * @param habit
 * @returns Checklist
 */
async function getOneLike(user, habitId) {
    const query = new Parse.Query('Checklist');
    query.equalTo('user', user);
    query.equalTo('habit', { __type: 'Pointer', className: 'Habit', objectId: habitId });
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
async function createLike(habitId, user, frequency) {

    const Checklist = Parse.Object.extend('Checklist');
    const checklist = new Checklist();
    const acl = getLikeACL(user)
    checklist.setACL(acl);

    await checklist.save({
        user: user,
        habit: { __type: 'Pointer', className: 'Habit', objectId: habitId },
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