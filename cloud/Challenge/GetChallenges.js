
Parse.Cloud.define('getChallenges', async req => {
    const challengeId = req.params.challengeId
    const query = constructChallengesQuery(challengeId)
    if (req.user === undefined) {
        return await getChallengesForUnauthorisedUser(query)
    } else {
        return await getChallngessForUser(req.user.id, query)
    }
}, {
    fields: {
        challengeId: {
            required: false,
        },
    }
})

function constructChallengesQuery(challengeId) {
    const query = new Parse.Query("Challenge");

    if (challengeId !== undefined) {
        console.log("Query: fetch challenge with id", challengeId)
        query.equalTo("objectId", challengeId);
    } else {
        console.log("Query: fetch all challenges")
    }
    return query
}

async function getChallengesForUnauthorisedUser(query) {
    query.limit(1000)
    console.time('fetch challenge no user');
    return await query.find({ useMasterKey: true }).then( challenges => {
        console.timeEnd('fetch challenge no user');
        return challenges
    }).catch( error => {
        throw error
    });
}

async function getChallngessForUser(userId, query) {
    console.time('fetch challenges');

    const pipeline = [
        {
            match: {
                $and:
                  [
                      { 'startDate': { '$lt': new Date() } },
                      { 'finishDate': { '$gt': new Date() } },
                  ]
            }
        },
        {
            lookup: {
                'from': 'UserChallenge',
                'let': {
                    'challengeId': '$_id'
                },
                'pipeline': [
                    {
                        '$addFields': {
                            'isParticipating': true
                        }
                    }, {
                        '$project': {
                            'foreignChallenge': {
                                '$substr': [
                                    '$_p_challenge', 10, -1
                                ]
                            },
                            'isParticipating': 1,
                            'user': {
                                '$substr': [
                                    '$_p_user', 6, -1
                                ]
                            }
                        }
                    }, {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$$challengeId', '$foreignChallenge'
                                        ]
                                    }
                                }, {
                                    '$expr': {
                                        '$eq': [
                                            userId, '$user'
                                        ]
                                    }
                                }
                            ]
                        }
                    }, {
                        '$limit': 1
                    }, {
                        '$project': {
                            '_id': 0,
                            'isParticipating': 1
                        }
                    }
                ],
                'as': 'userChallenge'
            }
        }, {
            lookup: {
                'from': 'Habit2Challenge',
                'let': {
                    'challengeId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$challengeId', {
                                        '$substr': [
                                            '$_p_challenge', 10, -1
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        '$addFields': {
                            'habitId': {
                                '$substr': [
                                    '$_p_habit', 6, -1
                                ]
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'habitId': 1,
                            'points': 1,
                            'targetDate': 1
                        }
                    }
                ],
                'as': 'habits'
            }
        }, {
            replaceRoot: {
                'newRoot': {
                    '$mergeObjects': [
                        {
                            '$arrayElemAt': [
                                '$userChallenge', 0
                            ]
                        }, '$$ROOT'
                    ]
                }
            }
        }, {
            project: {
                'userChallenge': 0
            }
        }
    ]

    return await query.aggregate(pipeline, { userMasterKey: true })
      .then( results => {
          console.timeEnd('fetch challenges');
          console.log(results)
          return results
      })
      .catch( error => {
          throw error
      });
}