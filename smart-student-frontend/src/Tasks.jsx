import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const categoryColors = {
    study: 'from-blue-500 to-blue-600',
    exam: 'from-red-500 to-red-600',
    project: 'from-purple-500 to-purple-600',
    personal: 'from-green-500 to-green-600',
    other: 'from-gray-500 to-gray-600',
  };

  const categoryEmojis = {
    study: '📚',
    exam: '📝',
    project: '💼',
    personal: '🏠',
    other: '📌',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Task-uri 📝</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setFormData({ title: '', dueDate: '', category: 'study' });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          + Adaugă Task
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            {f === 'all' ? 'Toate' : f === 'active' ? 'Active' : 'Completate'}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Nu există task-uri {filter !== 'all' && filter}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${categoryColors[task.category]} flex items-center justify-center text-2xl`}>
                  {categoryEmojis[task.category]}
                </div>
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.completed && <span className="text-white text-sm">✓</span>}
                </button>
              </div>

              <h3 className={`text-xl font-bold text-gray-800 mb-2 ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span>📅</span>
                <span>{new Date(task.dueDate).toLocaleDateString('ro-RO')}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-xs font-medium text-indigo-600">
                  {task.category}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(task)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                >
                  ✏️ Editează
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                >
                  🗑️ Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTask ? 'Editează Task' : 'Adaugă Task Nou'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titlu
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="study">📚 Studiu</option>
                  <option value="exam">📝 Examen</option>
                  <option value="project">💼 Proiect</option>
                  <option value="personal">🏠 Personal</option>
                  <option value="other">📌 Altele</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  {editingTask ? 'Actualizează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
