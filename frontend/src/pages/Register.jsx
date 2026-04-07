import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { getApiErrorMessage, getApiFieldErrors } from '../services/errors'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setFieldErrors((prev) => {
            if (!prev[key]) return prev
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})
        setLoading(true)
        try {
            const res = await api.post('/auth/register', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', res.data.username)
            navigate('/dashboard')
        } catch (err) {
            setError(getApiErrorMessage(err))
            setFieldErrors(getApiFieldErrors(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="ambient-bg" aria-hidden>
                <div className="blob blob-1" />
                <div className="blob blob-3" />
                <div className="noise" />
                <div className="grid" />
            </div>
            <Card className="auth-card">
                <p className="label">Ny konto</p>
                <h2 className="headline" style={{ fontSize: '2rem', marginTop: 0, marginBottom: 8 }}>Opret bruger</h2>
                <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>Fa adgang til dashboard og transaktioner.</p>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <Input
                        id="register-username"
                        label="Brugernavn"
                        required
                        error={fieldErrors.username}
                        value={form.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                    />
                    <Input
                        id="register-email"
                        label="Email"
                        required
                        type="email"
                        error={fieldErrors.email}
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <Input
                        id="register-password"
                        label="Kodeord"
                        required
                        minLength={6}
                        type="password"
                        error={fieldErrors.password}
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                    />
                    <Button style={{ width: '100%', marginTop: 6 }} type="submit" loading={loading}>
                        Opret konto
                    </Button>
                </form>
                <p className="muted" style={{ marginBottom: 0 }}>
                    Har du allerede en konto? <Link className="link" to="/login">Login her</Link>
                </p>
            </Card>
        </div>
    )
}

export default Register