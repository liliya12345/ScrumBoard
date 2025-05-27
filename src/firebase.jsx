
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyCDCLd_jO9sikP-Xkhc4jdzQ4jM8xO6oVU",
        authDomain: "scrum-board-817000.firebaseapp.com",
        databaseURL: "https://scrum-board-817000-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "scrum-board-817000",
        storageBucket: "scrum-board-817000.firebasestorage.app",
        messagingSenderId: "684022041759",
        appId: "1:684022041759:web:4fb01d97262b45829066aa",
        measurementId: "G-DFFSQ8DXED"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getAnalytics(app);

export default database;
