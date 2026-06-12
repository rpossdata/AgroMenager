import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Production = () => {
    const [production, setProduction] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ ID_Zwierzecia: '', Data_Produkcji: '', Typ_Produktu: 'Mleko', Ilosc: 0, Jednostka: 'l' });

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            authFetch('/api/production').then(res => res.json()),
            authFetch('/api/animals').then(res => res.json())
        ])
            .then(([prodData, animalData]) => {
                setProduction(prodData);
                setAnimals(animalData);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setNewItem({ ID_Zwierzecia: '', Data_Produkcji: '', Typ_Produktu: 'Mleko', Ilosc: 0, Jednostka: 'l' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setNewItem({
            ID_Zwierzecia: item.id_zwierzecia,
            Data_Produkcji: item.data_produkcji,
            Typ_Produktu: item.typ_produktu,
            Ilosc: item.ilosc,
            Jednostka: item.jednostka
        });
        setEditingId(item.id_produkcji);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const path = editingId ? `/api/production/${editingId}` : '/api/production';
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
                <h1>Produkcja</h1>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Produkcję</button>
            </div>
            <div className="card" style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>Zwierzę (ID)</th>
                        <th style={{ padding: '10px' }}>Produkt</th>
                        <th style={{ padding: '10px' }}>Ilość</th>
                        <th style={{ padding: '10px' }}>Jednostka</th>
                        <th style={{ padding: '10px' }}>Akcje</th>
                    </tr>
                    </thead>
                    <tbody>
                    {production.map(item => (
                        <tr key={item.id_produkcji} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '10px' }}>{item.data_produkcji}</td>
                            <td style={{ padding: '10px' }}>{item.id_zwierzecia ? item.id_zwierzecia.substring(0, 8) + '...' : 'N/A'}</td>
                            <td style={{ padding: '10px' }}>{item.typ_produktu}</td>
                            <td style={{ padding: '10px' }}>{item.ilosc}</td>
                            <td style={{ padding: '10px' }}>{item.jednostka}</td>
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
                        <h2>{editingId ? 'Edytuj' : 'Dodaj'} Produkcję</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <select value={newItem.ID_Zwierzecia} onChange={e => setNewItem({ ...newItem, ID_Zwierzecia: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                <option value="">Wybierz Zwierzę</option>
                                {animals.map(a => <option key={a.id_zwierzecia} value={a.id_zwierzecia}>{a.id_zwierzecia ? a.id_zwierzecia.substring(0, 8) : ''}... - {a.nazwa_rasy}</option>)}
                            </select>
                            <input type="date" value={newItem.Data_Produkcji} onChange={e => setNewItem({ ...newItem, Data_Produkcji: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <select value={newItem.Typ_Produktu} onChange={e => setNewItem({ ...newItem, Typ_Produktu: e.target.value })} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                <option value="Mleko">Mleko</option>
                                <option value="Wełna">Wełna</option>
                                <option value="Jaja">Jaja</option>
                            </select>
                            <input type="number" placeholder="Ilość" value={newItem.Ilosc} onChange={e => setNewItem({ ...newItem, Ilosc: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                            <input placeholder="Jednostka" value={newItem.Jednostka} onChange={e => setNewItem({ ...newItem, Jednostka: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
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
export default Production;