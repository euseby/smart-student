import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ro } from 'date-fns/locale';

const FinanceImproved = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await axios.put(`${API_URL}/transactions/${editingTransaction._id}`, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await axios.post(`${API_URL}/transactions`, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      fetchTransactions();
      setShowModal(false);
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această tranzacție?')) return;
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // Filtrare pe lună selectată
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= monthStart && date <= monthEnd;
  });

  const filteredTransactions = monthlyTransactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  // Statistici
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Date pentru Pie Chart - categorii cheltuieli
  const expensesByCategory = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  // Date pentru Bar Chart - ultimele 6 luni
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthTrans = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });

    const income = monthTrans.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTrans.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(date, 'MMM', { locale: ro }),
      Venituri: income,
      Cheltuieli: expense,
    };
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Finanțe 💰</h1>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setFormData({
              type: 'expense',
              amount: '',
              category: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
            });
            setShowModal(true);
          }}
          className="btn btn-add"
        >
          + Adaugă Tranzacție
        </button>
      </div>

      {/* Month Selector */}
      <div className="month-selector mb-6">
        <button
          className="month-btn"
          onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
        >
          ◀
        </button>
        <span className="font-semibold text-gray-800">
          {format(selectedMonth, 'MMMM yyyy', { locale: ro })}
        </span>
        <button
          className="month-btn"
          onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
          disabled={selectedMonth >= new Date()}
        >
          ▶
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card card-hover animate-slideIn">
          <div className="stat-icon gradient-green mb-4">💵</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Venituri Luna Aceasta</h3>
          <p className="stat-value">{monthlyIncome.toFixed(0)}</p>
          <p className="text-sm text-gray-500">RON</p>
        </div>

        <div className="card card-hover animate-slideIn" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon gradient-red mb-4">💸</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Cheltuieli Luna Aceasta</h3>
          <p className="stat-value">{monthlyExpenses.toFixed(0)}</p>
          <p className="text-sm text-gray-500">RON</p>
        </div>

        <div className="card card-hover animate-slideIn" style={{ animationDelay: '0.2s' }}>
          <div className={`stat-icon ${monthlyBalance >= 0 ? 'gradient-green' : 'gradient-red'} mb-4`}>
            {monthlyBalance >= 0 ? '📈' : '📉'}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Balanță Lunară</h3>
          <p className={`stat-value ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyBalance.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">RON</p>
        </div>

        <div className="card card-hover animate-slideIn" style={{ animationDelay: '0.3s' }}>
          <div className={`stat-icon ${balance >= 0 ? 'gradient-blue' : 'gradient-red'} mb-4`}>💰</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Balanță Totală</h3>
          <p className={`stat-value ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {balance.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">RON</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="chart-container animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Cheltuieli pe Categorii</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} RON`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>Nu există cheltuieli în această lună</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="chart-container animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Evoluție Ultimele 6 Luni</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(0)} RON`} />
              <Legend />
              <Bar dataKey="Venituri" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Cheltuieli" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 mb-6">
        {['all', 'income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`filter-pill ${
              filterType === type ? 'filter-pill-active' : 'filter-pill-inactive'
            }`}
          >
            {type === 'all' ? '📋 Toate' : type === 'income' ? '💵 Venituri' : '💸 Cheltuieli'}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Nu există tranzacții {filterType !== 'all' && `de tip ${filterType}`} în această lună.</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Categorie</th>
                  <th>Descriere</th>
                  <th>Dată</th>
                  <th style={{ textAlign: 'right' }}>Sumă</th>
                  <th style={{ textAlign: 'right' }}>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="transaction-row">
                    <td>
                      <span className={`badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {transaction.type === 'income' ? '💵 Venit' : '💸 Cheltuială'}
                      </span>
                    </td>
                    <td className="font-semibold">{transaction.category}</td>
                    <td className="text-gray-600">{transaction.description || '-'}</td>
                    <td className="text-gray-600">{format(new Date(transaction.date), 'dd MMM yyyy', { locale: ro })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount} RON
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="btn-icon btn-edit"
                          data-tooltip="Editează"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTransaction(transaction._id)}
                          className="btn-icon btn-delete"
                          data-tooltip="Șterge"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTransaction ? '✏️ Editează Tranzacție' : '✨ Adaugă Tranzacție Nouă'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="income">💵 Venit</option>
                  <option value="expense">💸 Cheltuială</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Sumă (RON)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="100.00"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Categorie</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="ex: Mâncare, Transport, Salariu"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Descriere (opțional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ex: Cumpărături la magazin"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label>Dată</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingTransaction ? '💾 Actualizează' : '✨ Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceImproved;
