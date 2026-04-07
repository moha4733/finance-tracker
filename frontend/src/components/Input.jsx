function Input({ label, id, className = '', error = '', ...props }) {
    return (
        <label className="field" htmlFor={id}>
            {label ? <span className="label">{label}</span> : null}
            <input
                id={id}
                className={`input ${className}`.trim()}
                aria-invalid={Boolean(error)}
                {...props}
            />
            {error ? <span className="field-error">{error}</span> : null}
        </label>
    )
}

export default Input
