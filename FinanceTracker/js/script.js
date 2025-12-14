// Store user data (In a real application, this would be handled by a backend server)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Function to show different sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.auth-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Function to show messages
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // In a real application, we would receive and store a JWT token here
        currentUser = { ...user, password: undefined };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage('Login successful!');
        
        // If user hasn't created a profile yet, show profile creation form
        if (!user.profile) {
            showSection('profile');
        } else {
            // Redirect to dashboard
            showMessage('Redirecting to dashboard...');
            // give a short delay so the message is visible, then navigate
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        }
    } else {
        showMessage('Invalid email or password', true);
    }
    
    return false;
}

// Handle Registration
function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showMessage('Email already registered', true);
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In a real application, this would be hashed
        role,
        profile: null
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please log in.');
    showSection('login');
    
    return false;
}

// Handle Profile Creation
function handleProfileCreation(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showMessage('Please log in first', true);
        return false;
    }
    
    const profile = {
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
        savingsGoal: parseFloat(document.getElementById('savingsGoal').value),
        targetExpenses: parseFloat(document.getElementById('targetExpenses').value),
        currency: document.getElementById('currency').value
    };
    
    // Update user profile
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].profile = profile;
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser.profile = profile;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showMessage('Profile created successfully! Redirecting to dashboard...');
        // give user a moment to read the message, then redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    }
    
    return false;
}

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        if (!currentUser.profile) {
            showSection('profile');
        } else {
            // Redirect to dashboard
            showMessage('Welcome back, ' + currentUser.name + '. Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        }
    } else {
        showSection('login');
    }
});