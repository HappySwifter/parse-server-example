Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});

Parse.Cloud.beforeSave('HabitFact', function(req, res) {
  var acl = new Parse.ACL();
  acl.setReadAccess(req.user, true);
  acl.setWriteAccess(req.user, false);
  acl.publicRead = true;
  acl.publicWrite = false;
  acl.setRoleWriteAccess("adminRole", true);
  acl.setRoleReadAccess("adminRole", true);
  req.object.setACL(acl);
});
