import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Home() {
    return (
        <div className="page">
            <div className="ambient-bg" aria-hidden>
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="noise" />
                <div className="grid" />
            </div>
            <div className="container card section" style={{ maxWidth: 760, marginTop: 70 }}>
                <p className="label">Finance Tracker</p>
                <h1 className="headline" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: 10 }}>
                    Smart overblik over din okonomi
                </h1>
                <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>
                    Log ind for at se dit dashboard, oprette kategorier og registrere transaktioner.
                </p>
                <div className="row">
                    <a className="btn btn-primary" href="/login">Login</a>
                    <a className="btn btn-secondary" href="/register">Opret konto</a>
                    <a className="btn btn-secondary" href="/dashboard">Dashboard</a>
                </div>
            </div>
        </div>
    )
}

function PrivateRoute({ children }) {
    let token = null
    try {
        token = localStorage.getItem('token')
    } catch (err) {
        token = null
    }
    return token ? children : <Navigate to="/login" />
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App