// premium-manager.js
// Premium User Management with Firebase

class PremiumManager {
    constructor() {
        this.offlineMode = false;
    }

    // ========== PREMIUM USER CHECK ==========
    
    async checkPremiumStatus(email) {
        try {
            const docRef = db.collection('premiumUsers').doc(email);
            const doc = await docRef.get();
            
            if (doc.exists) {
                const userData = doc.data();
                const today = new Date().toISOString().split('T')[0];
                const isPremium = userData.expiry >= today;
                
                // Update localStorage for offline fallback
                if (isPremium) {
                    this.updateLocalPremiumUser(email, userData.expiry);
                }
                
                return isPremium;
            }
            return false;
        } catch (error) {
            console.error('Firebase error:', error);
            this.offlineMode = true;
            return this.fallbackIsPremiumUser(email);
        }
    }

    // ========== ADMIN FUNCTIONS ==========
    
    async addPremiumUser(email, expiryDays = 30) {
        if (!authManager.isAdminAuthenticated()) {
            showNotification("Admin authentication required", "info");
            return false;
        }
        
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
            
            await db.collection('premiumUsers').doc(email).set({
                email: email,
                expiry: expiryDate.toISOString().split('T')[0],
                addedAt: new Date().toISOString(),
                addedBy: authManager.getCurrentAdmin().email,
                daysAdded: expiryDays
            });
            
            showNotification(`Premium user added successfully! Expires in ${expiryDays} days.`, 'success');
            return true;
        } catch (error) {
            console.error('Error adding user:', error);
            showNotification('Error adding user: ' + error.message, 'info');
            return false;
        }
    }

    async removePremiumUser(email) {
        if (!authManager.isAdminAuthenticated()) {
            showNotification("Admin authentication required", "info");
            return false;
        }
        
        if (email === 'ooooshine1@gmail.com') {
            showNotification("Cannot remove admin user!", "info");
            return false;
        }
        
        try {
            await db.collection('premiumUsers').doc(email).delete();
            showNotification('User removed successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error removing user:', error);
            showNotification('Error removing user: ' + error.message, 'info');
            return false;
        }
    }

    async getAllPremiumUsers() {
        try {
            const snapshot = await db.collection('premiumUsers').get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    email: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by expiry date
            users.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    // ========== OFFLINE FALLBACK SYSTEM ==========
    
    updateLocalPremiumUser(email, expiry) {
        const premiumUsers = this.getLocalPremiumUsers();
        const existingIndex = premiumUsers.findIndex(u => u.email === email);
        
        if (existingIndex !== -1) {
            premiumUsers[existingIndex].expiry = expiry;
        } else {
            premiumUsers.push({ email: email, expiry: expiry });
        }
        
        this.saveLocalPremiumUsers(premiumUsers);
    }

    fallbackIsPremiumUser(email) {
        const premiumUsers = this.getLocalPremiumUsers();
        const user = premiumUsers.find(u => u.email === email);
        const today = new Date().toISOString().split('T')[0];
        return user ? user.expiry >= today : false;
    }

    getLocalPremiumUsers() {
        const stored = localStorage.getItem('premiumUsers');
        return stored ? JSON.parse(stored) : [];
    }

    saveLocalPremiumUsers(users) {
        localStorage.setItem('premiumUsers', JSON.stringify(users));
    }

    // ========== BULK OPERATIONS ==========
    
    async exportPremiumUsers() {
        try {
            const users = await this.getAllPremiumUsers();
            const dataStr = JSON.stringify(users, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'premium-users-backup.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showNotification('Premium users exported successfully!', 'success');
        } catch (error) {
            showNotification('Export failed: ' + error.message, 'info');
        }
    }

    async importPremiumUsers(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedUsers = JSON.parse(e.target.result);
                    
                    if (Array.isArray(importedUsers)) {
                        let successCount = 0;
                        let errorCount = 0;
                        
                        for (const user of importedUsers) {
                            if (user.email && user.expiry) {
                                try {
                                    await db.collection('premiumUsers').doc(user.email).set({
                                        email: user.email,
                                        expiry: user.expiry,
                                        importedAt: new Date().toISOString(),
                                        addedBy: authManager.getCurrentAdmin().email
                                    });
                                    successCount++;
                                } catch (error) {
                                    errorCount++;
                                }
                            }
                        }
                        
                        showNotification(`Import completed! ${successCount} users added, ${errorCount} errors.`, 'success');
                        resolve(true);
                    } else {
                        showNotification('Invalid file format', 'info');
                        resolve(false);
                    }
                } catch (error) {
                    showNotification('Error importing users: Invalid JSON file', 'info');
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    }
}

// Initialize Premium Manager
const premiumManager = new PremiumManager();

// Global functions for HTML
async function checkPremiumStatus(email) {
    return await premiumManager.checkPremiumStatus(email);
}

async function addPremiumUser() {
    const emailInput = document.getElementById('newUserEmail');
    const expirySelect = document.getElementById('expiryDays');
    const email = emailInput.value.trim();
    const expiryDays = parseInt(expirySelect.value);
    
    if (!email) {
        showNotification('Please enter an email address', 'info');
        return;
    }
    
    if (!authManager.isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'info');
        return;
    }
    
    const success = await premiumManager.addPremiumUser(email, expiryDays);
    if (success) {
        emailInput.value = '';
        if (window.loadUserList) {
            loadUserList();
        }
    }
}

async function removePremiumUserFromFirebase(email) {
    if (confirm(`Are you sure you want to remove ${email}?`)) {
        const success = await premiumManager.removePremiumUser(email);
        if (success && window.loadUserList) {
            loadUserList();
        }
    }
}

function exportUsers() {
    premiumManager.exportPremiumUsers();
}

function importUsers(input) {
    const file = input.files[0];
    if (!file) return;
    
    premiumManager.importPremiumUsers(file).then(() => {
        // Reset file input
        input.value = '';
        if (window.loadUserList) {
            loadUserList();
        }
    });
}