-- Run only when restoring the old Strategize catalog. Preserve Storage files.
begin;
delete from public.module_materials where module_id='01' and id in ('b24cc6da-5850-59d3-a320-279e8001ca5e','662b29d2-9781-5086-93f3-b80079b633cf','b05d082d-8bba-5bc9-93d4-a65795b74ade','2dcc1dff-2d89-5105-ac2e-578698006feb','a967577f-4fd8-543c-83da-0322ba26f480','7c62dd59-170e-5cc8-9a84-9d98221fb3a7');
commit;
