import { loadAllTutors, tutors as store, addTutor, updateTutor, deleteTutor } from './firestore_sync_clean.js';

// tutors_clean.js
export const state = { list: [] };

export async function init() {
  await loadAllTutors();
  // Ensure subjects exists to avoid undefined later
  store.forEach(t => { if (!Array.isArray(t.subjects)) t.subjects = []; });
  state.list = store;
  return state.list;
}

export function listHTML(tutors) {
  return tutors.map(t => `<li data-id="${t.id}">${t.name}</li>`).join('');
}


export function subjectsFor(tutorId) {
  const t = state.list.find(x => x.id === tutorId);
  return t?.subjects ?? [];
}

export { addTutor, updateTutor, deleteTutor };
