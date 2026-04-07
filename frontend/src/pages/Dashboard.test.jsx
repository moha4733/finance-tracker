import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import api from '../services/api'

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

describe('Dashboard page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        cleanup()
        localStorage.setItem('username', 'mo')
    })

    it('renders loaded KPIs and transactions', async () => {
        api.get.mockImplementation((url) => {
            if (url === '/categories') {
                return Promise.resolve({
                    data: [{ id: 1, name: 'Mad', type: 'EXPENSE' }]
                })
            }
            if (url === '/transactions') {
                return Promise.resolve({
                    data: [
                        {
                            id: 1,
                            amount: 120,
                            description: 'Rema',
                            date: '2026-04-01',
                            type: 'EXPENSE',
                            categoryId: 1,
                            categoryName: 'Mad'
                        },
                        {
                            id: 2,
                            amount: 1000,
                            description: 'Loen',
                            date: '2026-04-03',
                            type: 'INCOME',
                            categoryId: null,
                            categoryName: null
                        }
                    ]
                })
            }
            return Promise.resolve({ data: [] })
        })

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Hej mo/i)).toBeInTheDocument()
            expect(screen.getByText('Seneste transaktioner')).toBeInTheDocument()
            expect(screen.getByText('Rema')).toBeInTheDocument()
            expect(screen.getByText('Loen')).toBeInTheDocument()
        })
    })
})
