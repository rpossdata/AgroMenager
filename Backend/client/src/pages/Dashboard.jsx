import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';
import { Activity, AlertTriangle, Milk, Cloud, Sun, CloudRain, Wind } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ animalCount: 0, lowFeed: 0, productionToday: 0 });
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        // Fetch dashboard stats from our backend
        authFetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching dashboard stats:', err));

        // Fetch external API (Open-Meteo Weather for Warsaw as default for AgroManager)
        fetch('https://api.open-meteo.com/v1/forecast?latitude=52.2298&longitude=21.0118&current_weather=true')
            .then(res => res.json())
            .then(data => {
                if (data && data.current_weather) {
                    setWeather(data.current_weather);
                }
            })
            .catch(err => console.error('Error fetching weather:', err));
    }, []);

    const getWeatherIcon = (code) => {
        // Basic WMO weather codes mapping
        if (code === 0 || code === 1) return <Sun color="#f1c40f" size={40} />;
        if (code >= 2 && code <= 3) return <Cloud color="#bdc3c7" size={40} />;
        if (code >= 51 && code <= 65) return <CloudRain color="#3498db" size={40} />;
        return <Wind color="#95a5a6" size={40} />;
    };

    return (
        <div>
            <h1>Pulpit Nawigacyjny</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>

                {/* Card 1 */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Liczba Zwierząt</p>
                            <h2 style={{ fontSize: '2em' }}>{stats.animalCount}</h2>
                        </div>
                        <Activity color="var(--accent)" size={40} />
                    </div>
                </div>

                {/* Card 2 */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Niski Stan Paszy</p>
                            <h2 style={{ fontSize: '2em', color: stats.lowFeed > 0 ? 'var(--danger)' : 'var(--success)' }}>{stats.lowFeed}</h2>
                        </div>
                        <AlertTriangle color={stats.lowFeed > 0 ? "var(--danger)" : "var(--success)"} size={40} />
                    </div>
                </div>

                {/* Card 3 */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Produkcja Dzisiaj</p>
                            <h2 style={{ fontSize: '2em' }}>{stats.productionToday}</h2>
                        </div>
                        <Milk color="var(--success)" size={40} />
                    </div>
                </div>

                {/* Card 4 - External API */}
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.2) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Pogoda (zewn. API)</p>
                            {weather ? (
                                <h2 style={{ fontSize: '2em' }}>
                                    {weather.temperature}°C
                                </h2>
                            ) : (
                                <p>Ładowanie...</p>
                            )}
                            <small style={{ color: 'var(--text-secondary)' }}>Wiatr: {weather?.windspeed} km/h</small>
                        </div>
                        {weather ? getWeatherIcon(weather.weathercode) : <Cloud color="gray" size={40} />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
