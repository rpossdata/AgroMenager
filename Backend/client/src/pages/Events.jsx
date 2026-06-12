import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';

const Events = () => {
    const [tab, setTab] = useState('medical');
    const [medicalEvents, setMedicalEvents] = useState([]);
    const [feedingEvents, setFeedingEvents] = useState([]);

    const [metadata, setMetadata] = useState({ employees: [], animals: [], locations: [], feed: [] });
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [medicalItem, setMedicalItem] = useState({ ID_Zwierzecia: '', ID_Pracownika: '', Data_Zdarzenia: '', Typ_Zdarzenia: 'Szczepienie', Opis: '' });
    const [feedingItem, setFeedingItem] = useState({ ID_Lokalizacji: '', ID_Paszy: '', ID_Pracownika: '', Data_Karmienia: '', Ilosc_Paszy: 0 });

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            authFetch('/api/events/medical').then(res => res.json()),
            authFetch('/api/events/feeding').then(res => res.json()),
            authFetch('/api/metadata').then(res => res.json()),
            authFetch('/api/animals').then(res => res.json())
        ])
            .then(([medData, feedData, metaData, animalsData]) => {
                setMedicalEvents(Array.isArray(medData) ? medData : []);
                setFeedingEvents(Array.isArray(feedData) ? feedData : []);
                setMetadata({
                    ...metaData,
                    animals: Array.isArray(animalsData) ? animalsData : [],
                    employees: Array.isArray(metaData.employees) ? metaData.employees : [],
                    feed: Array.isArray(metaData.feed) ? metaData.feed : [],
                    locations: Array.isArray(metaData.locations) ? metaData.locations : []
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                alert('Błąd pobierania danych: ' + err.message);
            });
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setMedicalItem({ ID_Zwierzecia: '', ID_Pracownika: '', Data_Zdarzenia: '', Typ_Zdarzenia: 'Szczepienie', Opis: '' });
        setFeedingItem({ ID_Lokalizacji: '', ID_Paszy: '', ID_Pracownika: '', Data_Karmienia: '', Ilosc_Paszy: 0 });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEditMedical = (item) => {
        setMedicalItem({
            ID_Zwierzecia: item.id_zwierzecia,
            ID_Pracownika: item.id_pracownika,
            Data_Zdarzenia: item.data_zdarzenia,
            Typ_Zdarzenia: item.typ_zdarzenia,
            Opis: item.opis
        });
        setEditingId(item.id_zdarzenia_medycznego);
        setShowModal(true);
    };

    const handleEditFeeding = (item) => {
        setFeedingItem({
            ID_Lokalizacji: item.id_lokalizacji,
            ID_Paszy: item.id_paszy,
            ID_Pracownika: item.id_pracownika,
            Data_Karmienia: item.data_karmienia,
            Ilosc_Paszy: item.ilosc_paszy
        });
        setEditingId(item.id_zdarzenia_karmienia);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isMedical = tab === 'medical';
        const pathBase = isMedical ? '/api/events/medical' : '/api/events/feeding';
        const path = editingId ? `${pathBase}/${editingId}` : pathBase;
        const method = editingId ? 'PUT' : 'POST';
        const body = isMedical ? medicalItem : feedingItem;

        authFetch(path, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(() => { resetForm(); fetchData(); });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Zdarzenia</h1>
                <div>
                    <button className={`btn ${tab !== 'medical' ? 'btn-secondary' : ''}`} onClick={() => setTab('medical')} style={{ marginRight: '10px' }}>Medyczne</button>
                    <button className={`btn ${tab !== 'feeding' ? 'btn-secondary' : ''}`} onClick={() => setTab('feeding')}>Karmienie</button>
                </div>
                <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>+ Dodaj Zdarzenie</button>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                {tab === 'medical' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>Data</th>
                            <th style={{ padding: '10px' }}>Typ</th>
                            <th style={{ padding: '10px' }}>Zwierzę</th>
                            <th style={{ padding: '10px' }}>Weterynarz</th>
                            <th style={{ padding: '10px' }}>Opis</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {medicalEvents.map(item => (
                            <tr key={item.id_zdarzenia_medycznego} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{item.data_zdarzenia}</td>
                                <td style={{ padding: '10px' }}>{item.typ_zdarzenia}</td>
                                <td style={{ padding: '10px' }}>{item.id_zwierzecia ? item.id_zwierzecia.substring(0, 8) + '...' : 'N/A'}</td>
                                <td style={{ padding: '10px' }}>{item.nazwisko_weterynarza || item.id_pracownika}</td>
                                <td style={{ padding: '10px' }}>{item.opis}</td>
                                <td style={{ padding: '10px' }}>
                                    <button className="btn" onClick={() => handleEditMedical(item)}>Edytuj</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px' }}>Data</th>
                            <th style={{ padding: '10px' }}>Lokalizacja</th>
                            <th style={{ padding: '10px' }}>Pasza</th>
                            <th style={{ padding: '10px' }}>Pracownik</th>
                            <th style={{ padding: '10px' }}>Ilość</th>
                            <th style={{ padding: '10px' }}>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {feedingEvents.map(item => (
                            <tr key={item.id_zdarzenia_karmienia} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{item.data_karmienia}</td>
                                <td style={{ padding: '10px' }}>{item.nazwa_lokalizacji}</td>
                                <td style={{ padding: '10px' }}>{item.nazwa_paszy}</td>
                                <td style={{ padding: '10px' }}>{item.nazwisko_pracownika}</td>
                                <td style={{ padding: '10px' }}>{item.ilosc_paszy}</td>
                                <td style={{ padding: '10px' }}>
                                    <button className="btn" onClick={() => handleEditFeeding(item)}>Edytuj</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '500px' }}>
                        <h2>{editingId ? 'Edytuj' : 'Dodaj'} {tab === 'medical' ? 'Zdarzenie Medyczne' : 'Karmienie'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                            {tab === 'medical' && (
                                <>
                                    <select value={medicalItem.ID_Zwierzecia} onChange={e => setMedicalItem({ ...medicalItem, ID_Zwierzecia: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="">Wybierz Zwierzę</option>
                                        {Array.isArray(metadata.animals) && metadata.animals.map(a => <option key={a.id_zwierzecia} value={a.id_zwierzecia}>{a.id_zwierzecia ? a.id_zwierzecia.substring(0, 8) : '???'}... - {a.nazwa_rasy}</option>)}
                                    </select>
                                    <select value={medicalItem.ID_Pracownika} onChange={e => setMedicalItem({ ...medicalItem, ID_Pracownika: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="">Wybierz Weterynarza</option>
                                        {metadata.employees.map(e => <option key={e.id_pracownika} value={e.id_pracownika}>{e.imie} {e.nazwisko} ({e.stanowisko})</option>)}
                                    </select>
                                    <input type="date" value={medicalItem.Data_Zdarzenia} onChange={e => setMedicalItem({ ...medicalItem, Data_Zdarzenia: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                                    <select value={medicalItem.Typ_Zdarzenia} onChange={e => setMedicalItem({ ...medicalItem, Typ_Zdarzenia: e.target.value })} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="Szczepienie">Szczepienie</option>
                                        <option value="Choroba">Choroba</option>
                                        <option value="Kontrola">Kontrola</option>
                                        <option value="Zabieg">Zabieg</option>
                                    </select>
                                    <textarea placeholder="Opis" value={medicalItem.Opis} onChange={e => setMedicalItem({ ...medicalItem, Opis: e.target.value })} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                                </>
                            )}

                            {tab === 'feeding' && (
                                <>
                                    <select value={feedingItem.ID_Lokalizacji} onChange={e => setFeedingItem({ ...feedingItem, ID_Lokalizacji: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="">Wybierz Lokalizację</option>
                                        {metadata.locations.map(l => <option key={l.id_lokalizacji} value={l.id_lokalizacji}>{l.nazwa_lokalizacji}</option>)}
                                    </select>
                                    <select value={feedingItem.ID_Paszy} onChange={e => setFeedingItem({ ...feedingItem, ID_Paszy: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="">Wybierz Paszę</option>
                                        {metadata.feed.map(f => <option key={f.id_paszy} value={f.id_paszy}>{f.nazwa_paszy} ({f.jednostka})</option>)}
                                    </select>
                                    <select value={feedingItem.ID_Pracownika} onChange={e => setFeedingItem({ ...feedingItem, ID_Pracownika: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>
                                        <option value="">Wybierz Pracownika</option>
                                        {metadata.employees.map(e => <option key={e.id_pracownika} value={e.id_pracownika}>{e.imie} {e.nazwisko}</option>)}
                                    </select>
                                    <input type="datetime-local" value={feedingItem.Data_Karmienia} onChange={e => setFeedingItem({ ...feedingItem, Data_Karmienia: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                                    <input type="number" placeholder="Ilość" value={feedingItem.Ilosc_Paszy} onChange={e => setFeedingItem({ ...feedingItem, Ilosc_Paszy: e.target.value })} required style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }} />
                                </>
                            )}

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
export default Events;