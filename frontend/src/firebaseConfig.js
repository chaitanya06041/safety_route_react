// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDHEpctlLStOGikXiqJIECZy5BAgkkTjI",
  authDomain: "safety-route-a61c3.firebaseapp.com",
  databaseURL: "https://safety-route-a61c3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "safety-route-a61c3",
  storageBucket: "safety-route-a61c3.firebasestorage.app",
  messagingSenderId: "406468250880",
  appId: "1:406468250880:web:31faae3e4e2171058d77e5",
  measurementId: "G-0G5MDNCLMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;