// It is best practise to organize your cloud functions group into their own file. You can then import them in your main.js.
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

