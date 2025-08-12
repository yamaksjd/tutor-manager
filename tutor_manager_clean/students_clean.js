// students_clean.js
export const state = { list: [] };

// For now, seed some data. Later, swap to Firestore.
export async function init() {
  state.list = [
    { id: 's1', name: 'Alice Santos', parent: 'Marta', contact: 'alice@example.com', notes: '' },
    { id: 's2', name: 'Bruno Silva',  parent: 'Paulo', contact: 'bruno@example.com', notes: '' },
  ];
  return state.list;
}

// Return HTML for the list (no DOM touches here)
export function listHTML(students) {
  return students.map(s => `<li data-id="${s.id}">${s.name}</li>`).join('');
}

// (Later) Pure helpers you might use from the entry file:
export function findById(id) {
  return state.list.find(s => s.id === id) || null;
}
