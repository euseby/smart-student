import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const TasksImproved = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    category: 'study',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/tasks/${editingTask._id}`, formData);
      } else {
        await axios.post(`${API_URL}/tasks`, formData);
      }
      fetchTasks();
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', dueDate: '', category: 'study' });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/tasks/${task._id}`, {
        ...task,
        completed: !task.completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest task?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      category: task.category,
    });
    setShowModal(true);
  };

  let filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Sortare
  if (sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === 'category') {
    filteredTasks.sort((a, b) => a.category.localeCompare(b.category));
  }

  const categoryConfig = {
    study: { icon: '📚', color: '#3b82f6', label: 'Studiu' },
    exam: { icon: '📝', color: '#ef4444', label: 'Examen' },
    project: { icon: '💼', color: '#8b5cf6', label: 'Proiect' },
    personal: { icon: '🏠', color: '#10b981', label: 'Personal' },
    other: { icon: '📌', color: '#6b7280', label: 'Altele' },
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Task-uri 📝</h1>
          <p className="text-gray-600">Ai completat {completedCount} din {totalCount} task-uri</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setFormData({ title: '', dueDate: '', category: 'study' });
            setShowModal(true);
          }}
          className="btn btn-add"
        >
          + Adaugă Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="card mb-6 animate-slideIn">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">Progres Total</span>
          <span className="font-bold text-indigo-600">{completionPercentage.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-pill ${filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}`}
            >
              {f === 'all' ? '📋 Toate' : f === 'active' ? '⏳ Active' : '✅ Completate'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '2px solid #e5e7eb',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="dueDate">📅 După Dată</option>
            <option value="category">🏷️ După Categorie</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📝</div>
          <p>Nu există task-uri {filter !== 'all' && filter}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => {
            const config = categoryConfig[task.category];
            const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
            
            return (
              <div
                key={task._id}
                className={`task-item task-item-${task.category} ${task.completed ? 'task-item-completed' : ''} card-hover animate-slideIn`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
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
                    }}
                  >
                    {config.icon}
                  </div>
                  <div
                    className={`custom-checkbox ${task.completed ? 'custom-checkbox-checked' : ''}`}
                    onClick={() => toggleComplete(task)}
                  >
                    {task.completed && '✓'}
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '0.75rem',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </h3>

                <div className="flex items-center gap-2 mb-4" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>📅</span>
                  <span>{format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: ro })}</span>
                  {isOverdue && <span className="badge badge-danger ml-2">Întârziat!</span>}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="badge badge-info"
                    style={{ background: `${config.color}22`, color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="btn-icon btn-edit"
                    data-tooltip="Editează"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="btn-icon btn-delete"
                    data-tooltip="Șterge"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => toggleComplete(task)}
                    className="btn btn-sm btn-success"
                    style={{ flex: 1 }}
                  >
                    {task.completed ? '↩️ Reactiv ează' : '✅ Marchează'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTask ? '✏️ Editează Task' : '✨ Adaugă Task Nou'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Titlu</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="ex: Pregătire examen matematică"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Deadline</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label>Categorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingTask ? '💾 Actualizează' : '✨ Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksImproved;
