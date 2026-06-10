import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ Imie: '', Nazwisko: '', Stanowisko: '' });

    const fetchData = () => {
        setLoading(true);
        authFetch('/api/employees')
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
            .then(data => { setEmployees(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setNewItem({ Imie: '', Nazwisko: '', Stanowisko: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setNewItem({ Imie: item.Imie, Nazwisko: item.Nazwisko, Stanowisko: item.Stanowisko });
        setEditingId(item.ID_Pracownika);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const path = editingId ? `/api/employees/${editingId}` : '/api/employees';
        const method = editingId ? 'PUT' : 'POST';

        authFetch(path, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        }).then(() => { resetForm(); fetchData(); });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Pracownicy</h1>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Pracownika</button>
            </div>
            <div className="card" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>Imię</th>
                            <th style={{ padding: '10px' }}>Nazwisko</th>
                            <th style={{ padding: '10px' }}>Stanowisko</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(item => (
                            <tr key={item.ID_Pracownika} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{item.Imie}</td>
                                <td style={{ padding: '10px' }}>{item.Nazwisko}</td>
                                <td style={{ padding: '10px' }}>{item.Stanowisko}</td>
                                <td style={{ padding: '10px' }}>
                                    <button className="btn" onClick={() => handleEdit(item)}>Edytuj</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h2>{editingId ? 'Edytuj' : 'Dodaj'} Pracownika</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Imię" value={newItem.Imie} onChange={e => setNewItem({ ...newItem, Imie: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <input placeholder="Nazwisko" value={newItem.Nazwisko} onChange={e => setNewItem({ ...newItem, Nazwisko: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <input placeholder="Stanowisko" value={newItem.Stanowisko} onChange={e => setNewItem({ ...newItem, Stanowisko: e.target.value })} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Anuluj</button>
                                <button type="submit" className="btn">Zapisz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Employees;
