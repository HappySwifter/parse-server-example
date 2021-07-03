
Parse.Cloud.define('participateInChallenge', async req => {
    console.time("Parse.Cloud -> participateInChallenge")
    console.timeEnd("Parse.Cloud -> participateInChallenge")





  }, {
      fields: {
          challenge: {
              required: true,
          },
      },
      requireUser: true
  }
);