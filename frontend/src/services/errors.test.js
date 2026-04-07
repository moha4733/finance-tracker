import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, getApiFieldErrors } from './errors'

describe('errors service', () => {
    it('returns first field error when present', () => {
        const error = {
            response: {
                data: {
                    fieldErrors: {
                        email: 'Email er ugyldig',
                        password: 'Kodeord er for kort'
                    }
                }
            }
        }

        expect(getApiErrorMessage(error)).toBe('Email er ugyldig')
        expect(getApiFieldErrors(error)).toEqual({
            email: 'Email er ugyldig',
            password: 'Kodeord er for kort'
        })
    })

    it('falls back to message and default text', () => {
        expect(getApiErrorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope')
        expect(getApiErrorMessage(null)).toBe('Noget gik galt. Proev igen.')
    })
})
