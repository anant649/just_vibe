import { useState, useCallback, useMemo } from 'react';

/**
 * A custom hook to manage state history for undo/redo functionality.
 * @param initialState The initial state value.
 * @returns An object with the current state, and functions to update it, undo, and redo.
 */
export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);

  const state = useMemo(() => history[pointer], [history, pointer]);

  const setState = useCallback((newState: T) => {
    // If the new state is the same as the current one, do nothing.
    // This prevents adding duplicate states to the history.
    if (JSON.stringify(newState) === JSON.stringify(history[pointer])) {
        return;
    }

    // When a new state is set, we discard the "redo" history.
    const newHistory = history.slice(0, pointer + 1);
    newHistory.push(newState);
    
    setHistory(newHistory);
    setPointer(newHistory.length - 1);
  }, [history, pointer]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      setPointer(prevPointer => prevPointer - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setPointer(prevPointer => prevPointer + 1);
    }
  }, [canRedo]);

  return { state, setState, undo, redo, canUndo, canRedo };
};
