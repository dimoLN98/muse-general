import { getPage } from '../browser/connect.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { handleListCharacters } from './create-character.js';

/** Open the project's Characters view and list the characters in it. */
export async function handleOpenCharacters(args = {}) {
  const listing = await handleListCharacters(args);
  const page = getPage();
  return {
    ...listing,
    status: 'opened',
    url: page.url(),
    title: await page.title(),
    screenshot: await takeScreenshot(page, 'characters-page'),
  };
}
