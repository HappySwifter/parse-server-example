// Parse.Cloud.define('addNoteRating', function(request, response) {
//   Objects.save(null, {
//     useMasterKey: true,
//     success: function(object) {
//       object.increment("noteRating");
//       object.save();
//       console.log("Cloud Code: User note rating has increased by 1.", object);
//       response.success('Cloud Code: User note rating has increased by 1.');
//
//     }
//   });
// });


// await new Promise(resolve => setTimeout(resolve, 1000));
// throw new Parse.Error(9001, 'Saving test objects is not available.');


// result.destroy({useMasterKey:true})
// .then((myObject) => {
//   req.log.info('-->> удалили привычку');
//   return "ok";
// }, (error) => {
//   throw error;
// });


// for (let i = 0; i < results.length; i++) {
//   const object = results[i];
// }

// const results = await query1.count({useMasterKey:true})


// Parse.Cloud.define("updatePlayer", async(request) => {
//   const attributes = request.params.attributes;
//   const yearOfBirth = request.params.yearOfBirth;
//
//   const query = new Parse.Query("SoccerPlayers");
//   query.equalTo('yearOfBirth', yearOfBirth);
//   const results = await query.find();
//
//   for (let i = 0; i < results.length; i++) {
//     let object = results[i];
//     object.add("attributes", attributes);
//     try{
//       await object.save();
//     } catch (e){
//       console.log(`Error while trying to save ${object.id}. Message: ${e.message}`)
//     }
//   }
//
//   return results
// });