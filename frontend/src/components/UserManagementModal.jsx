import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, Shield, Plus, Edit2, Trash2, CheckCircle2, 
  AlertCircle, X, Mail, User, Phone, Lock
} from 'lucide-react';

const ROLES = ['Athlete', 'Coach', 'Physiotherapist', 'Sports Scientist', 'Admin'];

export const UserManagementModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Athlete',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      setUsersList(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to fetch user directory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/users', createForm);
      setUsersList([res.data, ...usersList]);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'Athlete', phone: '' });
      setMessage({ type: 'success', text: `User account '${res.data.name}' created successfully.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create user account.' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/api/users/${userId}`, { role: newRole });
      setUsersList(usersList.map(u => u.user_id === userId ? res.data : u));
      setMessage({ type: 'success', text: `Role updated to '${newRole}'.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update user role.' });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to deactivate account '${userName}'?`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setUsersList(usersList.filter(u => u.user_id !== userId));
      setMessage({ type: 'success', text: `User account '${userName}' deactivated.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete user.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-5xl w-full my-auto theme-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl accent-badge flex items-center justify-center">
              <Shield className="w-5 h-5 accent-text" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text font-display">User Account Management (Admin Scope)</h2>
              <p className="text-xs theme-muted">Manage system users, roles, and platform account provisioning</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="accent-btn font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg theme-card theme-muted hover:theme-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`p-3.5 rounded-xl flex items-center space-x-2.5 text-xs ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center theme-muted text-xs">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="theme-muted border-b border-white/10 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 theme-text">
                {usersList.map((u) => (
                  <tr key={u.user_id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-semibold flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full accent-badge flex items-center justify-center text-xs font-bold uppercase">
                        {u.name[0]}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-3 theme-muted font-mono">{u.email}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        className="theme-input px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} className="bg-dark-card">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 theme-muted">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.user_id, u.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Create User Sub-Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="theme-card max-w-md w-full p-6 rounded-xl space-y-4 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold theme-text border-b border-white/10 pb-3">
              Provision New User Account
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full theme-input rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full theme-input rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full theme-input rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Assign Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full theme-input rounded-lg px-2.5 py-2 text-xs"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase theme-muted mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+1555..."
                    className="w-full theme-input rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg theme-muted hover:theme-text text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg accent-btn font-semibold text-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
