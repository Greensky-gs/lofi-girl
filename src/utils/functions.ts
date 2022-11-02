import { emojis } from './configs.json';

export const boolEmojis = (b: boolean): string => emojis[b ? 'online' : 'dnd'];
