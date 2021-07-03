//
// ADDFIELD
// {
//     currentDateParts: {
//         $dateToParts: {
//             date: ISODate('2021-06-24T12:52:57.036Z')
//         }
//     },
//     createdAtParts: {
//         $dateToParts: {
//             date: '$_created_at'
//         }
//     }
// },
// {
//     currentDay: {
//         $dateFromParts: {
//             year: '$currentDateParts.year',
//               month: '$currentDateParts.month',
//               day: '$currentDateParts.day'
//         }
//     },
//     createdAtDay: {
//         $dateFromParts: {
//             year: '$createdAtParts.year',
//               month: '$createdAtParts.month',
//               day: '$createdAtParts.day'
//         }
//     }
// },
// {
//     daysFromCreation: {
//         $divide: [
//             {
//                 $subtract: [
//                     '$currentDay',
//                     '$createdAtDay'
//                 ]
//             },
//             86400000
//         ]
//     }
// },
// {
//     isCreatedToday: {
//         $eq: [
//             '$daysFromCreation',
//             0
//         ]
//     }
// },
// {
//     daysFromCreation: 0,
//       createdAtDay: 0,
//   createdAtParts: 0,
//   currentDateParts: 0
// }





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



// {
//     // из массивов объектов $checklist и $facts берем первые элементы и объединяем поля этих объектов с родителем
//     replaceRoot: { newRoot: {
//             $mergeObjects: [ { $arrayElemAt: [ "$checklist", 0 ] }, "$$ROOT" ]  }
//         // ,  { $arrayElemAt: [ "$facts", 0 ] }
//     }
// },


