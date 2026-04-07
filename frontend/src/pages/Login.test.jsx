import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import api from '../services/api'

vi.mock('../services/api', () => ({
    default: {
        post: vi.fn()
    }
}))

describe('Login page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        cleanup()
    })

    it('shows API error message on failed login', async () => {
        api.post.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Forkert brugernavn eller kodeord'
                }
            }
        })

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        fireEvent.change(screen.getByLabelText('Brugernavn'), { target: { value: 'mo' } })
        fireEvent.change(screen.getByLabelText('Kodeord'), { target: { value: 'badpass' } })
        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByText('Forkert brugernavn eller kodeord')).toBeInTheDocument()
        })
    })
})
