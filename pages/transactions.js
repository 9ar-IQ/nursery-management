import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

function TransactionModal({ visible, onClose, onSave, transaction }) {
  const [form, setForm] = useState({
    date: '',
    type: 'income',
    amount: '',
    category: '',
    paymentMethod: 'cash',
    source: '',
    description: ''
  });

  useEffect(() => {
    setForm(transaction || {
      date: new Date().toISOString().slice(0, 10),
      type: 'income',
      amount: '',
      category: '',
      paymentMethod: 'cash',
      source: '',
      description: ''
    });
  }, [transaction]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 6, width: 440 }}>
        <h2>{transaction ? 'Edit' : 'Add'} Transaction</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <input type="date" name="date" value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} required style={{ width: '100%', marginBottom: 12 }} />
          <select name="type" value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', marginBottom: 12 }}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="number" name="amount" placeholder="Amount"
            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            required style={{ width: '100%', marginBottom: 12 }} />
          <input name="category" placeholder="Category"
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            required style={{ width: '100%', marginBottom: 12 }} />
          <select name="paymentMethod" value={form.paymentMethod}
            onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ width: '100%', marginBottom: 12 }}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
          <input name="source" placeholder="Source"
            value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ width: '100%', marginBottom: 12 }} />
          <input name="description" placeholder="Description"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 20px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: '#1890ff', color: 'white', border: 'none' }}>
              {transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/transactions?limit=10&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.transactions);
      setLoading(false);
    } catch (err) {
      setError('Error loading transactions');
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [page]);

  const saveTransaction = async (form) => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      if (editingTransaction) {
        await axios.put(`/api/transactions/${editingTransaction._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/transactions`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalVisible(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch {
      setError('Error saving transaction');
    }
  };

  const deleteTransaction = async (id) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTransactions();
      } catch {
        setError('Error deleting transaction');
      }
    }
  };

  return (
    <Layout title="Transactions">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: '#52c41a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          onClick={() => { setEditingTransaction(null); setModalVisible(true); }}>
          Add Transaction
        </button>
      </div>
      {error && <div style={{ color: '#ff4d4f', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Source</th>
              <th>Description</th>
              <th style={{ minWidth: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t._id}>
                <td>{(new Date(t.date)).toLocaleDateString()}</td>
                <td>{t.type}</td>
                <td>{t.amount}</td>
                <td>{t.category}</td>
                <td>{t.paymentMethod}</td>
                <td>{t.source}</td>
                <td>{t.description}</td>
                <td>
                  <button style={{ marginRight: 8, color: "#1890ff", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => { setEditingTransaction(t); setModalVisible(true); }}>
                    Edit
                  </button>
                  <button style={{ color: "#ff4d4f", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => deleteTransaction(t._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* Modal */}
      <TransactionModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingTransaction(null); }}
        onSave={saveTransaction}
        transaction={editingTransaction}
      />
    </Layout>
  );
}
