'use strict';
const assert=require('node:assert/strict');
const loc=require('../spring-backend/src/main/resources/static/assets/mv39/i18n.js');
for(const code of ['en','ko','ja','zh','vi'])assert.ok(loc.SUPPORTED.includes(code));
for(const [key,values] of Object.entries(loc.dictionary)){
 assert.equal(values.length,5,`Missing locale for ${key}`);
 for(const v of values)assert.ok(typeof v==='string'&&v.trim());
}
for(const key of ['dashboard','adminMarket','adminConsole','members','ledger','items','analytics','logs','security','controls','features','sourceOverview','verifiedResult','marketPreview','memberSite','adminWelcome','adminLead','verifiedOnly','adminPartial','adminVerified'])assert.ok(loc.dictionary[key]);
console.log(`PASS ${Object.keys(loc.dictionary).length} keys across five locales, EN canonical/KO second`);
