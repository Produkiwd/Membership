import assert from 'node:assert/strict';
import test from 'node:test';
import { aiLaunch, MAX_URL_LENGTH } from './aiLaunch';

test('ChatGPT and Claude receive the prompt in the URL', () => {
  assert.deepEqual(aiLaunch('chatgpt', ' Ringkas & jelaskan? '), { url: 'https://chatgpt.com/?q=Ringkas%20%26%20jelaskan%3F', prefilled: true });
  assert.deepEqual(aiLaunch('claude', 'Halo'), { url: 'https://claude.ai/new?q=Halo', prefilled: true });
});

test('Gemini and long prompts open the app without the prompt', () => {
  assert.deepEqual(aiLaunch('gemini', 'Halo'), { url: 'https://gemini.google.com/app', prefilled: false });
  const long = 'kata '.repeat(MAX_URL_LENGTH);
  assert.deepEqual(aiLaunch('claude', long), { url: 'https://claude.ai/new', prefilled: false });
});
