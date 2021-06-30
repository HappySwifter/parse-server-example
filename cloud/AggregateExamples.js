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