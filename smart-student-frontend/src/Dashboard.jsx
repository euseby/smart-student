import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ro } from 'date-fns/locale';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/tasks`),
        axios.get(`${API_URL}/transactions`),
      ]);
      setTasks(tasksRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task statistics
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Tasks by category
  const tasksByCategory = {
    study: tasks.filter((t) => t.category === 'study' && !t.completed).length,
    exam: tasks.filter((t) => t.category === 'exam' && !t.completed).length,
    project: tasks.filter((t) => t.category === 'project' && !t.completed).length,
    personal: tasks.filter((t) => t.category === 'personal' && !t.completed).length,
  };

  // Urgent tasks (today and overdue)
  const urgentTasks = activeTasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return isToday(dueDate) || isPast(dueDate);
  });

  // Upcoming tasks (sorted by date)
  const upcomingTasks = activeTasks
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Financial statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const income = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getTaskDateBadge = (dueDate) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { text: 'Întârziat!', color: 'badge-danger' };
    }
    if (isToday(date)) {
      return { text: 'Astăzi', color: 'badge-warning' };
    }
    if (isTomorrow(date)) {
      return { text: 'Mâine', color: 'badge-info' };
    }
    return { text: format(date, 'dd MMM', { locale: ro }), color: 'badge-secondary' };
  };

  const categoryConfig = {
    study: { icon: '📚', color: '#3b82f6', label: 'Studiu' },
    exam: { icon: '📝', color: '#ef4444', label: 'Examene' },
    project: { icon: '💼', color: '#8b5cf6', label: 'Proiecte' },
    personal: { icon: '🏠', color: '#10b981', label: 'Personal' },
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header cu salut */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Bine ai venit! 👋
        </h1>
        <p className="text-gray-600">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: ro })}
        </p>
      </div>

      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => navigate('/tasks')}
          className="card card-hover animate-slideIn cursor-pointer"
          style={{ animationDelay: '0s' }}
        >
          <div className="stat-icon gradient-blue mb-4">✅</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Task-uri Active</h3>
          <p className="stat-value">{activeTasks.length}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="progress-bar" style={{ flex: 1, height: '4px' }}>
              <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
            <span className="text-xs text-gray-500">{completionRate.toFixed(0)}%</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/finance')}
          className="card card-hover animate-slideIn cursor-pointer"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="stat-icon gradient-green mb-4">💵</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Venituri Luna Aceasta</h3>
          <p className="stat-value">{income.toFixed(0)}</p>
          <p className="text-sm text-gray-500">RON</p>
        </div>

        <div
          onClick={() => navigate('/finance')}
          className="card card-hover animate-slideIn cursor-pointer"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="stat-icon gradient-red mb-4">💸</div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Cheltuieli Luna Aceasta</h3>
          <p className="stat-value">{expenses.toFixed(0)}</p>
          <p className="text-sm text-gray-500">RON</p>
        </div>

        <div
          onClick={() => navigate('/finance')}
          className={`card card-hover animate-slideIn cursor-pointer`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className={`stat-icon ${balance >= 0 ? 'gradient-green' : 'gradient-red'} mb-4`}>
            {balance >= 0 ? '📈' : '📉'}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Balanță</h3>
          <p className={`stat-value ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">RON</p>
        </div>
      </div>

      {/* Tasks by Category - Clickable Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Task-uri pe Categorii</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryConfig).map(([key, config], index) => (
            <div
              key={key}
              onClick={() => navigate('/tasks')}
              className="card card-hover cursor-pointer animate-slideIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '0.75rem',
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                {config.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{config.label}</h3>
              <p className="text-3xl font-bold" style={{ color: config.color }}>
                {tasksByCategory[key]}
              </p>
              <p className="text-sm text-gray-500">active</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <div className="card animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🔥 Task-uri Urgente
              </h2>
              <span className="badge badge-danger">{urgentTasks.length}</span>
            </div>
            <div className="space-y-3">
              {urgentTasks.map((task) => {
                const badge = getTaskDateBadge(task.dueDate);
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate('/tasks')}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <span className={`badge ${badge.color} ml-2`}>{badge.text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{categoryConfig[task.category]?.icon}</span>
                      <span>{categoryConfig[task.category]?.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Tasks */}
        <div className="card animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📅 Task-uri Apropiate
            </h2>
            <button
              onClick={() => navigate('/tasks')}
              className="link-button"
            >
              Vezi toate →
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🎉</div>
              <p>Nu ai task-uri active!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const badge = getTaskDateBadge(task.dueDate);
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate('/tasks')}
                    className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <span className={`badge ${badge.color} ml-2`}>{badge.text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{categoryConfig[task.category]?.icon}</span>
                      <span>{categoryConfig[task.category]?.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              💳 Tranzacții Recente
            </h2>
            <button
              onClick={() => navigate('/finance')}
              className="link-button"
            >
              Vezi toate →
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>💰</div>
              <p>Nu există tranzacții</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  onClick={() => navigate('/finance')}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.5rem',
                        background: transaction.type === 'income' ? '#10b98122' : '#ef444422',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {transaction.type === 'income' ? '💵' : '💸'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {transaction.description || transaction.category}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(transaction.date), 'dd MMM', { locale: ro })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount} RON
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ⚡ Acțiuni Rapide
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/tasks')}
              className="w-full btn btn-primary text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>Adaugă Task Nou</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/finance')}
              className="w-full btn btn-success text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span>Adaugă Tranzacție</span>
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/finance')}
              className="w-full btn btn-secondary text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span>Vezi Rapoarte</span>
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="card animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Rezumat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-indigo-600">{completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600 mt-1">Rata de completare</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">⏰</div>
            <div className="text-3xl font-bold text-orange-600">{urgentTasks.length}</div>
            <div className="text-sm text-gray-600 mt-1">Task-uri urgente</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💎</div>
            <div className="text-3xl font-bold text-green-600">{monthlyTransactions.length}</div>
            <div className="text-sm text-gray-600 mt-1">Tranzacții luna aceasta</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
