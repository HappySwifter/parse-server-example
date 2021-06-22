// Parse.Cloud.afterFind('Checklist', async req => {
//   console.time("afterFindChecklistQuery");
//   const checklists = req.objects;
//   const habitFactQuery = new Parse.Query("HabitFact");
//   // habitFactQuery.equalTo("user", req.user);
//   habitFactQuery.limit(1000);
//   habitFactQuery.descending("createdAt"); // сортируем по убыванию даты, чтобы самые свежие факты были сверху
//   habitFactQuery.aggregate()
//   habitFactQuery.distinct("habit")
//     .then(function(results) {
//
//       console.timeEnd("afterFindChecklistQuery");
//       console.log('-->> habitFacts for this user ', results);
//
//       results.some(function(habitFact) {
//         console.log('-->> watching habitFact with date', habitFact.createdAt);
//         // console.log('-->> watching habitFact with date', habitFact.get("createdAt"));
//         console.log('-->> watching habitFact with date', habitFact["createdAt"]);
//       });
//         // results contains unique age where name is foo
//     })
//     .catch(function(error) {
//       throw error;
//       // There was an error.
//     });



  // return await habitFactQuery.find({useMasterKey:true}).then(function(habitFacts) {
  //   console.timeEnd("afterFindChecklistQuery");
  //   console.time("afterFindChecklistLoop");
  //
  //   console.log('-->> habitFacts for this user ', habitFacts);
  //   if (habitFacts.length === 0) {
  //     console.timeEnd("afterFindChecklistLoop");
  //     return checklists;
  //   } else {
  //     checklists.forEach(function(checklist) {
  //
  //       habitFacts.some(function(habitFact) {
  //         console.log('-->> watching habitFact with date', habitFact.createdAt);
  //         if (habitFact["habit"].id === checklist.get("habit").id) {
  //           // находим самый первый подходящий факт и выходим. Так как факты отсортированы, то в первую очередь в массив попадет тот факт, который был создан последним
  //           checklist.set("lastCheckDate", habitFact.createdAt);
  //           console.log('-->> found match', habitFact["createdAt"]);
  //           return true;
  //         }
  //       });
  //     });
  //     console.timeEnd("afterFindChecklistLoop");
  //     return checklists;
  //   }
  // });
// });

Parse.Cloud.define('addToChecklist', async req => {
  // req.log.info('-->> req: ', req);
  const habit = req.params.habit;


  console.log('-->> req.user: ', req.user);
  console.log('-->> req.habit: ', habit);

  const query = new Parse.Query("Checklist");
  query.equalTo("user", req.user);
  query.equalTo("habit", habit);
  query.limit(1);
  const count = await query.count({useMasterKey:true})
  if (count > 0) {
    throw "Привычка уже добавлена в чеклист";
  }

  const Checklist = Parse.Object.extend("Checklist");
  const checklist = new Checklist();

  const acl = new Parse.ACL();
  acl.setReadAccess(req.user, true);
  acl.setWriteAccess(req.user, true);
  acl.publicRead = false;
  acl.publicWrite = false;
  acl.setRoleWriteAccess("adminRole", true);
  acl.setRoleReadAccess("adminRole", true);
  checklist.setACL(acl);

  return await checklist.save({
    user: req.user,
    habit: habit,
    frequency: req.params.frequency
  }).then((checklist) => {
    req.log.info('-->> Like saved');

    const habit = checklist.get("habit");
    habit["isLiked"] = true;
    return habit;

  }, (error) => {
    req.log.info('Failed to create new object, with error code: ' + error.message);
    throw error;
  });


  // req.log.info('->> req.user' + req.user);
  // gameScore.user = req.user
  // gameScore.habit = req.habit
  // gameScore.frequency = 7
  // gameScore.save()
  // .then((gameScore) => {
  // // Execute any logic that should take place after the object is saved.
  //   req.log.info(gameScore);
  //   return 'Hi';
  // }, (error) => {
  // // Execute any logic that should take place if the save fails.
  // // error is a Parse.Error with an error code and message.
  //   req.log.info('Failed to create new object, with error code: ' + error.message);
  //   return 'Hi';
  // });
  // const query = new Parse.Query("Habit");
  // const results = await query.find();
  // var habit = req.habit

},{
  fields : {
    habit : {
      required: true
    }
  }
});


Parse.Cloud.define('removeFromChecklist', async req => {
  const habit = req.params.habit;
  const query = new Parse.Query("Checklist");
  query.equalTo("user", req.user);
  query.equalTo("habit", habit);
  query.limit(1);
  const result = await query.first({useMasterKey:true});
  console.log('-->> удаляем привычку из избранного: ', result);
  return await result.destroy({ useMasterKey: true }).then((checklist) => {
    req.log.info('-->> Like deleted');
    // habit["isLiked"] = false;
    return habit;
  }, (error) => {
    console.log('Failed to delete object, with error code: ' + error.message);
    throw error;
  });
},{
  fields : {
    habit : {
      required: true
    }
  }
});
