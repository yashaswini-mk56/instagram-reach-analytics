import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcZdkJIVI1dTpWGRgsvnOKYUZIungxZyI",
  authDomain: "insta-analytics-1052e.firebaseapp.com",
  projectId: "insta-analytics-1052e",
  storageBucket: "insta-analytics-1052e.firebasestorage.app",
  messagingSenderId: "122324645297",
  appId: "1:122324645297:web:22b5188e0da9d043aeb990",
  measurementId: "G-87RS5DDGQK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;