// admin-panel.js
// Admin Panel Management

// ========== ADMIN PANEL FUNCTIONS ==========

function showAdminLoginModal() {
    const existingModal = document.querySelector('.password-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="password-modal" style="display: block;">
            <div class="password-content">
                <div class="password-header">
                    <h2 class="password-title">Admin Login</h2>
                    <button class="close-password" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <p>Enter your admin email to receive a login link</p>
                </div>
                
                <input type="email" class="password-input" id="adminEmail" placeholder="Admin email address">
                <input type="password" class="password-input" id="adminPassword" placeholder="Admin password" style="display: none;">
                
                <button class="password-submit" onclick="handlePasswordlessLogin()">
                    <i class="fas fa-paper-plane"></i> Send Login Link
                </button>
                
                <div class="auth-method-toggle">
                    <span class="toggle-link" onclick="toggleAuthMethod()">Use password login instead</span>
                </div>
                
                <div style="margin-top: 15px; text-align: center;">
                    <small style="color: rgba(255,255,255,0.7);">
                        We'll send a secure login link to your email
                    </small>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showAdminPanel() {
    if (!authManager.isAdminAuthenticated()) {
        showNotification("Please login first", "info");
        showAdminLoginModal();
        return;
    }
    
    const existingModal = document.querySelector('.admin-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="admin-content">
            <div class="admin-header">
                <h2 class="admin-title">Premium Users Management</h2>
                <button class="close-admin" onclick="hideAdminPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-users"></i> Current Premium Users</h3>
                <div class="user-list" id="userList">
                    <div style="text-align: center; padding: 20px;">
                        <div class="loading"></div>
                        <p>Loading users...</p>
                    </div>
                </div>
                
                <div class="add-user-form">
                    <input type="email" class="email-input" id="newUserEmail" placeholder="Enter email address">
                    <select class="expiry-select" id="expiryDays">
                        <option value="7">7 Days</option>
                        <option value="30" selected>30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">365 Days</option>
                    </select>
                    <button class="add-user-btn" onclick="addPremiumUser()">
                        <i class="fas fa-plus"></i> Add Premium User
                    </button>
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-database"></i> Data Management</h3>
                <div class="admin-actions">
                    <button class="admin-btn export-btn" onclick="exportUsers()">
                        <i class="fas fa-download"></i> Export Users
                    </button>
                    <button class="admin-btn import-btn" onclick="document.getElementById('importFile').click()">
                        <i class="fas fa-upload"></i> Import Users
                    </button>
                    <input type="file" id="importFile" class="file-input" accept=".json" onchange="importUsers(this)">
                </div>
            </div>
            
            <div class="admin-section">
                <h3><i class="fas fa-user-shield"></i> Admin Session</h3>
                <div class="admin-actions">
                    <button class="admin-btn" onclick="authManager.logout()" style="background: linear-gradient(135deg, var(--danger), #E53E3E);">
                        <i class="fas fa-sign-out-alt"></i> Logout Admin
                    </button>
                    <button class="admin-btn" onclick="showSystemInfo()">
                        <i class="fas fa-info-circle"></i> System Info
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    loadUserList();
}

function hideAdminPanel() {
    const modal = document.querySelector('.admin-modal');
    if (modal) {
        modal.remove();
    }
}

async function loadUserList() {
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    try {
        const premiumUsers = await premiumManager.getAllPremiumUsers();
        
        if (premiumUsers.length === 0) {
            userList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No premium users yet</div>';
            return;
        }
        
        userList.innerHTML = '';
        premiumUsers.forEach((user) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            const expiryDate = new Date(user.expiry);
            const formattedDate = expiryDate.toLocaleDateString();
            const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            let statusColor = '#48BB78'; // Green
            if (daysRemaining < 7) statusColor = '#F56565'; // Red
            else if (daysRemaining < 30) statusColor = '#D4AF37'; // Gold
            
            userItem.innerHTML = `
                <div style="flex: 1;">
                    <div class="user-email">${user.email}</div>
                    <div class="user-expiry">
                        Expires: ${formattedDate} 
                        <span style="color: ${statusColor}; font-weight: 600;">
                            (${daysRemaining} days left)
                        </span>
                    </div>
                    ${user.addedBy ? `<div style="font-size: 11px; color: rgba(255,255,255,0.5);">Added by: ${user.addedBy}</div>` : ''}
                </div>
                <button class="remove-user" onclick="removePremiumUserFromFirebase('${user.email}')" ${user.email === 'ooooshine1@gmail.com' ? 'disabled style="opacity: 0.5;"' : ''}>
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
            userList.appendChild(userItem);
        });
    } catch (error) {
        userList.innerHTML = '<div style="text-align: center; color: #F56565; padding: 20px;">Error loading users: ' + error.message + '</div>';
    }
}

function showSystemInfo() {
    const info = `
        Firebase Status: ${premiumManager.offlineMode ? 'Offline Mode' : 'Connected'}
        Admin: ${authManager.getCurrentAdmin() ? authManager.getCurrentAdmin().email : 'Not logged in'}
        Local Users: ${premiumManager.getLocalPremiumUsers().length}
        Last Sync: ${new Date().toLocaleString()}
    `;
    
    showNotification('System Information Loaded', 'info');
    console.log('System Info:', info);
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-modal')) {
        hideAdminPanel();
    }
    if (e.target.classList.contains('password-modal')) {
        e.target.remove();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideAdminPanel();
        const passwordModal = document.querySelector('.password-modal');
        if (passwordModal) {
            passwordModal.remove();
        }
    }
});
