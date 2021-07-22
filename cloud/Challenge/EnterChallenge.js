const challengeTools = require('./GetChallenges');


/**
 * Enter challenge
 */
Parse.Cloud.define('enterChallenge', async req => {
    console.time("Parse.Cloud -> enterChallenge")

    const challengeId = req.params.challengeId
    const user = req.user
    console.log('-->> req.user: ', user);
    console.log('-->> req.challengeId: ', challengeId);

    await createUser2Challenge(challengeId, user)
    const challengeQuery = challengeTools.constructChallengesQuery(challengeId)
    const pipeline = challengeTools.getAggregationPipeline(user)
    const updatedChallenge = await challengeTools.getChallengesForUser(pipeline, challengeQuery)
    console.timeEnd("Parse.Cloud -> enterChallenge")
    return updatedChallenge[0]
  }, {
      fields: {
          challengeId: {
              required: true,
              type: String
          },
      },
      requireUser: true
  }
);


/**
 * Get ACL to enter the challenge
 * @param {Parse.User} user current user
 * @returns {Parse.ACL}  ACL
 */
function getUserChallengeACL(user) {
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
 * Creates new UserChallenge document
 * @param challengeId id of challenge
 * @param user user
 * @returns UserChallenge created challenge
 */
async function createUser2Challenge(challengeId, user) {

    const UserChallenge = Parse.Object.extend('UserChallenge');
    const userChallenge = new UserChallenge();
    const acl = getUserChallengeACL(user)
    userChallenge.setACL(acl);

    const obj = await userChallenge.save({
        user: user,
        challenge: { __type: 'Pointer', className: 'Challenge', objectId: challengeId }
    })
    console.log('-->> userChallenge saved');
    return obj
}