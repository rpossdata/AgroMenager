import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Feed = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ Nazwa_Paszy: '', Jednostka: 'kg', Stan_Magazynowy: 0 });

    const fetchData = () => {
        setLoading(true);
        authFetch('/api/feed')
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
            .then(data => { setFeed(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setNewItem({ Nazwa_Paszy: '', Jednostka: 'kg', Stan_Magazynowy: 0 });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setNewItem({ Nazwa_Paszy: item.Nazwa_Paszy, Jednostka: item.Jednostka, Stan_Magazynowy: item.Stan_Magazynowy });
        setEditingId(item.ID_Paszy);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const path = editingId ? `/api/feed/${editingId}` : '/api/feed';
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
                <h1>Pasza</h1>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Paszę</button>
            </div>
            <div className="card" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>Nazwa</th>
                            <th style={{ padding: '10px' }}>Jednostka</th>
                            <th style={{ padding: '10px' }}>Stan Magazynowy</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feed.map(item => (
                            <tr key={item.ID_Paszy} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{item.Nazwa_Paszy}</td>
                                <td style={{ padding: '10px' }}>{item.Jednostka}</td>
                                <td style={{ padding: '10px' }}>{item.Stan_Magazynowy}</td>
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
                        <h2>{editingId ? 'Edytuj' : 'Dodaj'} Paszę</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Nazwa" value={newItem.Nazwa_Paszy} onChange={e => setNewItem({ ...newItem, Nazwa_Paszy: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <input placeholder="Jednostka" value={newItem.Jednostka} onChange={e => setNewItem({ ...newItem, Jednostka: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <input type="number" placeholder="Ilość" value={newItem.Stan_Magazynowy} onChange={e => setNewItem({ ...newItem, Stan_Magazynowy: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
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
export default Feed;
