// ===== Configuration =====
const CONFIG = {
    // Production URL - Change to webhook-test for testing
    webhookUrl: localStorage.getItem('webhookUrl') || 'http://localhost:5678/webhook/messages',
    storageKey: 'webhookUrl'
};

// ===== DOM Elements =====
const elements = {
    chatContainer: document.getElementById('chatContainer'),
    messagesContainer: document.getElementById('messagesContainer'),
    welcomeSection: document.getElementById('welcomeSection'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    settingsPanel: document.getElementById('settingsPanel'),
    webhookUrlInput: document.getElementById('webhookUrl')
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Load saved webhook URL
    if (CONFIG.webhookUrl) {
        elements.webhookUrlInput.value = CONFIG.webhookUrl;
    }

    // Focus input
    elements.messageInput.focus();
});

// ===== Settings Functions =====
function toggleSettings() {
    elements.settingsPanel.classList.toggle('active');
}

function saveSettings() {
    const url = elements.webhookUrlInput.value.trim();
    if (url) {
        CONFIG.webhookUrl = url;
        localStorage.setItem(CONFIG.storageKey, url);
        showNotification('Settings saved successfully!', 'success');
    } else {
        showNotification('Please enter a valid webhook URL', 'error');
    }
    toggleSettings();
}

// ===== Message Functions =====
function sendQuickMessage(message) {
    elements.messageInput.value = message;
    sendMessage();
}

async function sendMessage() {
    const message = elements.messageInput.value.trim();

    if (!message) return;

    if (!CONFIG.webhookUrl) {
        showNotification('Please configure your webhook URL in settings first!', 'error');
        toggleSettings();
        return;
    }

    // Hide welcome section
    if (elements.welcomeSection) {
        elements.welcomeSection.style.display = 'none';
    }

    // Add user message
    addMessage(message, 'user');

    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';

    // Disable send button
    elements.sendBtn.disabled = true;

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
        // Send message to webhook
        const response = await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                record: {
                    content: message
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Remove typing indicator
        typingIndicator.remove();

        // Extract response text
        let responseText = '';

        // Handle different response formats from n8n
        if (Array.isArray(data)) {
            // Response is an array (common n8n format)
            if (data.length > 0 && data[0].output) {
                responseText = data[0].output;
            } else if (data.length > 0 && data[0].text) {
                responseText = data[0].text;
            } else if (data.length > 0 && data[0].response) {
                responseText = data[0].response;
            } else {
                responseText = JSON.stringify(data, null, 2);
            }
        } else if (data.output) {
            responseText = data.output;
        } else if (data.text) {
            responseText = data.text;
        } else if (data.response) {
            responseText = data.response;
        } else if (typeof data === 'string') {
            responseText = data;
        } else {
            responseText = JSON.stringify(data, null, 2);
        }

        // Add assistant message
        addMessage(responseText, 'assistant');

    } catch (error) {
        console.error('Error sending message:', error);

        // Remove typing indicator
        typingIndicator.remove();

        // Add error message
        addMessage(`Sorry, I encountered an error: ${error.message}. Please check your webhook URL and try again.`, 'error');
    }

    // Re-enable send button
    elements.sendBtn.disabled = false;
    elements.messageInput.focus();
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatarSVG = type === 'user'
        ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4ZM16 15H13V18H11V15H8V13H11V10H13V13H16V15Z" fill="currentColor"/>
           </svg>`;

    // Format content - convert line breaks to paragraphs
    const formattedContent = formatMessage(content);

    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarSVG}
        </div>
        <div class="message-content">
            ${formattedContent}
        </div>
    `;

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessage(content) {
    // Convert markdown-like formatting to HTML
    let formatted = content
        // Escape HTML first
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Line breaks to paragraphs
        .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

    return formatted;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';

    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4ZM16 15H13V18H11V15H8V13H11V10H13V13H16V15Z" fill="currentColor"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    elements.messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    return typingDiv;
}

// ===== Utility Functions =====
function scrollToBottom() {
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Close settings when clicking outside =====
document.addEventListener('click', (event) => {
    const settingsPanel = elements.settingsPanel;
    const settingsBtn = document.querySelector('.settings-btn');

    if (!settingsPanel.contains(event.target) && !settingsBtn.contains(event.target)) {
        settingsPanel.classList.remove('active');
    }
});
