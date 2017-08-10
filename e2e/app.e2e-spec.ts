import { NoteKeeperPage } from './app.po';

describe('note-keeper App', () => {
  let page: NoteKeeperPage;

  beforeEach(() => {
    page = new NoteKeeperPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
