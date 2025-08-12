import { loadAllStudents, students as store, addStudent, updateStudent, deleteStudent } from './firestore_sync_clean.js';

// students_clean.js
export const state = { list: [] };

// For now, seed some data. Later, swap to Firestore.
export async function init() {
  await loadAllStudents();
  state.list = store;           // live reference from data layer
  return state.list;
}

// Return HTML for the list (no DOM touches here)
export function listHTML(students) {
  return students.map(s => `<li data-id="${s.id}">${s.name}</li>`).join('');
}

// (Later) Pure helpers you might use from the entry file:
export { addStudent, updateStudent, deleteStudent };

export function findById(id) {
  return state.list.find(s => s.id === id) || null;
}
