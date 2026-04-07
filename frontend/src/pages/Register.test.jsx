import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from './Register'
import api from '../services/api'

vi.mock('../services/api', () => ({
    default: {
        post: vi.fn()
    }
}))

describe('Register page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        cleanup()
    })

    it('shows field level validation errors from API', async () => {
        api.post.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Valideringsfejl i input',
                    fieldErrors: {
                        username: 'Brugernavn er paakraevet',
                        email: 'Email-format er ugyldigt',
                        password: 'Kodeord skal vaere mindst 6 tegn'
                    }
                }
            }
        })

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        )

        fireEvent.change(screen.getAllByLabelText('Brugernavn')[0], { target: { value: 'a' } })
        fireEvent.change(screen.getAllByLabelText('Email')[0], { target: { value: 'a@test.com' } })
        fireEvent.change(screen.getAllByLabelText('Kodeord')[0], { target: { value: '123456' } })
        fireEvent.click(screen.getByRole('button', { name: /opret konto/i }))

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled()
            expect(screen.getAllByText('Brugernavn er paakraevet').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Email-format er ugyldigt').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Kodeord skal vaere mindst 6 tegn').length).toBeGreaterThan(0)
        })
    })

})
