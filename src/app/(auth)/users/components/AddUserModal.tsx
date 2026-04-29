'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, User, Lock, Shield, CheckCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager' | 'viewer';
  twoFactorEnabled: boolean;
}

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    twoFactorEnabled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        twoFactorEnabled: false,
      });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <GlassCard glowColor="cyan" className="w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-6 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add New User</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Container - Scrollable */}
          <div className="overflow-y-auto flex-1 px-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="pb-6">
              {/* Form Grid - Two Columns */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Name Field - Full Width */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <User size={16} className="text-cyan-400" />
                      Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.name ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email Field - Full Width */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail size={16} className="text-cyan-400" />
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.email ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Lock size={16} className="text-cyan-400" />
                      Password
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.password ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-cyan-400" />
                      Confirm Password
                    </span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Shield size={16} className="text-cyan-400" />
                      Role
                    </span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all cursor-pointer"
                  >
                    <option value="viewer" className="bg-slate-900">
                      Viewer
                    </option>
                    <option value="manager" className="bg-slate-900">
                      Manager
                    </option>
                    <option value="admin" className="bg-slate-900">
                      Admin
                    </option>
                  </select>
                </div>

                {/* Two Factor Toggle - Full Width */}
                <div className="col-span-2 flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <input
                    type="checkbox"
                    name="twoFactorEnabled"
                    checked={formData.twoFactorEnabled}
                    onChange={handleInputChange}
                    id="twoFactor"
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                  <label htmlFor="twoFactor" className="text-sm text-slate-300 cursor-pointer flex-1">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg mt-4">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer - Buttons */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 font-medium transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </>
  );
}
