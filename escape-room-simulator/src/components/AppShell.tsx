import React, { useMemo, useState } from 'react';
import { rooms, items, puzzles } from '../data/sampleContent';
import { attemptPuzzle, createInitialState, inspectItem, takeItem } from '../lib/gameEngine';

export default function AppShell() {
  const [state, setState] = useState(() => createInitialState('lobby'));
  const room = rooms[state.currentRoomId];

  const roomItems = useMemo(() => room.itemIds.map((id) => items[id]).filter(Boolean), [room]);
  const roomPuzzles = useMemo(() => room.puzzleIds.map((id) => puzzles[id]).filter(Boolean), [room]);

  return (
    <div style={{ display: 'grid', gap: 16, padding: 24, fontFamily: 'system-ui', maxWidth: 960, margin: '0 auto' }}>
      <header>
        <h1 style={{ marginBottom: 4 }}>Escape Room Simulator</h1>
        <div>{room.title}</div>
      </header>

      <section style={{ padding: 16, border: '1px solid #ccc', borderRadius: 12 }}>
        <p>{room.description}</p>
        <p><strong>Status:</strong> {state.message}</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 12 }}>
          <h2>Room Objects</h2>
          <ul>
            {roomItems.map((item) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <strong>{item.name}</strong>
                <div>{item.description}</div>
                <button onClick={() => setState((s) => inspectItem(s, item.id))}>Inspect</button>{' '}
                <button onClick={() => setState((s) => takeItem(s, item.id))}>Take</button>
              </li>
            ))}
          </ul>

          <h2>Puzzles</h2>
          <ul>
            {roomPuzzles.map((puzzle) => (
              <li key={puzzle.id} style={{ marginBottom: 8 }}>
                <strong>{puzzle.id}</strong>
                <div>{puzzle.prompt}</div>
                <button onClick={() => setState((s) => attemptPuzzle(s, puzzle.id))}>Attempt</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <section style={{ padding: 16, border: '1px solid #ccc', borderRadius: 12 }}>
            <h2>Inventory</h2>
            <ul>
              {state.inventoryItemIds.map((id) => (
                <li key={id}>{items[id]?.name ?? id}</li>
              ))}
            </ul>
          </section>

          <section style={{ padding: 16, border: '1px solid #ccc', borderRadius: 12 }}>
            <h2>Navigation</h2>
            <ul>
              {room.exits.map((exit) => (
                <li key={`${room.id}-${exit.toRoomId}`}>
                  <button onClick={() => setState((s) => ({ ...s, currentRoomId: exit.toRoomId, message: `Moved to ${rooms[exit.toRoomId].title}.` }))}>
                    {exit.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
