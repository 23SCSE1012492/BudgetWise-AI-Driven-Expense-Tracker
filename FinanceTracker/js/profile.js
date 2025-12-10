// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadProfileSettings();
    loadStatistics();
});

function _getCurrentUserObject() {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function loadUserProfile() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) {
        window.location.href = 'index.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // users may be an array; find the user by id or email
    let user = null;
    if (Array.isArray(users)) {
        user = users.find(u => u.id === currentUserObj.id || u.email === currentUserObj.email);
    } else {
        // fallback if stored as object map
        user = users[currentUserObj.id] || users[currentUserObj.email] || null;
    }

    if (!user) {
        // if not found, fall back to using the parsed currentUser object
        user = currentUserObj;
    }

    // Display profile info
    document.getElementById('profileName').textContent = user.name || 'Unknown User';
    document.getElementById('profileRole').textContent = user.role || 'Individual';
    document.getElementById('profileEmail').textContent = user.email || 'Not provided';

    // Avatar initials
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
    const avatarEl = document.getElementById('avatarInitial');
    if (avatarEl) avatarEl.textContent = initials;

    // Member since date
    const joinDate = user.joinDate || user.createdAt || new Date().toLocaleDateString();
    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl) memberSinceEl.textContent = `Member since ${joinDate}`;

    // Load into edit fields
    const nameEl = document.getElementById('editName');
    const emailEl = document.getElementById('editEmail');
    const roleEl = document.getElementById('editRole');
    if (nameEl) nameEl.value = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
    if (roleEl) roleEl.value = user.role || 'individual';

    // Load settings
    const uid = user.id || user.email;
    const settings = JSON.parse(localStorage.getItem(`settings_${uid}`) || '{}');
    const currencyEl = document.getElementById('editCurrency');
    const langEl = document.getElementById('editLanguage');
    const themeEl = document.getElementById('editTheme');
    if (currencyEl) currencyEl.value = settings.currency || 'INR';
    if (langEl) langEl.value = settings.language || 'en';
    if (themeEl) themeEl.value = settings.theme || 'dark';

    // Load goals
    const goals = JSON.parse(localStorage.getItem(`goals_${uid}`) || '{}');
    const savingsEl = document.getElementById('savingsTarget');
    const expenseEl = document.getElementById('expenseLimit');
    const descEl = document.getElementById('goalDescription');
    if (savingsEl) savingsEl.value = goals.savingsTarget || '';
    if (expenseEl) expenseEl.value = goals.expenseLimit || '';
    if (descEl) descEl.value = goals.description || '';
}

function loadProfileSettings() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return;
    const uid = currentUserObj.id || currentUserObj.email;
    const settings = JSON.parse(localStorage.getItem(`settings_${uid}`) || '{}');

    // Apply theme
    const theme = settings.theme || 'dark';
    if (theme === 'light') {
        document.body.style.filter = 'invert(1)';
    } else {
        document.body.style.filter = '';
    }
}

function saveProfileChanges() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return showMessage('No user logged in', 'error');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const uid = currentUserObj.id || currentUserObj.email;

    // find index to update
    let idx = -1;
    if (Array.isArray(users)) idx = users.findIndex(u => u.id === currentUserObj.id || u.email === currentUserObj.email);

    const updated = Object.assign({}, currentUserObj, {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value
    });

    if (idx !== -1) {
        users[idx] = Object.assign({}, users[idx], updated);
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        // If users not array or user not found, still write back as best effort
        localStorage.setItem('users', JSON.stringify(users));
    }

    // update currentUser stored object
    localStorage.setItem('currentUser', JSON.stringify(updated));

    // Save settings
    const settings = {
        currency: document.getElementById('editCurrency').value,
        language: document.getElementById('editLanguage').value,
        theme: document.getElementById('editTheme').value
    };
    localStorage.setItem(`settings_${uid}`, JSON.stringify(settings));

    // Update profile card immediately
    const user = updated;
    document.getElementById('profileName').textContent = user.name || 'Unknown User';
    document.getElementById('profileEmail').textContent = user.email || 'Not provided';
    document.getElementById('profileRole').textContent = user.role || 'Individual';
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
    const avatarEl = document.getElementById('avatarInitial');
    if (avatarEl) avatarEl.textContent = initials;

    showMessage('✅ Profile updated successfully!', 'success');
}

function resetProfileForm() {
    loadUserProfile();
    showMessage('↻ Form reset', 'success');
}

