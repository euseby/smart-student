import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/tasks', icon: '✅', label: 'Task-uri' },
    { path: '/finance', icon: '💰', label: 'Finanțe' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between">
            <h1
              style={{
                fontWeight: 'bold',
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'opacity 0.3s',
                opacity: sidebarOpen ? 1 : 0
              }}
            >
              Smart Student
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="btn-secondary"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        <nav style={{ padding: '1rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <span
                style={{
                  fontWeight: '500',
                  transition: 'opacity 0.3s',
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? 'auto' : '0',
                  overflow: 'hidden'
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div className="flex items-center gap-4">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                  {user?.name || 'Student'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {user?.email || 'student@example.com'}
                </p>
                <button
                  onClick={onLogout}
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🚪 Deconectare
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={sidebarOpen ? 'main-content-sidebar-open' : 'main-content-sidebar-closed'}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
