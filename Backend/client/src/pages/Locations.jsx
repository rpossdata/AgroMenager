import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ Nazwa_Lokalizacji: '', Typ_Lokalizacji: 'Obora', Pojemnosc: 0 });

    const fetchData = () => {
        setLoading(true);
        authFetch('/api/locations')
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
            .then(data => { setLocations(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setNewItem({ Nazwa_Lokalizacji: '', Typ_Lokalizacji: 'Obora', Pojemnosc: 0 });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setNewItem({ Nazwa_Lokalizacji: item.Nazwa_Lokalizacji, Typ_Lokalizacji: item.Typ_Lokalizacji, Pojemnosc: item.Pojemnosc });
        setEditingId(item.ID_Lokalizacji);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const path = editingId ? `/api/locations/${editingId}` : '/api/locations';
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
                <h1>Lokalizacje</h1>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Lokalizację</button>
            </div>
            <div className="card" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>Nazwa</th>
                            <th style={{ padding: '10px' }}>Typ</th>
                            <th style={{ padding: '10px' }}>Pojemność</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map(item => (
                            <tr key={item.ID_Lokalizacji} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{item.Nazwa_Lokalizacji}</td>
                                <td style={{ padding: '10px' }}>{item.Typ_Lokalizacji}</td>
                                <td style={{ padding: '10px' }}>{item.Pojemnosc}</td>
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
                        <h2>{editingId ? 'Edytuj' : 'Dodaj'} Lokalizację</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Nazwa" value={newItem.Nazwa_Lokalizacji} onChange={e => setNewItem({ ...newItem, Nazwa_Lokalizacji: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <select value={newItem.Typ_Lokalizacji} onChange={e => setNewItem({ ...newItem, Typ_Lokalizacji: e.target.value })} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                <option value="Obora">Obora</option>
                                <option value="Chlewnia">Chlewnia</option>
                                <option value="Kurnik">Kurnik</option>
                                <option value="Pastwisko">Pastwisko</option>
                                <option value="Magazyn">Magazyn</option>
                            </select>
                            <input type="number" placeholder="Pojemność" value={newItem.Pojemnosc} onChange={e => setNewItem({ ...newItem, Pojemnosc: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
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
export default Locations;
