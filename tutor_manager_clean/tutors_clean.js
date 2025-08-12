// tutors_clean.js
export const state = { list: [] };

export async function init() {
  state.list = [
    { id: 't1', name: 'Carla Duarte', subjects: ['Math', 'Physics'] },
    { id: 't2', name: 'Diogo Costa',  subjects: ['Chemistry'] },
  ];
  return state.list;
}

export function listHTML(tutors) {
  return tutors.map(t => `<li data-id="${t.id}">${t.name}</li>`).join('');
}

export function subjectsFor(tutorId) {
  const t = state.list.find(x => x.id === tutorId);
  return t?.subjects ?? [];
}
