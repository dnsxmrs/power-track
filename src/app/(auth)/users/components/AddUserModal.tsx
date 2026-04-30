'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, User, Lock, Shield, Phone, CheckCircle } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  twoFactorEnabled: boolean;
}

interface Validations {
  name: boolean;
  email: boolean;
  phoneNumber: boolean;
}

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    twoFactorEnabled: false,
  });

  const [phoneDigits, setPhoneDigits] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Validations>({
    name: false,
    email: false,
    phoneNumber: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string>('');

  const commonDomainTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
  };

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

  const validateEmail = (email: string): { valid: boolean; error?: string; warning?: string } => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { valid: false, error: 'Email is required' };
    }
    if (trimmed.length > 100) {
      return { valid: false, error: 'Email must not exceed 100 characters' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { valid: false, error: 'Invalid email format (e.g. user@company.com)' };
    }
    if (trimmed.includes(' ')) {
      return { valid: false, error: 'Email cannot contain spaces' };
    }

    const domain = trimmed.split('@')[1];
    const typoMatch = commonDomainTypos[domain];
    if (typoMatch) {
      return {
        valid: false,
        error: `Did you mean @${typoMatch}?`,
        warning: `Possible typo: ${domain}`,
      };
    }

    return { valid: true };
  };

  const validatePhone = (digits: string): { valid: boolean; error?: string } => {
    const cleanedDigits = digits.replace(/\D/g, '');
    if (!cleanedDigits) {
      return { valid: false, error: 'Phone number is required' };
    }
    if (cleanedDigits.length !== 10) {
      return { valid: false, error: `Enter exactly 10 digits (${cleanedDigits.length}/10)` };
    }
    if (!cleanedDigits.startsWith('9')) {
      return { valid: false, error: 'Philippine mobile numbers start with 9' };
    }
    return { valid: true };
  };

  const formatPhoneDigits = (input: string): string => {
    const digits = input.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error || '';

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) newErrors.email = emailValidation.error || '';

    const phoneValidation = validatePhone(phoneDigits);
    if (!phoneValidation.valid) newErrors.phoneNumber = phoneValidation.error || '';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneDigitChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);

    const phoneValidation = validatePhone(digits);
    setValidations(prev => ({ ...prev, phoneNumber: phoneValidation.valid }));

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
    const nameValidation = validateName(value);
    setValidations(prev => ({ ...prev, name: nameValidation.valid }));
    if (errors.name) {
      const newErrors = { ...errors };
      delete newErrors.name;
      setErrors(newErrors);
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    const emailValidation = validateEmail(value);
    setValidations(prev => ({ ...prev, email: emailValidation.valid }));
    setEmailWarning(emailValidation.warning || '');

    if (errors.email) {
      const newErrors = { ...errors };
      delete newErrors.email;
      setErrors(newErrors);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'name') {
      handleNameChange(value);
    } else if (name === 'email') {
      handleEmailChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        phoneNumber: '',
        role: 'user',
        twoFactorEnabled: false,
      });
      setPhoneDigits('');
      setErrors({});
      setValidations({ name: false, email: false, phoneNumber: false });
      setEmailWarning('');
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create user' });
    } finally {
      setIsLoading(false);
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      <span className="flex items-center gap-2">
                        <User size={16} className="text-cyan-400" />
                        Full Name
                      </span>
                    </label>
                    <span className="text-xs text-slate-500">
                      {formData.name.length}/50
                      {validations.name && <CheckCircle size={14} className="inline ml-1 text-emerald-400" />}
                    </span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="John Doe"
                    maxLength={50}
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.name ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  <p className="text-slate-500 text-xs mt-1">Letters, spaces, hyphens, and apostrophes only</p>
                </div>

                {/* Email Field - Full Width */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      <span className="flex items-center gap-2">
                        <Mail size={16} className="text-cyan-400" />
                        Email Address
                      </span>
                    </label>
                    {validations.email && <CheckCircle size={14} className="text-emerald-400" />}
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="user@company.com"
                    maxLength={100}
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all ${
                      errors.email ? 'border-red-500/50' : emailWarning ? 'border-amber-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  {emailWarning && !errors.email && (
                    <p className="text-amber-400 text-xs mt-1">⚠️ {emailWarning}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">Temporary credentials will be sent to this email</p>
                </div>

                {/* Phone Number Field - Full Width */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      <span className="flex items-center gap-2">
                        <Phone size={16} className="text-cyan-400" />
                        Phone Number
                      </span>
                    </label>
                    <span className="text-xs text-slate-500">
                      {phoneDigits.length}/10
                      {validations.phoneNumber && <CheckCircle size={14} className="inline ml-1 text-emerald-400" />}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* Fixed +63 Prefix */}
                    <div className="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 font-medium">
                      +63
                    </div>
                    {/* Phone Digits Input */}
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
                  <p className="text-slate-500 text-xs mt-1">Enter 10 digits for Philippine mobile numbers (91X XXXX XXXX)</p>
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
                    <option value="user" className="bg-slate-900">
                      User
                    </option>
                    <option value="admin" className="bg-slate-900">
                      Admin
                    </option>
                  </select>
                </div>

                {/* Two Factor Toggle - Full Width */}
                <div className="col-span-2 flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all cursor-pointer">
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
                  <span className="text-xs text-slate-500">Recommended for security</span>
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
