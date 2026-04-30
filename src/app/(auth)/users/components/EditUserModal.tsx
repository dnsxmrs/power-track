'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, User, Shield, Phone, CheckCircle, AlertCircle, Lock, Trash2 } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import type { UserManagementItem } from '../../../_actions/users';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserManagementItem | null;
  onClose: () => void;
  onSubmit: (userId: string, updates: EditUserData) => Promise<void>;
}

export interface EditUserData {
  name: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  twoFactorEnabled: boolean;
}

type TabType = 'basic' | 'security' | 'activity';

export function EditUserModal({ isOpen, user, onClose, onSubmit }: EditUserModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<EditUserData>({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'user',
    twoFactorEnabled: user?.twoFactorEnabled || false,
  });

  const [phoneDigits, setPhoneDigits] = useState(() => {
    if (!user?.phoneNumber) return '';
    return user.phoneNumber.replace(/\D/g, '').slice(-10);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    const digits = user.phoneNumber ? user.phoneNumber.replace(/\D/g, '').slice(-10) : '';

    setActiveTab('basic');
    setFormData({
      name: user.name,
      phoneNumber: digits ? `+63${digits}` : '',
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    });
    setPhoneDigits(digits);
    setErrors({});
    setShowDeleteConfirm(false);
  }, [isOpen, user]);

  const validateName = (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { valid: false, error: 'Name is required' };
    }
    if (trimmed.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
      return { valid: false, error: 'Name must not exceed 50 characters' };
    }
    if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { valid: true };
  };

  const validatePhone = (digits: string): { valid: boolean; error?: string } => {
    const cleanedDigits = String(digits).replace(/\D/g, '');
    if (!cleanedDigits || cleanedDigits.length === 0) {
      return { valid: false, error: 'Phone number is required' };
    }
    if (cleanedDigits.length !== 10) {
      return { valid: false, error: `Phone number must be exactly 10 digits (${cleanedDigits.length}/10)` };
    }
    return { valid: true };
  };

  const formatPhoneDigits = (input: string): string => {
    const digits = String(input).replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handlePhoneDigitChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);

    if (errors.phoneNumber) {
      const newErrors = { ...errors };
      delete newErrors.phoneNumber;
      setErrors(newErrors);
    }

    setFormData(prev => ({
      ...prev,
      phoneNumber: `+63${digits}`,
    }));
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      const newErrors = { ...errors };
      delete newErrors.name;
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error || '';

    const phoneValidation = validatePhone(phoneDigits);
    if (!phoneValidation.valid) newErrors.phoneNumber = phoneValidation.error || '';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(user.id, formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update user' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <GlassCard glowColor="cyan" className="w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <p className="text-sm text-slate-400 mt-1">{user.email}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10">
              {['basic', 'security', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab === 'basic' && 'Basic Info'}
                  {tab === 'security' && 'Security'}
                  {tab === 'activity' && 'Activity'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-6">
            <form onSubmit={handleSubmit} className="pb-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4 mt-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <User size={16} className="text-cyan-400" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="John Doe"
                      maxLength={50}
                      className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                        errors.name ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Mail size={16} className="text-cyan-400" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-500 placeholder-slate-600 focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Phone size={16} className="text-cyan-400" />
                        Phone Number
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 font-medium">
                        +63
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={formatPhoneDigits(phoneDigits)}
                        onChange={e => handlePhoneDigitChange(e.target.value)}
                        placeholder="917 123 4567"
                        maxLength={12}
                        className={`flex-1 px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                          errors.phoneNumber ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
                    <p className="text-xs text-slate-500 mt-1">{phoneDigits.length}/10 digits</p>
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
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all cursor-pointer"
                    >
                      <option value="user" className="bg-slate-900">
                        User
                      </option>
                      <option value="admin" className="bg-slate-900">
                        Admin
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-4 mt-6">
                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Lock size={18} className="text-cyan-400" />
                        <span className="font-medium text-white">Two-Factor Authentication</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          formData.twoFactorEnabled ? 'bg-emerald-500/30' : 'bg-slate-500/30'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            formData.twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">
                      {formData.twoFactorEnabled
                        ? '✓ Two-factor authentication is enabled for this account'
                        : '⚠ Two-factor authentication is disabled'}
                    </p>
                  </div>

                  {/* Email Verification Status */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-cyan-400" />
                        <span className="font-medium text-white">Email Verification</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${
                          user.emailVerified
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {user.emailVerified ? (
                          <>
                            <CheckCircle size={14} />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} />
                            Unverified
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-white">Account Status</span>
                      <div
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.banned
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {user.banned ? 'Restricted' : 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h3 className="font-medium text-white mb-4">Account Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-slate-300">Account Created</p>
                          <p className="text-xs text-slate-500 mt-1">{user.joinedLabel}</p>
                        </div>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                          {user.joinedLabel}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-sm font-medium text-slate-300">Last Activity</p>
                        <p className="text-xs text-slate-500 mt-1">{user.lastActiveLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h3 className="font-medium text-white mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded">
                        <p className="text-xs text-slate-500 mb-1">Email Status</p>
                        <p className="text-sm font-medium text-white">{user.emailVerified ? 'Verified' : 'Pending'}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <p className="text-xs text-slate-500 mb-1">2FA Status</p>
                        <p className="text-sm font-medium text-white">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg mt-4">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}
            </form>
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
            <div className="flex gap-3">
              {activeTab === 'basic' && (
                <>
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
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </>
              )}
              {activeTab !== 'basic' && (
                <motion.button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 font-medium transition-all"
                >
                  Back to Edit
                </motion.button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </>
  );
}
