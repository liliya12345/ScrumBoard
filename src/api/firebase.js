import { getDatabase, ref, get, set, update, push } from "firebase/database";
import database from "../firebase";

export const loadTasks = async () => {
    const db = getDatabase(database.app);
    const dbRef = ref(db, "tasks");
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) return [];

    if (snapshot.exists()) {
        const tasksData = snapshot.val();
       return Object.keys(tasksData).map(key => ({
            id: key,
            ...tasksData[key]
        }));

}};

export const saveTask = async (task) => {
    const db = getDatabase(database.app);
    const newDocRef = push(ref(db, "tasks"));

    await set(newDocRef, {
        ...task,
        createDate: new Date(Date.now()).toLocaleDateString(),
        status: task.owner === 'Unassigned' ? 'new' : 'in process'
    });

    return newDocRef.key;
};