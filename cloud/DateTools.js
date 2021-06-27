module.exports = { isToday, addDays, dateDiffInDays }


function isToday(date, currentDate) {

    // const result = new Date(date);
    const isToday = date.getDate() === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
    console.log(date, 'is today?', isToday)
    return isToday
}

/**
 * Добавляет кол-во дней к дате
 * @param date дата, к оторой нужно прибавить дни
 * @param days кол-во дней, которое нужно прибавить
 * @returns {Date} обновленная дата
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days)
    return result
}

function dateDiffInDays(a, b) {
    console.log("comparing date:", a, "with:", b)
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    const result = Math.floor((utc2 - utc1) / _MS_PER_DAY);
    console.log("days count between dates:", result)
    return result
}