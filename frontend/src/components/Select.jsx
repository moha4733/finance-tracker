function Select({ label, id, className = '', children, ...props }) {
    return (
        <label className="field" htmlFor={id}>
            {label ? <span className="label">{label}</span> : null}
            <select id={id} className={`select ${className}`.trim()} {...props}>
                {children}
            </select>
        </label>
    )
}

export default Select
