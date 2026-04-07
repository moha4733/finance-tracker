function Modal({ open, title, onClose, children }) {
    if (!open) return null

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal card">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button className="btn btn-secondary" onClick={onClose} type="button">
                        Luk
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal
