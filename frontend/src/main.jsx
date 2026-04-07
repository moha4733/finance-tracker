import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, message: '' }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, message: String(error) }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Frontend crash:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ maxWidth: '680px', margin: '80px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                    <h1>Frontend fejl</h1>
                    <p>Der opstod en fejl i React-appen.</p>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: '10px' }}>
                        {this.state.message}
                    </pre>
                </div>
            )
        }
        return this.props.children
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
)