import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import Employees from './pages/Employees';
import Feed from './pages/Feed';
import Locations from './pages/Locations';
import Production from './pages/Production';
import Events from './pages/Events';
import Login from './pages/Login';
import { getToken } from './api';

function PrivateRoute({ children }) {
    if (!getToken()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={(
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    )}
                >
                    <Route index element={<Dashboard />} />
                    <Route path="animals" element={<Animals />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="feed" element={<Feed />} />
                    <Route path="locations" element={<Locations />} />
                    <Route path="production" element={<Production />} />
                    <Route path="events" element={<Events />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
