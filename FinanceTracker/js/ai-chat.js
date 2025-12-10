// AI Chatbot for Finance Tracker

const aiResponses = {
    'budget': 'A budget is a plan for your money. Track your income and expenses, then set limits for each category. Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
    'save': 'Great saving tips: 1) Set a specific goal (e.g., ₹50,000), 2) Automate transfers to savings, 3) Track your progress, 4) Cut unnecessary expenses.',
    'expense': 'To reduce expenses, track where your money goes, identify unnecessary spending, use coupons, cook at home, use public transport, and cancel unused subscriptions.',
    'income': 'To increase income: 1) Ask for a raise, 2) Start a side gig, 3) Freelance online, 4) Sell unused items, 5) Invest in yourself to get better skills.',
    'goal': 'Set SMART goals: Specific (exact amount), Measurable (track progress), Achievable (realistic), Relevant (important to you), Time-bound (deadline).',
    'invest': 'Start investing early! Consider: Stocks, Bonds, Mutual Funds, Gold, Real Estate, or Cryptocurrency. Diversify to reduce risk. Consult a financial advisor.',
    'credit': 'Credit score tips: 1) Pay bills on time, 2) Keep credit card balance low, 3) Don\'t open too many cards, 4) Check your credit report regularly.',
    'debt': 'To manage debt: 1) List all debts, 2) Pay minimums on all, 3) Focus extra payments on highest interest debt, 4) Consider debt consolidation.',
    'emergency': 'Build an emergency fund with 3-6 months of expenses. This helps you handle unexpected costs without going into debt.',
    'tax': 'Tax-saving tips: 1) Claim all deductions, 2) Invest in tax-saving instruments (ELSS, FDs), 3) Keep receipts, 4) File returns on time.',
    'hello': 'Hi there! 👋 Welcome to Finance Tracker AI. Ask me about budgeting, savings, investments, or any financial questions!',
    'hi': 'Hello! 😊 How can I help you with your finances today?',
    'help': 'I can help you with: budgeting, saving, reducing expenses, increasing income, investment tips, credit scores, debt management, emergency funds, and tax planning. Just ask!',
    'default': 'That\'s a great question! 💡 For specific financial advice, I recommend speaking with a certified financial planner. In the meantime, try tracking your transactions in the dashboard and setting clear financial goals.'
};

function toggleAIChat() {
    const chatBox = document.getElementById('aiChatBox');
    const toggleBtn = document.getElementById('aiToggleBtn');
    chatBox.classList.toggle('hidden');
    toggleBtn.textContent = chatBox.classList.contains('hidden') ? '+' : '−';
}

function handleAIInput(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addAIMessage(message, 'user');
    input.value = '';

    // Get AI response
    const response = getAIResponse(message);
    setTimeout(() => {
        addAIMessage(response, 'bot');
    }, 300);
}

function addAIMessage(text, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getAIResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // Check for keyword matches
    for (const [key, response] of Object.entries(aiResponses)) {
        if (msg.includes(key)) {
            return response;
        }
    }

    // Default response
    return aiResponses['default'];
}
