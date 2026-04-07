export function getApiErrorMessage(error, fallback = 'Noget gik galt. Proev igen.') {
    if (!error) return fallback
    const data = error.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
        const firstFieldError = Object.values(data.fieldErrors)[0]
        if (firstFieldError) return String(firstFieldError)
    }
    if (data?.message) return data.message
    if (Array.isArray(data?.errors) && data.errors.length > 0) return String(data.errors[0])
    return fallback
}

export function getApiFieldErrors(error) {
    const data = error?.response?.data
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
        return data.fieldErrors
    }
    return {}
}
