import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, setToken, getToken } from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (getToken()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || 'Logowanie nie powiodło się');
                setLoading(false);
                return;
            }
            setToken(data.token);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Błąd sieci');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary, #1a1a1a)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                <h1 style={{ marginBottom: '8px', color: 'var(--accent, #03dac6)' }}>AgroManager</h1>
                <p style={{ color: 'var(--text-secondary, #aaa)', marginBottom: '24px' }}>Zaloguj się, aby kontynuować</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        autoComplete="username"
                        placeholder="Nazwa użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ padding: '12px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                    />
                    <input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '12px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                    />
                    {error && <p style={{ color: 'var(--danger, #cf6679)', margin: 0 }}>{error}</p>}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Logowanie…' : 'Zaloguj'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
