import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Variable global para modo mock local, preserva el estado entre navegaciones
let mockTasks = [
  { id: '1', title: 'Diseñar Mockups', description: 'Crear los diseños en Figma', assignees: ['Gonza 🫡', 'Zahi 🐾'], status: 'todo', etaStart: '2026-09-14', etaEnd: '2026-09-16', subtasks: [{ id: 's1', title: 'Home', completed: true }, { id: 's2', title: 'Dashboard', completed: false }] },
  { id: '2', title: 'Revisión de textos', description: 'Revisar copy del home', assignees: ['Zahi 🐾'], status: 'inprogress', etaStart: '2026-09-14', etaEnd: '2026-09-14', subtasks: [] },
  { id: '3', title: 'Setup Inicial', description: 'Configurar repo', assignees: ['Carlos'], status: 'done', etaStart: '2026-09-10', etaEnd: '2026-09-11', subtasks: [{ id: 's3', title: 'Git init', completed: true }] }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setTasks([...mockTasks]);
      setLoading(false);
      return () => {};
    }

    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addTask = async (taskData) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      const newTask = { ...taskData, id: Date.now().toString(), status: taskData.status || 'todo' };
      mockTasks = [...mockTasks, newTask];
      setTasks([...mockTasks]);
      return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp(),
        status: taskData.status || 'todo'
      });
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      mockTasks = mockTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      setTasks([...mockTasks]);
      return;
    }
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      mockTasks = mockTasks.filter(t => t.id !== taskId);
      setTasks([...mockTasks]);
      return;
    }
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
};
