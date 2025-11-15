// Simple auth state management
// In a real app, this would use proper authentication with JWT tokens

let currentUser: { id: string; username: string; email: string; role: string } | null = null;

export function setCurrentUser(user: { id: string; username: string; email: string; role: string }) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
    } else {
      // Default to admin for demo
      currentUser = {
        id: 'admin-id-placeholder',
        username: 'admin',
        email: 'admin@eveda.ai',
        role: 'admin'
      };
    }
  }
  return currentUser;
}

export function clearCurrentUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
}

// Auto-login as admin on first load for demo purposes
if (!localStorage.getItem('currentUser')) {
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  })
    .then(res => res.json())
    .then(user => {
      if (user.id) {
        setCurrentUser(user);
      }
    })
    .catch(() => {
      // Silent fail - will use placeholder
    });
}
