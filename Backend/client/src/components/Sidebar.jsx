import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, HeartPulse, Activity, Beef, Wheat, MapPin, LogOut } from 'lucide-react';
import { clearToken } from '../api';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearToken();
        navigate('/login', { replace: true });
    };

    const navStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        color: isActive ? '#fff' : '#aaa',
        backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
        borderRight: isActive ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'all 0.2s',
    });

    return (
        <div style={{ width: '250px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ color: 'var(--accent)' }}>AgroManager</h2>
            </div>
            <nav style={{ marginTop: '20px' }}>
                <NavLink to="/" style={navStyle}>
                    <LayoutDashboard size={20} style={{ marginRight: '10px' }} /> Dashboard
                </NavLink>
                <NavLink to="/animals" style={navStyle}>
                    <Beef size={20} style={{ marginRight: '10px' }} /> Zwierzęta
                </NavLink>
                <NavLink to="/employees" style={navStyle}>
                    <Users size={20} style={{ marginRight: '10px' }} /> Pracownicy
                </NavLink>
                <NavLink to="/feed" style={navStyle}>
                    <Wheat size={20} style={{ marginRight: '10px' }} /> Pasza
                </NavLink>
                <NavLink to="/locations" style={navStyle}>
                    <MapPin size={20} style={{ marginRight: '10px' }} /> Lokalizacje
                </NavLink>
                <NavLink to="/production" style={navStyle}>
                    <HeartPulse size={20} style={{ marginRight: '10px' }} /> Produkcja
                </NavLink>
                <NavLink to="/events" style={navStyle}>
                    <Activity size={20} style={{ marginRight: '10px' }} /> Zdarzenia
                </NavLink>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleLogout}
                    style={{ margin: '20px', width: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <LogOut size={18} /> Wyloguj
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
