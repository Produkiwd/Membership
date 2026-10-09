begin;
insert into public.module_materials (id,module_id,title,url,section,created_at) values
('b24cc6da-5850-59d3-a320-279e8001ca5e','01','01 AI Readiness','storage:strategize/20261009/01-ai-readiness.html',null,now()+interval '0 seconds'),
('662b29d2-9781-5086-93f3-b80079b633cf','01','02 Token - Data x Biaya','storage:strategize/20261009/02-token-data-biaya.html',null,now()+interval '1 seconds'),
('b05d082d-8bba-5bc9-93d4-a65795b74ade','01','03 AI Usecase','storage:strategize/20261009/03-ai-usecase.html',null,now()+interval '2 seconds'),
('2dcc1dff-2d89-5105-ac2e-578698006feb','01','04 Responsible AI','storage:strategize/20261009/04-responsible-ai.html',null,now()+interval '3 seconds'),
('a967577f-4fd8-543c-83da-0322ba26f480','01','05 Claude - Thinking','storage:strategize/20261009/05-claude-thinking.html',null,now()+interval '4 seconds'),
('7c62dd59-170e-5cc8-9a84-9d98221fb3a7','01','06 Materi Visual Strategize','storage:strategize/20261009/06-materi-visual-strategize.pdf',null,now()+interval '5 seconds')
on conflict (id) do nothing;
commit;
