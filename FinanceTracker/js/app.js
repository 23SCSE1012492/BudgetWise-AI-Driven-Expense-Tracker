// Finance Tracker - JavaScript

// Category definitions
const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Other Income'],
    expense: ['Rent', 'Food', 'Travel', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other Expense']
};

// Storage key helpers (per-user)
function txKey() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    return `transactions_${user.id || 'public'}`;
}

// Chart instances
let incomeExpenseChart = null;
let categoryChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setTodayDate();
    updateCategories();
    loadTransactions();
    updateDashboard();
    populateFilterCategories();
    loadBudgets();
});

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = today;
    }
}

// Update category dropdown based on transaction type
function updateCategories() {
    const type = document.getElementById('transType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type && categories[type]) {
        categories[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

// Update category dropdown in edit modal
function updateEditCategories() {
    const type = document.getElementById('editType').value;
    const categorySelect = document.getElementById('editCategory');
    categorySelect.innerHTML = '';
    
    if (type && categories[type]) {
        categories[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

// Populate filter categories
function populateFilterCategories() {
    const filterCategory = document.getElementById('filterCategory');
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    
    const allCategories = [...new Set([...categories.income, ...categories.expense])];
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, connect to backend)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showMessage('Invalid email or password!', 'error');
    }
}

// Handle registration
function handleRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        showMessage('Email already registered!', 'error');
        return false;
    }
    
    const newUser = { id: Date.now(), name, email, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    setTimeout(() => {
        document.getElementById('registerForm').reset();
        showSection('login');
    }, 1500);
    
    return false;
}

// Handle profile creation
function handleProfileCreation(event) {
    event.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const monthlyIncome = document.getElementById('monthlyIncome').value;
    const savingsGoal = document.getElementById('savingsGoal').value;
    const targetExpenses = document.getElementById('targetExpenses').value;
    const currency = document.getElementById('currency').value;
    
    currentUser.profile = {
        monthlyIncome: parseFloat(monthlyIncome),
        savingsGoal: parseFloat(savingsGoal),
        targetExpenses: parseFloat(targetExpenses),
        currency: currency,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMessage('Profile created successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
    
    return false;
}

// Handle add transaction
function handleAddTransaction(event) {
    event.preventDefault();
    
    const type = document.getElementById('transType').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    if (!type || !category || !amount) {
        showMessage('Please fill in all required fields!', 'error');
        return false;
    }
    
    const transaction = {
        id: Date.now(),
        type,
        category,
        amount,
        description,
        date,
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    transactions.push(transaction);
    localStorage.setItem(txKey(), JSON.stringify(transactions));
    
    showMessage('Transaction added successfully!', 'success');
    document.getElementById('transactionForm').reset();
    setTodayDate();
    loadTransactions();
    updateDashboard();
    loadBudgets();
    
    return false;
}

// Load and display transactions
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    displayTransactions(transactions);
    updateDashboard();
}

// Display transactions list
function displayTransactions(transactions) {
    const list = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        list.innerHTML = '<p class="empty-state">No transactions found.</p>';
        return;
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    list.innerHTML = transactions.map(trans => `
        <div class="transaction-item ${trans.type}">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="category">${trans.category}</span>
                    <span class="date">${formatDate(trans.date)}</span>
                </div>
                <p class="description">${trans.description || 'No description'}</p>
            </div>
            <div class="transaction-amount">
                <span class="amount ${trans.type === 'income' ? 'positive' : 'negative'}">
                    ${trans.type === 'income' ? '+' : '-'}₹${trans.amount.toFixed(2)}
                </span>
            </div>
            <div class="transaction-actions">
                <button class="btn-edit" onclick="openEditModal(${trans.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction(${trans.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Filter transactions
function filterTransactions() {
    const filterType = document.getElementById('filterType').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const filterMonth = document.getElementById('filterMonth').value;
    
    let transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    
    if (filterType) {
        transactions = transactions.filter(t => t.type === filterType);
    }
    
    if (filterCategory) {
        transactions = transactions.filter(t => t.category === filterCategory);
    }
    
    if (filterMonth) {
        transactions = transactions.filter(t => t.date.startsWith(filterMonth));
    }
    
    displayTransactions(transactions);
}

// Reset filters
function resetFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterMonth').value = '';
    loadTransactions();
}

// Open edit modal
function openEditModal(id) {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction) {
        document.getElementById('editId').value = transaction.id;
        document.getElementById('editType').value = transaction.type;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editDescription').value = transaction.description;
        document.getElementById('editDate').value = transaction.date;
        
        updateEditCategories();
        document.getElementById('editCategory').value = transaction.category;
        
        document.getElementById('editModal').style.display = 'block';
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Handle edit transaction
function handleEditTransaction(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('editId').value);
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDescription').value;
    const date = document.getElementById('editDate').value;
    
    let transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
        transactions[index] = { ...transactions[index], type, category, amount, description, date };
        localStorage.setItem(txKey(), JSON.stringify(transactions));
        showMessage('Transaction updated successfully!', 'success');
        closeEditModal();
        loadTransactions();
        updateDashboard();
    }
    
    return false;
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        let transactions = JSON.parse(localStorage.getItem(txKey())) || [];
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(txKey(), JSON.stringify(transactions));
        showMessage('Transaction deleted successfully!', 'success');
        loadTransactions();
        updateDashboard();
    }
}

// Update dashboard summary
function updateDashboard() {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsGoal = currentUser.profile?.savingsGoal || 0;
    
    if (document.getElementById('totalIncome')) {
        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
    }
    if (document.getElementById('totalExpenses')) {
        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    }
    if (document.getElementById('balance')) {
        const balanceEl = document.getElementById('balance');
        balanceEl.textContent = `₹${balance.toFixed(2)}`;
        balanceEl.className = `amount ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`;
    }
    if (document.getElementById('savingsGoal')) {
        document.getElementById('savingsGoal').textContent = `₹${savingsGoal.toFixed(2)}`;
    }
    
    updateSummary(transactions);
    renderCharts(transactions);
}

// Update summary section
function updateSummary(transactions) {
    if (transactions.length === 0) return;
    
    // Monthly overview
    const monthlyData = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyData[month].income += t.amount;
        } else {
            monthlyData[month].expense += t.amount;
        }
    });
    
    const monthlySummaryEl = document.getElementById('monthlySummary');
    if (monthlySummaryEl) {
        monthlySummaryEl.innerHTML = Object.entries(monthlyData)
            .reverse()
            .map(([month, data]) => `
                <div class="month-summary">
                    <span class="month">${month}</span>
                    <span class="income">Income: ₹${data.income.toFixed(2)}</span>
                    <span class="expense">Expense: ₹${data.expense.toFixed(2)}</span>
                    <span class="balance">Balance: ₹${(data.income - data.expense).toFixed(2)}</span>
                </div>
            `)
            .join('');
    }
    
    // Category breakdown
    const categoryData = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (!categoryData[t.category]) {
            categoryData[t.category] = 0;
        }
        categoryData[t.category] += t.amount;
    });
    
    const categoryBreakdownEl = document.getElementById('categoryBreakdown');
    if (categoryBreakdownEl) {
        categoryBreakdownEl.innerHTML = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toFixed(2)}</span>
                </div>
            `)
            .join('');
    }
}

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update page title
    const titles = {
        budget: 'Budget',
        transactions: 'Transaction',
        insight: 'Insight',
        backup: 'Backup',
        forum: 'Forem'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl && titles[sectionId]) {
        titleEl.textContent = titles[sectionId];
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Show message
function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Charts using Chart.js
function renderCharts(transactions) {
    try {
        const monthsObj = {};
        transactions.forEach(t => {
            const m = t.date.substring(0,7);
            monthsObj[m] = monthsObj[m] || { income:0, expense:0 };
            monthsObj[m][t.type] += t.amount;
        });
        const months = Object.keys(monthsObj).sort();
        const incomeData = months.map(m => monthsObj[m].income);
        const expenseData = months.map(m => monthsObj[m].expense);

        const ctx1 = document.getElementById('incomeExpenseChart');
        if (ctx1) {
            if (incomeExpenseChart) incomeExpenseChart.destroy();
            incomeExpenseChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: months.length ? months : [new Date().toISOString().slice(0,7)],
                    datasets: [
                        { label: 'Income', data: months.length?incomeData:[0], backgroundColor: '#28a745' },
                        { label: 'Expenses', data: months.length?expenseData:[0], backgroundColor: '#dc3545' }
                    ]
                },
                options: { responsive:true, maintainAspectRatio:false }
            });
        }

        // transaction types pie
        const typeTotals = { income: 0, expense: 0 };
        transactions.forEach(t => typeTotals[t.type] += t.amount);
        const typeLabels = ['Income', 'Expense'];
        const typeValues = [typeTotals.income, typeTotals.expense];
        const ctx2 = document.getElementById('categoryChart');
        if (ctx2) {
            if (categoryChart) categoryChart.destroy();
            categoryChart = new Chart(ctx2, {
                type: 'pie',
                data: { 
                    labels: typeLabels, 
                    datasets:[{ 
                        data: typeValues, 
                        backgroundColor: ['#28a745', '#dc3545'] 
                    }] 
                },
                options: { responsive:true, maintainAspectRatio:false }
            });
        }
    } catch (e) { console.error('Chart render error', e); }
}

function generateColors(n) { const cols=[]; for(let i=0;i<n;i++) cols.push(`hsl(${(i*360/n)%360} 70% 50%)`); return cols; }

// Export and backup
function exportCSV() {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    if (!transactions.length) { showMessage('No transactions to export', 'error'); return; }
    const headers = ['id','type','category','amount','description','date'];
    const rows = transactions.map(t=>headers.map(h=>`"${String(t[h]||'').replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `transactions_${(JSON.parse(localStorage.getItem('currentUser'))||{}).id||'public'}.csv`; a.click(); URL.revokeObjectURL(url);
}

function backupJSON() {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    const data = { user: JSON.parse(localStorage.getItem('currentUser')) || {}, transactions };
    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup_${(data.user.id||'public')}.json`; a.click(); URL.revokeObjectURL(url);
}

function restoreJSON() {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
    inp.onchange = (ev)=>{
        const file = ev.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e)=>{
            try {
                const data = JSON.parse(e.target.result);
                if (data && Array.isArray(data.transactions)) {
                    localStorage.setItem(txKey(), JSON.stringify(data.transactions));
                    showMessage('Backup restored', 'success');
                    loadTransactions(); updateDashboard();
                } else showMessage('Invalid backup file', 'error');
            } catch (ex) { showMessage('Error reading file', 'error'); }
        };
        reader.readAsText(file);
    };
    inp.click();
}

// Forum (client-side)
function loadPosts() { return JSON.parse(localStorage.getItem('forum_posts')) || []; }
function savePosts(p){ localStorage.setItem('forum_posts', JSON.stringify(p)); }

function handleForumPost(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const body = document.getElementById('postBody').value.trim();
    if (!title || !body) { showMessage('Please add title and body', 'error'); return false; }
    const posts = loadPosts();
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    posts.unshift({ id: Date.now(), userId: user.id, userName: user.name||user.email, title, body, createdAt: new Date().toISOString(), likes:0 });
    savePosts(posts); document.getElementById('forumForm').reset(); renderForum(); showMessage('Post added', 'success');
    return false;
}

function renderForum() {
    const container = document.getElementById('postsContainer'); if (!container) return;
    const posts = loadPosts(); if (!posts.length) { container.innerHTML = '<p class="empty-state">No posts yet.</p>'; return; }
    container.innerHTML = posts.map(p=>`
        <div class="category-item" style="flex-direction:column;align-items:flex-start;">
            <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <strong>${escapeHtml(p.title)}</strong>
                    <div style="font-size:12px;color:#666;">by ${escapeHtml(p.userName)} • ${new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div>
                    <button class="btn-primary" onclick="likePost(${p.id})">Like (${p.likes||0})</button>
                </div>
            </div>
            <p style="margin-top:8px;color:#333;">${escapeHtml(p.body)}</p>
        </div>
    `).join('');
}

function likePost(id) { const posts = loadPosts(); const idx = posts.findIndex(p=>p.id===id); if (idx===-1) return; posts[idx].likes = (posts[idx].likes||0)+1; savePosts(posts); renderForum(); }

// Profile navigation
function goToProfile() {
    window.location.href = 'profile.html';
}

// Backup functions
function exportData() {
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    if (!transactions.length) {
        showMessage('No transactions to export', 'error');
        return;
    }
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Description', 'Date'];
    const rows = transactions.map(t => [t.id, t.type, t.category, t.amount, `"${t.description || ''}"`, t.date]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_backup.csv';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Data exported as CSV successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.transactions) localStorage.setItem(txKey(), JSON.stringify(data.transactions));
                if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
                loadTransactions();
                updateDashboard();
                showMessage('Data imported successfully!', 'success');
            } catch (err) {
                showMessage('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Budget functions
function budgetKey() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    return `budgets_${user.id || 'public'}`;
}

function handleSetBudget(event) {
    event.preventDefault();
    const form = event.target;
    const category = form.category.value;
    const amount = parseFloat(form.amount.value);
    
    if (!category || amount <= 0) return;
    
    const budgets = JSON.parse(localStorage.getItem(budgetKey())) || {};
    budgets[category] = amount;
    localStorage.setItem(budgetKey(), JSON.stringify(budgets));
    
    form.reset();
    loadBudgets();
    showMessage('Budget set successfully!', 'success');
}

function loadBudgets() {
    const budgets = JSON.parse(localStorage.getItem(budgetKey())) || {};
    const transactions = JSON.parse(localStorage.getItem(txKey())) || [];
    const container = document.getElementById('budgetsContainer');
    if (!container) return;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).forEach(t => {
        monthlyExpenses[t.category] = (monthlyExpenses[t.category] || 0) + t.amount;
    });
    
    const budgetItems = Object.entries(budgets).map(([cat, amt]) => {
        const spent = monthlyExpenses[cat] || 0;
        const percentage = amt > 0 ? Math.min((spent / amt) * 100, 100) : 0;
        const status = percentage > 90 ? 'over' : percentage > 75 ? 'warning' : 'good';
        return `<div class="budget-item ${status}">
            <div>
                <span class="category">${cat}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <small>₹${spent.toFixed(2)} / ₹${amt.toFixed(2)}</small>
            </div>
        </div>`;
    }).join('');
    
    container.innerHTML = budgetItems || '<p class="empty-state">No budgets set yet.</p>';
}

// Initialize budgets on load
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    loadBudgets();
});
