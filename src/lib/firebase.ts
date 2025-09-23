// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-6237275854-f92e7",
  "appId": "1:839433960262:web:3e074e99325a8d2b5cc347",
  "apiKey": "AIzaSyBiHi0pgt2o2Ivx9z8_odV1EyD3-azTdN0",
  "authDomain": "studio-6237275854-f92e7.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "839433960262"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
