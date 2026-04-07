function Card({ as = 'div', className = '', children, ...props }) {
    const Component = as
    return (
        <Component className={`card ${className}`.trim()} {...props}>
            {children}
        </Component>
    )
}

export default Card
