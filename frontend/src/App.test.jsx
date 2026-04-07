import { cleanup, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App routing', () => {
    beforeEach(() => {
        cleanup()
        localStorage.clear()
        window.history.pushState({}, '', '/')
    })

    it('renders home content', () => {
        render(<App />)
        expect(screen.getByText('Finance Tracker')).toBeInTheDocument()
    })

    it('redirects dashboard to login when no token', () => {
        window.history.pushState({}, '', '/dashboard')
        render(<App />)
        expect(screen.getByText('Log ind')).toBeInTheDocument()
    })
})
