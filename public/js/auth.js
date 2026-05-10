const TOKEN_KEY = 'jwt_token';

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function isExpired(payload) {
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
}

function getUserRoles() {
    const token = getToken();
    if (!token) return [];
    const payload = decodeJwt(token);
    if (!payload || isExpired(payload)) return [];
    return payload.roles || [];
}

function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    const payload = decodeJwt(token);
    return payload && !isExpired(payload);
}

function guardRoute(requiredRoles = []) {
    if (!isAuthenticated()) {
        removeToken();
        window.location.href = '/signIn';
        return false;
    }
    if (requiredRoles.length > 0) {
        const roles = getUserRoles();
        const hasRole = requiredRoles.some(r => roles.includes(r));
        if (!hasRole) {
            window.location.href = '/403';
            return false;
        }
    }
    return true;
}

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(path, { ...options, headers });

    if (response.status === 401) {
        removeToken();
        window.location.href = '/signIn';
        throw new Error('Sesión expirada');
    }

    if (response.status === 403) {
        window.location.href = '/403';
        throw new Error('Acceso denegado');
    }

    return response;
}

function logout() {
    removeToken();
    window.location.href = '/signIn';
}

function updateNavbar() {
    const authenticated = isAuthenticated();
    const roles = getUserRoles();
    const isAdmin = roles.includes('admin');

    const guestLinks = document.getElementById('nav-guest');
    const userLinks = document.getElementById('nav-user');
    const adminLinks = document.getElementById('nav-admin');

    if (guestLinks) guestLinks.style.display = authenticated ? 'none' : 'block';
    if (userLinks) userLinks.style.display = authenticated ? 'block' : 'none';
    if (adminLinks) adminLinks.style.display = isAdmin ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
