import { Game } from './game';

window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  (window as any).game = game;
  await game.init();
});