function saveFinancialGoals() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return showMessage('No user logged in', 'error');
    const uid = currentUserObj.id || currentUserObj.email;

    const goals = {
        savingsTarget: parseFloat(document.getElementById('savingsTarget').value) || 0,
        expenseLimit: parseFloat(document.getElementById('expenseLimit').value) || 0,
        description: document.getElementById('goalDescription').value
    };

    localStorage.setItem(`goals_${uid}`, JSON.stringify(goals));
    showMessage('🎯 Financial goals saved!', 'success');
}

function enableTwoFactor() {
    showMessage('🔐 Two-factor authentication coming soon!', 'success');
}

function showPasswordChangeModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordForm').reset();
}

function handlePasswordChange(event) {
    event.preventDefault();
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return showMessage('No user logged in', 'error');

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let userIdx = -1;
    if (Array.isArray(users)) userIdx = users.findIndex(u => u.id === currentUserObj.id || u.email === currentUserObj.email);

    let storedUser = (userIdx !== -1) ? users[userIdx] : currentUserObj;

    // In a real app, passwords should be hashed
    if (storedUser.password !== currentPassword) {
        showMessage('❌ Current password is incorrect', 'error');
        return false;
    }

    if (newPassword !== confirmPassword) {
        showMessage('❌ New passwords do not match', 'error');
        return false;
    }

    if (newPassword.length < 6) {
        showMessage('❌ Password must be at least 6 characters', 'error');
        return false;
    }

    // Update password
    if (userIdx !== -1) {
        users[userIdx].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        storedUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(storedUser));
    }

    closePasswordModal();
    showMessage('✅ Password changed successfully!', 'success');
    return false;
}

function manageNotifications() {
    showMessage('🔔 Notification settings coming soon!', 'success');
}

function backupData() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return showMessage('No user logged in', 'error');
    const uid = currentUserObj.id || currentUserObj.email;

    // Collect all user data
    const backup = {
        profile: JSON.parse(localStorage.getItem('users') || '[]'),
        transactions: localStorage.getItem(`transactions_${uid}`),
        forum: localStorage.getItem(`forumPosts_${uid}`),
        goals: localStorage.getItem(`goals_${uid}`),
        settings: localStorage.getItem(`settings_${uid}`),
        timestamp: new Date().toISOString()
    };

    // Create download link
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    showMessage('💾 Backup downloaded successfully!', 'success');
}

function deleteAllData() {
    if (confirm('⚠️ Are you sure? This will delete ALL your transactions and data. This cannot be undone!')) {
        const currentUserObj = _getCurrentUserObject();
        if (!currentUserObj) return;
        const uid = currentUserObj.id || currentUserObj.email;
        localStorage.removeItem(`transactions_${uid}`);
        localStorage.removeItem(`forumPosts_${uid}`);
        localStorage.removeItem(`goals_${uid}`);
        showMessage('🗑️ All data deleted', 'success');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

function deleteAccount() {
    if (confirm('⚠️ Are you sure? This will permanently delete your account!')) {
        if (confirm('This action cannot be undone. Are you absolutely sure?')) {
            const currentUserObj = _getCurrentUserObject();
            if (!currentUserObj) return;
            const uid = currentUserObj.id || currentUserObj.email;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (Array.isArray(users)) {
                const idx = users.findIndex(u => u.id === currentUserObj.id || u.email === currentUserObj.email);
                if (idx !== -1) users.splice(idx, 1);
                localStorage.setItem('users', JSON.stringify(users));
            }
            localStorage.removeItem('currentUser');
            localStorage.removeItem(`transactions_${uid}`);
            localStorage.removeItem(`forumPosts_${uid}`);
            localStorage.removeItem(`goals_${uid}`);
            localStorage.removeItem(`settings_${uid}`);
            showMessage('❌ Account deleted', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
}

function loadStatistics() {
    const currentUserObj = _getCurrentUserObject();
    if (!currentUserObj) return;
    const uid = currentUserObj.id || currentUserObj.email;

    // Total transactions
    const transactions = JSON.parse(localStorage.getItem(`transactions_${uid}`) || '[]');
    const totalEl = document.getElementById('totalTransactions');
    if (totalEl) totalEl.textContent = transactions.length;

    // Most used category
    if (transactions.length > 0) {
        const categoryCount = {};
        transactions.forEach(tx => {
            categoryCount[tx.category] = (categoryCount[tx.category] || 0) + 1;
        });
        const topCat = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
        );
        const topEl = document.getElementById('topCategory');
        if (topEl) topEl.textContent = topCat;
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function showSection(id) {
    // For navigation within profile page
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('passwordModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
