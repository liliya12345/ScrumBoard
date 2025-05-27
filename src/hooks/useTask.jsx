import {useEffect, useState} from "react";
import { loadTasks, saveTask } from '../api/firebase';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshTasks = async () => {
        setLoading(true);
        try {
            const loadedTasks = await loadTasks();
            setTasks(loadedTasks);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData) => {
        await saveTask(taskData);
        await refreshTasks();
    };

    // Other task operations...

    useEffect(() => {
        refreshTasks();
    }, []);

    return { tasks, loading, addTask, refreshTasks };
};