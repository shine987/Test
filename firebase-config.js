// firebase-config.js
// Firebase Configuration - Production Ready

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyABafybNHccbdYb8rn9-I6u969AXmIGNRw",
    authDomain: "jft-premium-fa989.firebaseapp.com",
    projectId: "jft-premium-fa989",
    storageBucket: "jft-premium-fa989.firebasestorage.app",
    messagingSenderId: "489498879566",
    appId: "1:489498879566:web:89be4d4997483c94a4451f"
};

// Initialize Firebase
const app = firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const auth = firebase.auth();

console.log('Firebase initialized successfully');

// Auth state listener
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
        // Check if this is an admin
        checkAdminStatus(user);
    } else {
        console.log('User signed out');
        window.currentAdmin = null;
    }
});

// Check if user is admin
async function checkAdminStatus(user) {
    try {
        // For now, we'll consider any authenticated user as admin
        // In production, you should implement proper admin verification
        const idTokenResult = await user.getIdTokenResult();
        if (user.email === 'ooooshine1@gmail.com' || idTokenResult.claims.admin) {
            window.currentAdmin = user;
            document.getElementById('adminPanel').style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}
