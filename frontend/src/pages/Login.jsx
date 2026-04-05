import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

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
            setError('Forkert brugernavn eller password')
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        placeholder="Brugernavn"
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px' }}>
                    Login
                </button>
            </form>
            <p>Har du ikke en konto? <Link to="/register">Opret her</Link></p>
        </div>
    )
}

export default Login