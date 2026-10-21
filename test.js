const assert = require('node:assert/strict');
const { triage, splitMessages } = require('./app.js');

const access = triage('I am locked out and the login OTP never arrives.')[0];
assert.equal(access.category, 'Account access');
assert.equal(access.owner, 'Support Engineering');

const outage = triage('Production down: the CRM sync webhook is timing out and customers are blocked.')[0];
assert.equal(outage.category, 'Integration failure');
assert.equal(outage.priority, 'P1 - urgent');

const two = splitMessages('First message\n\nSecond message');
assert.equal(two.length, 2);

console.log('3 tests passed');
