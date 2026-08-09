// src/store/useCourseStore.js
import { create } from 'zustand';

export const useCourseStore = create((set) => ({
  activeTab: 1,
  activeLessonId: 'ep1',
  completedModules: {},
  
  // Navigation Actions
  setActiveTab: (tabId) => set({ activeTab: tabId }),
  setActiveLessonId: (lessonId) => set({ activeLessonId: lessonId }),
  
  // Progress Tracking
  toggleModuleCompletion: (lessonId) => set((state) => ({
    completedModules: {
      ...state.completedModules,
      [lessonId]: !state.completedModules[lessonId]
    }
  })),
}));
