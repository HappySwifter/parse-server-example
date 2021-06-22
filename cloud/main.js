// It is best practise to organize your cloud functions group into their own file. You can then import them in your main.js.
require('./functions.js');

require('./Habit/Habit.js');
require('./Habit/BeforeSaveHabit.js');

require('./like.js');
require('./Fact.js');
