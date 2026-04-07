function Button({ children, variant = 'primary', className = '', loading = false, disabled, ...props }) {
    const resolved = variant === 'secondary' ? 'btn btn-secondary' : 'btn btn-primary'
    return (
        <button
            className={`${resolved} ${className}`.trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? 'Arbejder...' : children}
        </button>
    )
}

export default Button
