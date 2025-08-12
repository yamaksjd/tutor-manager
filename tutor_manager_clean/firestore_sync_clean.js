import { db } from './firebaseconfig.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Default data (only used if Firestore is empty)
const defaultStudents = [
  { name: "Alice", parent: "Parent A", contact: "alice@email.com", notes: "" },
  { name: "Bob", parent: "Parent B", contact: "bob@email.com", notes: "" },
  { name: "Charlie", parent: "Parent C", contact: "charlie@email.com", notes: "" }
];
const defaultTutors = [
  { name: "Maria", contact: "maria@email.com", rate: 30, notes: "" },
  { name: "John", contact: "john@email.com", rate: 25, notes: "" },
  { name: "Lina", contact: "lina@email.com", rate: 28, notes: "" }
];

// Local arrays
export let students = [];
export let tutors = [];
export let sessions = [];

// Load all students from Firestore
export async function loadAllStudents() {
  const colRef = collection(db, "students");
  const snapshot = await getDocs(colRef);
  students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // If empty, add defaults
  if (students.length === 0) {
    for (const s of defaultStudents) {
      await addDoc(colRef, s);
    }
    // Reload after adding
    return loadAllStudents();
  }
  return students;
}

// Load all tutors from Firestore
export async function loadAllTutors() {
  const colRef = collection(db, "tutors");
  const snapshot = await getDocs(colRef);
  tutors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (tutors.length === 0) {
    for (const t of defaultTutors) {
      await addDoc(colRef, t);
    }
    return loadAllTutors();
  }
  return tutors;
}

// Load all sessions from Firestore
export async function loadAllSessions() {
  const colRef = collection(db, "sessions");
  const snapshot = await getDocs(colRef);
  sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sessions;
}

// Add new student
export async function addStudent(studentObj) {
  const docRef = await addDoc(collection(db, "students"), studentObj);
  students.push({ id: docRef.id, ...studentObj });
  return docRef.id;
}

// Update student
export async function updateStudent(id, updatedObj) {
  students = students.map(s => s.id === id ? { ...s, ...updatedObj } : s);
  await updateDoc(doc(db, "students", id), updatedObj);
}

// Delete student
export async function deleteStudent(id) {
  students = students.filter(s => s.id !== id);
  await deleteDoc(doc(db, "students", id));
}

// Add new tutor
export async function addTutor(tutorObj) {
  const docRef = await addDoc(collection(db, "tutors"), tutorObj);
  tutors.push({ id: docRef.id, ...tutorObj });
  return docRef.id;
}
export async function updateTutor(id, updatedObj) {
  tutors = tutors.map(t => t.id === id ? { ...t, ...updatedObj } : t);
  await updateDoc(doc(db, "tutors", id), updatedObj);
}
export async function deleteTutor(id) {
  tutors = tutors.filter(t => t.id !== id);
  await deleteDoc(doc(db, "tutors", id));
}

// Add new session
export async function addSession(sessionObj) {
  const docRef = await addDoc(collection(db, "sessions"), sessionObj);
  sessions.push({ id: docRef.id, ...sessionObj });
  return docRef.id;
}
export async function updateSession(id, updatedObj) {
  sessions = sessions.map(s => s.id === id ? { ...s, ...updatedObj } : s);
  await updateDoc(doc(db, "sessions", id), updatedObj);
}
export async function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  await deleteDoc(doc(db, "sessions", id));
} 