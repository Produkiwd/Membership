import assert from 'node:assert/strict';
import test from 'node:test';
import { provisionMember, type ProvisionServices } from '../supabase/functions/admin-create-member-user-v2/provision';
const payload = { email:'NEW@example.test',password:'synthetic-password',input:{test:true} };
function services(overrides: Partial<ProvisionServices> = {}) {
  const calls: string[]=[];
  return { calls, api: { validate: async()=>{calls.push('validate');return {valid:true,authUserExists:false};}, createAuth:async()=>{calls.push('auth');return true;}, saveMember:async()=>{calls.push('save');return {id:'synthetic'};}, ...overrides } as ProvisionServices };
}
test('Validation runs before any write', async()=>{
  const s=services({validate:async()=>{throw new Error('Invalid access');}});
  const result=await provisionMember(payload,s.api);
  assert.equal(result.status,400);assert.deepEqual(s.calls,[]);
});
test('Provisioning returns success only after member transaction commits', async()=>{
  const s=services();const result=await provisionMember(payload,s.api);
  assert.deepEqual(s.calls,['validate','auth','save']);assert.equal(result.status,200);assert.equal(result.body.authUserCreated,true);
  assert.equal(JSON.stringify(result.body).includes(payload.password),false);
});
test('Existing login is preserved without a password reset', async()=>{
  const s=services({validate:async()=>({valid:true,authUserExists:true})});
  const result=await provisionMember(payload,s.api);assert.deepEqual(s.calls,['save']);assert.equal(result.body.authUserCreated,false);
});
test('Partial provisioning retains Auth account with a clear retry message', async()=>{
  const s=services({saveMember:async()=>{throw new Error('Storage unavailable');}});
  const result=await provisionMember(payload,s.api);assert.equal(result.status,400);assert.equal(result.body.authUserCreated,true);assert.match(result.body.error!,/Ulangi Tambah Member/);
});
test('Retry after partial provisioning does not recreate login', async()=>{
  const s=services({validate:async()=>({valid:true,authUserExists:true})});
  const result=await provisionMember(payload,s.api);assert.deepEqual(s.calls,['save']);assert.equal(result.status,200);
});
test('Invalid email/password is rejected before calling services', async()=>{
  const s=services();const result=await provisionMember({...payload,password:'short'},s.api);assert.equal(result.status,400);assert.deepEqual(s.calls,[]);
});
