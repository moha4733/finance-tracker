import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { getApiErrorMessage } from '../services/errors'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

function Login() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await api.post('/auth/login', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', res.data.username)
            navigate('/dashboard')
        } catch (err) {
            setError(getApiErrorMessage(err, 'Forkert brugernavn eller password'))
        }
    }

    return (
        <div className="page">
            <div className="ambient-bg" aria-hidden>
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="noise" />
                <div className="grid" />
            </div>
            <Card className="auth-card">
                <p className="label">Autentificering</p>
                <h2 className="headline" style={{ fontSize: '2rem', marginTop: 0, marginBottom: 8 }}>Log ind</h2>
                <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>Velkommen tilbage. Fortsaet hvor du slap.</p>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <Input
                        id="login-username"
                        label="Brugernavn"
                        required
                        placeholder="ditbrugernavn"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                    <Input
                        id="login-password"
                        label="Kodeord"
                        required
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <Button className="" style={{ width: '100%', marginTop: 6 }} type="submit">
                        Login
                    </Button>
                </form>

                <p className="muted" style={{ marginBottom: 0 }}>
                    Har du ikke en konto? <Link className="link" to="/register">Opret her</Link>
                </p>
            </Card>
        </div>
    )
}

export default Login