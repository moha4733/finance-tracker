function EmptyState({ title = 'Ingen data', message = 'Der er intet at vise endnu.' }) {
    return (
        <div className="empty">
            <div className="empty-illustration" aria-hidden>
                <div className="empty-dot" />
            </div>
            <strong>{title}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>{message}</p>
        </div>
    )
}

export default EmptyState
