
Parse.Cloud.define('leaveChallenge', async req => {
      console.time("Parse.Cloud -> leaveChallenge")

      const challenge = req.params.challenge
      console.log(challenge)

      console.timeEnd("Parse.Cloud -> leaveChallenge")

  }, {
      fields: {
          challenge: {
              required: true,
          },
      },
      requireUser: true
  }
);

