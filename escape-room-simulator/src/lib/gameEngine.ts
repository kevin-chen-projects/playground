import type { GameState } from './types';
import { items, puzzles } from '../data/sampleContent';

export function createInitialState(startRoomId: string): GameState {
  return {
    currentRoomId: startRoomId,
    inventoryItemIds: [],
    solvedPuzzleIds: [],
    message: 'You wake up in a strange room. Start exploring.',
  };
}

export function inspectItem(state: GameState, itemId: string): GameState {
  const item = items[itemId];
  return {
    ...state,
    inspectedItemId: itemId,
    message: item?.inspectText ?? `You inspect the ${item?.name ?? 'item'}.`,
  };
}

export function takeItem(state: GameState, itemId: string): GameState {
  if (state.inventoryItemIds.includes(itemId)) return state;
  return {
    ...state,
    inventoryItemIds: [...state.inventoryItemIds, itemId],
    message: `You picked up ${items[itemId]?.name ?? 'the item'}.`,
  };
}

export function attemptPuzzle(state: GameState, puzzleId: string): GameState {
  if (state.solvedPuzzleIds.includes(puzzleId)) {
    return { ...state, message: 'That puzzle is already solved.' };
  }

  const puzzle = puzzles[puzzleId];
  if (!puzzle) return { ...state, message: 'Nothing happens.' };

  if (puzzle.solutionItemId && !state.inventoryItemIds.includes(puzzle.solutionItemId)) {
    return { ...state, message: 'It looks like you need something else first.' };
  }

  const nextSolved = [...state.solvedPuzzleIds, puzzleId];
  const nextInventory = puzzle.rewardItemId && !state.inventoryItemIds.includes(puzzle.rewardItemId)
    ? [...state.inventoryItemIds, puzzle.rewardItemId]
    : state.inventoryItemIds;

  return {
    ...state,
    solvedPuzzleIds: nextSolved,
    inventoryItemIds: nextInventory,
    message: puzzle.solvedText ?? 'Puzzle solved.',
  };
}
