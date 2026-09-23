import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';

export const useDailyTasks = (userEmail) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setDailyTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'dailyTasks'),
      where('userEmail', '==', userEmail)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort client-side to avoid requiring a composite index in Firestore
      tasksData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setDailyTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching daily tasks:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userEmail]);

  const addDailyTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'dailyTasks'), {
        ...taskData,
        userEmail,
        createdAt: serverTimestamp(),
        completed: false
      });
    } catch (error) {
      console.error("Error adding daily task:", error);
      throw error;
    }
  };

  const updateDailyTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'dailyTasks', taskId);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error("Error updating daily task:", error);
      throw error;
    }
  };

  const deleteDailyTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'dailyTasks', taskId));
    } catch (error) {
      console.error("Error deleting daily task:", error);
      throw error;
    }
  };

  return { dailyTasks, loading, addDailyTask, updateDailyTask, deleteDailyTask };
};
