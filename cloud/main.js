// It is best practise to organize your cloud functions group into their own file. You can then import them in your main.js.
require('./Scheduler')(Parse)


require('./functions.js');

require('./Habit/Habit.js');
require('./Habit/BeforeSaveHabit.js');

require('./Like/like.js');
require('./Like/GetChecklist.js');
require('./Fact.js');


// Challenges
require('./Challenge/Hooks/BeforeSaveChallenge.js');
require('./Challenge/Hooks/BeforSaveHabit2Challenge.js')

require('./Challenge/GetChallenges');
require('./Challenge/EnterChallenge');
require('./Challenge/LeaveChallenge');


Parse.Cloud.job("myJob", (request) =>  {
    // params: passed in the job call
    // headers: from the request that triggered the job
    // log: the ParseServer logger passed in the request
    // message: a function to update the status message of the job object
    const { params, headers, log, message } = request;
    console.log("I just started");
    return "FINISHED";
});



