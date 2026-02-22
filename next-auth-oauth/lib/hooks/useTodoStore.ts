import { create } from 'zustand';

type FilterType = 'all' | 'active' | 'completed';

interface TodoStore {
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
    filter: 'all',
    setFilter: (filter) => set({ filter }),
}));
