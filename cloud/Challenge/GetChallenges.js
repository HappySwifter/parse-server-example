module.exports = { getAggregationPipeline, constructChallengesQuery, getChallengesForUser };


Parse.Cloud.define('getChallenges', async req => {
    const challengeId = req.params.challengeId
    const user = req.user
    const query = constructChallengesQuery(challengeId)
    const pipeline = getAggregationPipeline(user)
    return await getChallengesForUser(pipeline, query)

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


function getAggregationPipeline(user) {
    const datesMatchStage = {
        match: { $and:
              [
                  { 'startDate': { '$lt': new Date() } },
                  { 'finishDate': { '$gt': new Date() } },
              ]
        }
    }

    const replaceUserChalStage = {
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
    }

    const removeUserChalStage = {
        project: { 'userChallenge': 0, 'isClosed': 0 }
    }

    const addTypeStage = {
        addFields: {
            __type: "Object",
            className: "Challenge"
        }
    }


    if (user === undefined) {
        return [
            datesMatchStage,
            getHabit2ChallengeStage(),
            addTypeStage
        ]
    } else {
         return [
             datesMatchStage,
             getIsParticipatingStage(user.id),
             replaceUserChalStage,
             removeUserChalStage,
             getHabit2ChallengeStageForUser(user.id),
             addTypeStage
        ]
    }
}

function getIsParticipatingStage(userId) {
    return {
        lookup: {
            'from': 'UserChallenge',
            'let': {
                'challengeId': '$_id'
            },
            'pipeline': [
                { '$addFields': { 'isParticipating': true } },
                { '$project': {
                        'foreignChallenge': { '$substr': ['$_p_challenge', 10, -1] },
                        'isParticipating': 1,
                        'user': { '$substr': ['$_p_user', 6, -1] }
                    }
                },
                { '$match': {
                        '$and': [
                            { '$expr': { '$eq': ['$$challengeId', '$foreignChallenge'] } },
                            { '$expr': {'$eq': [userId, '$user']} }
                        ]
                    }
                },
                { '$limit': 1 },
                {'$project': { '_id': 0, 'isParticipating': 1 } }
            ],
            'as': 'userChallenge'
        }
    }
}

function getHabit2ChallengeStage() {
    return {
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
                                '$$challengeId', { '$substr': [ '$_p_challenge', 10, -1 ] }
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        'habitId': { '$substr': [ '$_p_habit', 6, -1 ] },
                        'points': 1,
                        'targetDate': 1,
                        'objectId': '$_id'
                    }
                }
            ],
            'as': 'habits'
        }
    }
}

function getHabit2ChallengeStageForUser(userId) {
    return {
        lookup: {
            from: 'Habit2Challenge',
            'let': {
                challengeId: '$_id'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: [
                                '$$challengeId',
                                {
                                    $substr: [
                                        '$_p_challenge',
                                        10,
                                        -1
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        targetDate: 1,
                        points: 1,
                        habitId: {
                            $substr: [
                                '$_p_habit',
                                6,
                                -1
                            ]
                        },
                        challenges: 1,
                        targetDay: {
                            $dateToString: {
                                format: '%d-%m-%Y',
                                date: '$targetDate'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'HabitFact',
                        'let': {
                            habitId: '$habitId',
                            targetDay: '$targetDay'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$$habitId',
                                                    {
                                                        $substr: [
                                                            '$_p_habit',
                                                            6,
                                                            -1
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    userId,
                                                    { $substr: [ '$_p_user', 6, -1 ] }
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$$targetDay',
                                                    {
                                                        $dateToString: {
                                                            format: '%d-%m-%Y',
                                                            date: '$_created_at'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $limit: 1
                            },
                            {
                                $addFields: {
                                    isCompleted: true,
                                }
                            }
                        ],
                        as: 'facts'
                    }
                },
                {
                    $set: {
                        isCompleted: {
                            $first: '$facts.isCompleted'
                        },
                        objectId: '$_id',
                    }
                },
                { $unset: ['_id', 'facts', 'targetDay'] }
            ],
            as: 'habits'
        }
    }
}

async function getChallengesForUser(pipeline, query) {
    console.time('fetch challenges');

    return await query.aggregate(pipeline, { userMasterKey: true })
      .then( results => {
          console.timeEnd('fetch challenges');

          console.log('DATE', new Date())
          console.log(results)
          // results.forEach(function(result) {
          //     console.log(result.habits)
          // });


          return results
      })
      .catch( error => {
          throw error
      });
}