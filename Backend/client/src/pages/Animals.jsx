import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Animals = () => {
    const [animals, setAnimals] = useState([]);
    const [metadata, setMetadata] = useState({ breeds: [], species: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newAnimal, setNewAnimal] = useState({
        ID_Rasy: '',
        ID_Lokalizacji: '',
        Data_Urodzenia: '',
        Plec: 'Samica',
        Status: 'Zdrowe'
    });

    // Fetch Data
    const fetchData = () => {
        setLoading(true);
        authFetch('/api/animals')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch animals');
                return res.json();
            })
            .then(data => {
                console.log('Fetched animals:', data);
                if (Array.isArray(data)) {
                    setAnimals(data);
                } else {
                    console.error('Data is not an array:', data);
                    setAnimals([]);
                    setError('Received invalid data format from server');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching animals:', err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
        authFetch('/api/metadata')
            .then(res => res.json())
            .then(data => setMetadata(data))
            .catch(err => console.error('Error fetching metadata:', err));
    }, []);

    // Form Handlers
    const resetForm = () => {
        setNewAnimal({
            ID_Rasy: '',
            ID_Lokalizacji: '',
            Data_Urodzenia: '',
            Plec: 'Samica',
            Status: 'Zdrowe'
        });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (animal) => {
        setNewAnimal({
            ID_Rasy: animal.ID_Rasy,
            ID_Lokalizacji: animal.ID_Lokalizacji,
            Data_Urodzenia: animal.Data_Urodzenia,
            Plec: animal.Plec,
            Status: animal.Status
        });
        setEditingId(animal.ID_Zwierzecia);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const path = editingId ? `/api/animals/${editingId}` : '/api/animals';

        const method = editingId ? 'PUT' : 'POST';

        authFetch(path, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAnimal)
        })
            .then(res => res.json())
            .then(() => {
                resetForm();
                fetchData();
            })
            .catch(err => alert('Error saving animal: ' + err.message));
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading animals...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Zwierzęta</h1>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Zwierzę</button>
            </div>

            <div className="card" style={{ marginTop: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Gatunek</th>
                            <th style={{ padding: '10px' }}>Rasa</th>
                            <th style={{ padding: '10px' }}>Płeć</th>
                            <th style={{ padding: '10px' }}>Lokalizacja</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {animals.map(animal => (
                            <tr key={animal.ID_Zwierzecia} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{animal.ID_Zwierzecia.substring(0, 8)}...</td>
                                <td style={{ padding: '10px' }}>{animal.Nazwa_Gatunku}</td>
                                <td style={{ padding: '10px' }}>{animal.Nazwa_Rasy}</td>
                                <td style={{ padding: '10px' }}>{animal.Plec}</td>
                                <td style={{ padding: '10px' }}>{animal.Nazwa_Lokalizacji}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px',
                                        backgroundColor: animal.Status === 'Zdrowe' ? 'rgba(3, 218, 198, 0.2)' : 'rgba(207, 102, 121, 0.2)',
                                        color: animal.Status === 'Zdrowe' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {animal.Status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button className="btn" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => handleEdit(animal)}>Edytuj</button>
                                </td>
                            </tr>
                        ))}
                        {animals.length === 0 && <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>Brak danych.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
                        <h2>{editingId ? 'Edytuj Zwierzę' : 'Dodaj Nowe Zwierzę'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                            <select
                                style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                value={newAnimal.ID_Rasy}
                                onChange={e => setNewAnimal({ ...newAnimal, ID_Rasy: e.target.value })}
                                required
                            >
                                <option value="">Wybierz Rasę</option>
                                {metadata.breeds.map(b => (
                                    <option key={b.ID_Rasy} value={b.ID_Rasy}>{b.Nazwa_Rasy}</option>
                                ))}
                            </select>

                            <select
                                style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                value={newAnimal.ID_Lokalizacji}
                                onChange={e => setNewAnimal({ ...newAnimal, ID_Lokalizacji: e.target.value })}
                                required
                            >
                                <option value="">Wybierz Lokalizację</option>
                                {metadata.locations.map(l => (
                                    <option key={l.ID_Lokalizacji} value={l.ID_Lokalizacji}>{l.Nazwa_Lokalizacji}</option>
                                ))}
                            </select>

                            <input
                                type="date"
                                style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                value={newAnimal.Data_Urodzenia}
                                onChange={e => setNewAnimal({ ...newAnimal, Data_Urodzenia: e.target.value })}
                                required
                            />

                            <select
                                style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                value={newAnimal.Plec}
                                onChange={e => setNewAnimal({ ...newAnimal, Plec: e.target.value })}
                            >
                                <option value="Samica">Samica</option>
                                <option value="Samiec">Samiec</option>
                            </select>

                            <select
                                style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                value={newAnimal.Status}
                                onChange={e => setNewAnimal({ ...newAnimal, Status: e.target.value })}
                            >
                                <option value="Zdrowe">Zdrowe</option>
                                <option value="Chore">Chore</option>
                                <option value="Kwarantanna">Kwarantanna</option>
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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

export default Animals;
