function ToastStack({ items = [] }) {
    return (
        <div className="toast-stack" aria-live="polite">
            {items.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    )
}

export default ToastStack
