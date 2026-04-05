import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()
    const username = localStorage.getItem('username')

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        navigate('/login')
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Velkommen, {username}! 👋</h2>
                <button onClick={logout}>Log ud</button>
            </div>
            <p>Dashboard kommer snart...</p>
        </div>
    )
}

export default Dashboard