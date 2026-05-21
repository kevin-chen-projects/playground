import type { Item, Puzzle, Room } from '../lib/types';

export const items: Record<string, Item> = {
  note: {
    id: 'note',
    name: 'Folded Note',
    description: 'A scrap of paper with a hint.',
    inspectText: 'The note says: "Look under what watches the door."',
  },
  keycard: {
    id: 'keycard',
    name: 'Keycard',
    description: 'A plastic keycard with a faded stripe.',
    inspectText: 'It looks like it could unlock a security door.',
  },
};

export const puzzles: Record<string, Puzzle> = {
  locker: {
    id: 'locker',
    prompt: 'A locked locker has a card reader. Maybe the note helps.',
    solutionItemId: 'keycard',
    solvedText: 'The locker clicks open.',
    rewardItemId: 'keycard',
  },
};

export const rooms: Record<string, Room> = {
  lobby: {
    id: 'lobby',
    title: 'Lobby',
    description: 'A small room with a desk, a wall clock, and a locked locker.',
    itemIds: ['note'],
    puzzleIds: ['locker'],
    exits: [{ toRoomId: 'hall', label: 'Open hallway', locked: false }],
  },
  hall: {
    id: 'hall',
    title: 'Hallway',
    description: 'A narrow hall leading deeper into the facility.',
    itemIds: [],
    puzzleIds: [],
    exits: [{ toRoomId: 'lobby', label: 'Back to lobby' }],
  },
};
