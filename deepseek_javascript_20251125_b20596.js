// auth-manager.js
// Authentication Manager - Dual Mode (Passwordless + Password)

class AuthManager {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }

    init() {
        // Check for email link sign-in on page load
        this.checkEmailLinkSignIn();
    }

    // ========== PASSWORDLESS AUTHENTICATION ==========
    
    async sendPasswordlessLink(email) {
        try {
            const actionCodeSettings = {
                url: window.location.origin + '/admin-verify.html',
                handleCodeInApp: true
            };
            
            await auth.sendSignInLinkToEmail(email, actionCodeSettings);
            
            // Save email for verification
            localStorage.setItem('adminEmailForSignIn', email);
            
            showNotification('Login link sent to your email! Check your inbox.', 'success');
            return true;
        } catch (error) {
            console.error('Error sending login link:', error);
            showNotification('Error: ' + error.message, 'info');
            return false;
        }
    }

    checkEmailLinkSignIn() {
        if (auth.isSignInWithEmailLink(window.location.href)) {
            let email = localStorage.getItem('adminEmailForSignIn');
            
            if (!email) {
                // If email is not stored, ask user for it
                email = prompt('Please provide your email for confirmation:');
            }
            
            if (email) {
                this.handleEmailLinkSignIn(email, window.location.href);
            }
        }
    }

    async handleEmailLinkSignIn(email, url) {
        try {
            const result = await auth.signInWithEmailLink(email, url);
            localStorage.removeItem('adminEmailForSignIn');
            this.currentAdmin = result.user;
            
            showNotification('Admin login successful!', 'success');
            
            // Clean URL and show admin panel
            window.history.replaceState({}, '', window.location.pathname);
            document.getElementById('adminPanel').style.display = 'block';
            
            return true;
        } catch (error) {
            console.error('Error with email link sign-in:', error);
            showNotification('Login failed: ' + error.message, 'info');
            return false;
        }
    }

    // ========== TRADITIONAL PASSWORD AUTHENTICATION ==========
    
    async loginWithPassword(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentAdmin = userCredential.user;
            
            showNotification('Admin login successful!', 'success');
            document.getElementById('adminPanel').style.display = 'block';
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No admin account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'info');
            return false;
        }
    }

    // ========== ADMIN MANAGEMENT ==========
    
    isAdminAuthenticated() {
        return this.currentAdmin !== null;
    }

    getCurrentAdmin() {
        return this.currentAdmin;
    }

    async logout() {
        try {
            await auth.signOut();
            this.currentAdmin = null;
            document.getElementById('adminPanel').style.display = 'none';
            showNotification('Admin logged out', 'info');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // ========== UTILITY FUNCTIONS ==========
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Global functions for HTML onclick events
async function handlePasswordlessLogin() {
    const email = document.getElementById('adminEmail').value;
    
    if (!email) {
        showNotification("Please enter your email address", "info");
        return;
    }
    
    if (!authManager.isValidEmail(email)) {
        showNotification("Please enter a valid email address", "info");
        return;
    }
    
    const success = await authManager.sendPasswordlessLink(email);
    if (success) {
        document.querySelector('.password-modal').remove();
    }
}

async function handlePasswordLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        showNotification("Please enter both email and password", "info");
        return;
    }
    
    const success = await authManager.loginWithPassword(email, password);
    if (success) {
        document.querySelector('.password-modal').remove();
    }
}

function toggleAuthMethod() {
    const modal = document.querySelector('.password-modal');
    const isPasswordless = modal.querySelector('#adminPassword').style.display === 'none';
    
    if (isPasswordless) {
        // Switch to password login
        modal.querySelector('#adminPassword').style.display = 'block';
        modal.querySelector('button').innerHTML = '<i class="fas fa-lock"></i> Login with Password';
        modal.querySelector('.toggle-link').textContent = 'Use passwordless login instead';
        modal.querySelector('p').textContent = 'Enter your admin credentials';
    } else {
        // Switch to passwordless login
        modal.querySelector('#adminPassword').style.display = 'none';
        modal.querySelector('button').innerHTML = '<i class="fas fa-paper-plane"></i> Send Login Link';
        modal.querySelector('.toggle-link').textContent = 'Use password login instead';
        modal.querySelector('p').textContent = 'Enter your admin email to receive a login link';
    }
}

function initializeAuthListener() {
    // Check if user is already signed in
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User already signed in:', user.email);
            authManager.currentAdmin = user;
            document.getElementById('adminPanel').style.display = 'block';
        }
    });
}