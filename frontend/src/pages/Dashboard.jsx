import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getApiErrorMessage } from '../services/errors'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ToastStack from '../components/ToastStack'

function Dashboard() {
    const navigate = useNavigate()
    const username = localStorage.getItem('username')
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [categoryForm, setCategoryForm] = useState({ name: '', type: 'EXPENSE' })
    const [transactionForm, setTransactionForm] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'EXPENSE',
        categoryId: ''
    })
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7),
        type: 'ALL',
        categoryId: 'ALL'
    })
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [page, setPage] = useState(1)
    const [toasts, setToasts] = useState([])
    const [actionsLoading, setActionsLoading] = useState({})
    const PAGE_SIZE = 6

    const setLoadingKey = (key, value) => {
        setActionsLoading((prev) => ({ ...prev, [key]: value }))
    }

    const notify = (message, type = 'info') => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 2800)
    }

    const loadData = async () => {
        try {
            setError('')
            setLoading(true)
            const [categoryRes, transactionRes] = await Promise.all([
                api.get('/categories'),
                api.get('/transactions')
            ])
            setCategories(categoryRes.data || [])
            setTransactions(transactionRes.data || [])
        } catch (err) {
            setError(getApiErrorMessage(err, 'Kunne ikke hente data. Tjek at backend koerer og du er logget ind.'))
            notify(getApiErrorMessage(err), 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const typeOk = filters.type === 'ALL' || String(transaction.type).toUpperCase() === filters.type
            const categoryOk =
                filters.categoryId === 'ALL' ||
                String(transaction.categoryId || '') === filters.categoryId
            const monthOk = !filters.month || String(transaction.date || '').startsWith(filters.month)
            return typeOk && categoryOk && monthOk
        })
    }, [filters, transactions])

    const totals = useMemo(() => {
        let income = 0
        let expense = 0
        for (const t of filteredTransactions) {
            const amount = Number(t.amount || 0)
            if (String(t.type).toUpperCase() === 'INCOME') income += amount
            else expense += amount
        }
        return {
            income,
            expense,
            balance: income - expense
        }
    }, [filteredTransactions])

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
    const pagedTransactions = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE
        return [...filteredTransactions].reverse().slice(from, from + PAGE_SIZE)
    }, [filteredTransactions, page])

    useEffect(() => {
        setPage(1)
    }, [filters.month, filters.type, filters.categoryId])

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    const chartRows = useMemo(() => {
        const grouped = {}
        filteredTransactions.forEach((transaction) => {
            const key = transaction.categoryName || 'Ingen kategori'
            grouped[key] = (grouped[key] || 0) + Number(transaction.amount || 0)
        })
        const rows = Object.entries(grouped).map(([name, value]) => ({ name, value }))
        rows.sort((a, b) => b.value - a.value)
        return rows.slice(0, 6)
    }, [filteredTransactions])
    const maxChartValue = useMemo(
        () => Math.max(1, ...chartRows.map((row) => row.value)),
        [chartRows]
    )

    const asCurrency = (value) =>
        new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(value || 0)

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        navigate('/login')
    }

    const createCategory = async (e) => {
        e.preventDefault()
        const tempId = -Date.now()
        const optimistic = { id: tempId, ...categoryForm }
        setLoadingKey('createCategory', true)
        setCategories((prev) => [optimistic, ...prev])
        setCategoryForm({ name: '', type: categoryForm.type })
        try {
            const res = await api.post('/categories', categoryForm)
            setCategories((prev) => prev.map((c) => (c.id === tempId ? res.data : c)))
            notify('Kategori oprettet', 'success')
        } catch (err) {
            setCategories((prev) => prev.filter((c) => c.id !== tempId))
            setError(getApiErrorMessage(err, 'Kunne ikke oprette kategori.'))
            notify(getApiErrorMessage(err, 'Kunne ikke oprette kategori.'), 'error')
        } finally {
            setLoadingKey('createCategory', false)
        }
    }

    const createTransaction = async (e) => {
        e.preventDefault()
        const optimisticBody = {
            ...transactionForm,
            amount: Number(transactionForm.amount),
            categoryId: transactionForm.categoryId ? Number(transactionForm.categoryId) : null
        }
        const category = categories.find((c) => Number(c.id) === Number(optimisticBody.categoryId))
        const tempId = -Date.now()
        const optimistic = {
            id: tempId,
            ...optimisticBody,
            categoryName: category?.name || null
        }
        setLoadingKey('createTransaction', true)
        setTransactions((prev) => [...prev, optimistic])
        setTransactionForm({
            amount: '',
            description: '',
            date: new Date().toISOString().slice(0, 10),
            type: transactionForm.type,
            categoryId: ''
        })
        try {
            const res = await api.post('/transactions', optimisticBody)
            setTransactions((prev) => prev.map((t) => (t.id === tempId ? res.data : t)))
            notify('Transaktion oprettet', 'success')
        } catch (err) {
            setTransactions((prev) => prev.filter((t) => t.id !== tempId))
            setError(getApiErrorMessage(err, 'Kunne ikke oprette transaktion.'))
            notify(getApiErrorMessage(err, 'Kunne ikke oprette transaktion.'), 'error')
        } finally {
            setLoadingKey('createTransaction', false)
        }
    }

    const deleteTransaction = async (id) => {
        const previous = transactions
        setLoadingKey(`deleteTx-${id}`, true)
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        try {
            await api.delete(`/transactions/${id}`)
            notify('Transaktion slettet', 'success')
        } catch (err) {
            setTransactions(previous)
            setError(getApiErrorMessage(err, 'Kunne ikke slette transaktion.'))
            notify(getApiErrorMessage(err, 'Kunne ikke slette transaktion.'), 'error')
        } finally {
            setLoadingKey(`deleteTx-${id}`, false)
        }
    }

    const saveTransactionEdit = async (e) => {
        e.preventDefault()
        const id = editingTransaction.id
        const payload = {
            ...editingTransaction,
            amount: Number(editingTransaction.amount),
            categoryId: editingTransaction.categoryId ? Number(editingTransaction.categoryId) : null
        }
        const category = categories.find((c) => Number(c.id) === Number(payload.categoryId))
        const previous = transactions
        setLoadingKey('editTransaction', true)
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...payload, categoryName: category?.name || null } : t))
        )
        try {
            await api.put(`/transactions/${id}`, payload)
            setEditingTransaction(null)
            notify('Transaktion opdateret', 'success')
        } catch (err) {
            setTransactions(previous)
            setError(getApiErrorMessage(err, 'Kunne ikke opdatere transaktion.'))
            notify(getApiErrorMessage(err, 'Kunne ikke opdatere transaktion.'), 'error')
        } finally {
            setLoadingKey('editTransaction', false)
        }
    }

    const saveCategoryEdit = async (e) => {
        e.preventDefault()
        const id = editingCategory.id
        const previousCategories = categories
        setLoadingKey('editCategory', true)
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...editingCategory } : c)))
        try {
            await api.put(`/categories/${id}`, editingCategory)
            setEditingCategory(null)
            notify('Kategori opdateret', 'success')
        } catch (err) {
            setCategories(previousCategories)
            setError(getApiErrorMessage(err, 'Kunne ikke opdatere kategori.'))
            notify(getApiErrorMessage(err, 'Kunne ikke opdatere kategori.'), 'error')
        } finally {
            setLoadingKey('editCategory', false)
        }
    }

    const deleteCategory = async (id) => {
        const previous = categories
        setLoadingKey(`deleteCat-${id}`, true)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        try {
            await api.delete(`/categories/${id}`)
            notify('Kategori slettet', 'success')
        } catch (err) {
            setCategories(previous)
            setError(getApiErrorMessage(err, 'Kunne ikke slette kategori.'))
            notify(getApiErrorMessage(err, 'Kunne ikke slette kategori.'), 'error')
        } finally {
            setLoadingKey(`deleteCat-${id}`, false)
        }
    }

    return (
        <div className="page">
            <div className="ambient-bg" aria-hidden>
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="noise" />
                <div className="grid" />
            </div>
            <div className="container">
                <header className="dashboard-top card section" style={{ marginBottom: 18 }}>
                    <div>
                        <p className="label">Finance Tracker</p>
                        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', margin: 0 }}>
                            Hej {username || 'bruger'}
                        </h1>
                        <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                            Produktionsklar oversigt med filter, redigering og visualisering.
                        </p>
                    </div>
                    <div className="row">
                        <Button variant="secondary" onClick={loadData}>Opdater</Button>
                        <Button onClick={logout}>Log ud</Button>
                    </div>
                </header>

                {error && <p className="error-text">{error}</p>}

                <section className="kpi-grid">
                    <Card className="kpi">
                        <p className="muted" style={{ margin: 0 }}>Indtaegt</p>
                        <p className="kpi-value positive">{asCurrency(totals.income)}</p>
                    </Card>
                    <Card className="kpi">
                        <p className="muted" style={{ margin: 0 }}>Udgift</p>
                        <p className="kpi-value negative">{asCurrency(totals.expense)}</p>
                    </Card>
                    <Card className="kpi">
                        <p className="muted" style={{ margin: 0 }}>Balance</p>
                        <p className={`kpi-value ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
                            {asCurrency(totals.balance)}
                        </p>
                    </Card>
                </section>

                <Card className="section" style={{ marginBottom: 16 }}>
                    <h3 style={{ marginTop: 0 }}>Filtre</h3>
                    <div className="filters-grid">
                        <Input
                            id="filter-month"
                            label="Maaned"
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        />
                        <Select
                            id="filter-type"
                            label="Type"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="ALL">Alle typer</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                        </Select>
                        <Select
                            id="filter-category"
                            label="Kategori"
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                        >
                            <option value="ALL">Alle kategorier</option>
                            {categories.map((category) => (
                                <option value={String(category.id)} key={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                </Card>

                <section className="dashboard-grid">
                    <Card className="section">
                        <h3 style={{ marginTop: 0 }}>Ny transaktion</h3>
                        <form onSubmit={createTransaction}>
                            <Input
                                id="tx-amount"
                                label="Belob"
                                required
                                type="number"
                                step="0.01"
                                value={transactionForm.amount}
                                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                            />
                            <Input
                                id="tx-description"
                                label="Beskrivelse"
                                required
                                value={transactionForm.description}
                                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                            />
                            <div className="row">
                                <Input
                                    id="tx-date"
                                    label="Dato"
                                    className=""
                                    required
                                    style={{ flex: 1 }}
                                    type="date"
                                    value={transactionForm.date}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                                />
                                <Select
                                    id="tx-type"
                                    label="Type"
                                    style={{ flex: 1 }}
                                    value={transactionForm.type}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                                >
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                </Select>
                            </div>
                            <Select
                                id="tx-category"
                                label="Kategori (valgfri)"
                                value={transactionForm.categoryId}
                                onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                            >
                                    <option value="">Ingen kategori</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.type})
                                        </option>
                                    ))}
                            </Select>
                            <Button type="submit" loading={actionsLoading.createTransaction}>Gem transaktion</Button>
                        </form>
                    </Card>

                    <Card className="section">
                        <h3 style={{ marginTop: 0 }}>Ny kategori</h3>
                        <form onSubmit={createCategory}>
                            <Input
                                id="cat-name"
                                label="Navn"
                                required
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            />
                            <Select
                                id="cat-type"
                                label="Type"
                                value={categoryForm.type}
                                onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                            >
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                            </Select>
                            <Button variant="secondary" type="submit" loading={actionsLoading.createCategory}>Gem kategori</Button>
                        </form>

                        <h3 style={{ marginBottom: 10 }}>Dine kategorier</h3>
                        {categories.length === 0 ? (
                            <EmptyState title="Ingen kategorier endnu" message="Opret din foerste kategori for at strukturere data." />
                        ) : (
                            <ul className="category-list">
                                {categories.map((category) => (
                                    <li key={category.id} className="item">
                                        <span>{category.name}</span>
                                        <div className="row">
                                            <span className="pill">{category.type}</span>
                                            <Button
                                                variant="secondary"
                                                type="button"
                                                onClick={() => setEditingCategory({ ...category })}
                                            >
                                                Rediger
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                type="button"
                                                loading={actionsLoading[`deleteCat-${category.id}`]}
                                                onClick={() => deleteCategory(category.id)}
                                            >
                                                Slet
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </section>

                <Card className="section" style={{ marginTop: 16 }}>
                    <h3 style={{ marginTop: 0 }}>Kategori-fordeling</h3>
                    {chartRows.length === 0 ? (
                        <EmptyState title="Ingen grafdata" message="Tilfoej transaktioner i den valgte periode for at se fordeling." />
                    ) : (
                        <div className="chart-list">
                            {chartRows.map((row) => (
                                <div key={row.name} className="chart-row">
                                    <div className="chart-label">
                                        <span>{row.name}</span>
                                        <span className="muted">{asCurrency(row.value)}</span>
                                    </div>
                                    <div className="chart-track">
                                        <div
                                            className="chart-fill"
                                            style={{ width: `${(row.value / maxChartValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="section" style={{ marginTop: 16 }}>
                    <h3 style={{ marginTop: 0 }}>Seneste transaktioner</h3>
                    {loading ? (
                        <EmptyState title="Henter data..." message="Vi indlaeser dine transaktioner." />
                    ) : filteredTransactions.length === 0 ? (
                        <EmptyState title="Ingen transaktioner" message="Aendre filtre eller opret en ny transaktion." />
                    ) : (
                        <ul className="transaction-list">
                            {pagedTransactions.map((transaction) => (
                                <li key={transaction.id} className="item">
                                    <div>
                                        <strong>{transaction.description}</strong>
                                        <div className="muted" style={{ fontSize: 13 }}>
                                            {transaction.date} - {transaction.categoryName || 'Ingen kategori'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className={String(transaction.type).toUpperCase() === 'INCOME' ? 'positive' : 'negative'}>
                                            {asCurrency(Number(transaction.amount || 0))}
                                        </span>
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                setEditingTransaction({
                                                    id: transaction.id,
                                                    amount: transaction.amount,
                                                    description: transaction.description,
                                                    date: transaction.date,
                                                    type: transaction.type,
                                                    categoryId: transaction.categoryId || ''
                                                })
                                            }
                                        >
                                            Rediger
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            loading={actionsLoading[`deleteTx-${transaction.id}`]}
                                            onClick={() => deleteTransaction(transaction.id)}
                                        >
                                            Slet
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {filteredTransactions.length > 0 ? (
                        <div className="pagination">
                            <span className="muted">
                                Side {page} / {totalPages} - {filteredTransactions.length} transaktioner
                            </span>
                            <div className="row">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Forrige
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Naeste
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </Card>
            </div>

            <Modal open={Boolean(editingTransaction)} title="Rediger transaktion" onClose={() => setEditingTransaction(null)}>
                {editingTransaction && (
                    <form onSubmit={saveTransactionEdit}>
                        <Input
                            id="edit-tx-amount"
                            label="Belob"
                            required
                            type="number"
                            step="0.01"
                            value={editingTransaction.amount}
                            onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
                        />
                        <Input
                            id="edit-tx-description"
                            label="Beskrivelse"
                            required
                            value={editingTransaction.description}
                            onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                        />
                        <Input
                            id="edit-tx-date"
                            label="Dato"
                            required
                            type="date"
                            value={editingTransaction.date}
                            onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                        />
                        <Select
                            id="edit-tx-type"
                            label="Type"
                            value={editingTransaction.type}
                            onChange={(e) => setEditingTransaction({ ...editingTransaction, type: e.target.value })}
                        >
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                        </Select>
                        <Select
                            id="edit-tx-category"
                            label="Kategori"
                            value={editingTransaction.categoryId}
                            onChange={(e) => setEditingTransaction({ ...editingTransaction, categoryId: e.target.value })}
                        >
                            <option value="">Ingen kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                        <div className="row">
                            <Button type="submit" loading={actionsLoading.editTransaction}>Gem aendringer</Button>
                            <Button type="button" variant="secondary" onClick={() => setEditingTransaction(null)}>Annuller</Button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal open={Boolean(editingCategory)} title="Rediger kategori" onClose={() => setEditingCategory(null)}>
                {editingCategory && (
                    <form onSubmit={saveCategoryEdit}>
                        <Input
                            id="edit-cat-name"
                            label="Navn"
                            required
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                        <Select
                            id="edit-cat-type"
                            label="Type"
                            value={editingCategory.type}
                            onChange={(e) => setEditingCategory({ ...editingCategory, type: e.target.value })}
                        >
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                        </Select>
                        <div className="row">
                            <Button type="submit" loading={actionsLoading.editCategory}>Gem aendringer</Button>
                            <Button type="button" variant="secondary" onClick={() => setEditingCategory(null)}>Annuller</Button>
                        </div>
                    </form>
                )}
            </Modal>
            <ToastStack items={toasts} />
        </div>
    )
}

export default Dashboard