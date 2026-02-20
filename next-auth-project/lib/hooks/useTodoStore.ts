
import { create } from 'zustand';

type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    isAddModalOpen: boolean; // Just as an example of UI state
    toggleAddModal: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
    filter: 'all',
    setFilter: (filter) => set({ filter }),
    isAddModalOpen: false,
    toggleAddModal: () => set((state) => ({ isAddModalOpen: !state.isAddModalOpen })),
}));
