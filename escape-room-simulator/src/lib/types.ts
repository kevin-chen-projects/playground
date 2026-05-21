export type Item = {
  id: string;
  name: string;
  description?: string;
  inspectText?: string;
};

export type Puzzle = {
  id: string;
  prompt: string;
  solutionItemId?: string;
  solvedText?: string;
  rewardItemId?: string;
};

export type Room = {
  id: string;
  title: string;
  description: string;
  itemIds: string[];
  puzzleIds: string[];
  exits: Array<{ toRoomId: string; label: string; locked?: boolean; requiredPuzzleId?: string }>;
};

export type GameState = {
  currentRoomId: string;
  inventoryItemIds: string[];
  solvedPuzzleIds: string[];
  inspectedItemId?: string;
  message: string;
};
