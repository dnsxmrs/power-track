"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, User, Shield, Phone, CheckCircle, Search, ShieldCheck, UserCircle2 } from 'lucide-react';
import { GlassCard } from '../../../components/GlassCard';
import { normalizeEmail, formatPhoneDigitsForInput, validatePhoneDigits, validateUserEmail, validateUserName } from '@/lib/userAccountValidation';
import type { ApprovedClientApplicationCandidate } from '../../../_actions/users';
import { fetchApprovedApplicationsForClientCreation } from '../../../_actions/users';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'CLIENT';
  twoFactorEnabled: boolean;
  applicationId?: string | null;
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
    role: 'ADMIN',
    twoFactorEnabled: false,
    applicationId: null,
  });

  const [approvedApplications, setApprovedApplications] = useState<ApprovedClientApplicationCandidate[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [applicationSearchQuery, setApplicationSearchQuery] = useState('');
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationLoadError, setApplicationLoadError] = useState('');

  const [phoneDigits, setPhoneDigits] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Validations>({
    name: false,
    email: false,
    phoneNumber: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string>('');

  const selectedApplication = useMemo(
    () => approvedApplications.find(application => application.id === selectedApplicationId) ?? null,
    [approvedApplications, selectedApplicationId],
  );

  const filteredApplications = useMemo(() => {
    const normalizedQuery = applicationSearchQuery.trim().toLowerCase();

    return approvedApplications.filter(application => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return (
        application.ticketNumber.toLowerCase().includes(normalizedQuery) ||
        application.fullName.toLowerCase().includes(normalizedQuery) ||
        application.email.toLowerCase().includes(normalizedQuery) ||
        application.planName.toLowerCase().includes(normalizedQuery) ||
        application.branchName.toLowerCase().includes(normalizedQuery) ||
        application.branchCity.toLowerCase().includes(normalizedQuery) ||
        application.branchProvince.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [approvedApplications, applicationSearchQuery]);

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

  const validateEmail = (email: string): { valid: boolean; error?: string; warning?: string } => {
    const base = validateUserEmail(email);
    if (!base.valid) {
      return { valid: false, error: base.error };
    }

    const trimmed = normalizeEmail(email);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadApplications = async () => {
      setIsLoadingApplications(true);

      try {
        const applications = await fetchApprovedApplicationsForClientCreation();
        setApprovedApplications(Array.isArray(applications) ? applications : []);
      } catch (error) {
        setApprovedApplications([]);
        setApplicationLoadError(error instanceof Error ? error.message : 'Failed to load approved applications.');
      } finally {
        setIsLoadingApplications(false);
      }
    };

    void loadApplications();
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateUserName(formData.name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error || '';

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) newErrors.email = emailValidation.error || '';

    const phoneValidation = validatePhoneDigits(phoneDigits);
    if (!phoneValidation.valid) newErrors.phoneNumber = phoneValidation.error || '';

    if (formData.role === 'CLIENT' && !formData.applicationId) {
      newErrors.applicationId = 'Select an approved application to create a client account.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role: UserFormData['role']) => {
    setFormData(prev => ({
      ...prev,
      role,
      applicationId: role === 'CLIENT' ? prev.applicationId : null,
    }));

    if (role !== 'CLIENT') {
      setSelectedApplicationId('');
      setApplicationSearchQuery('');
      setErrors(prev => {
        const next = { ...prev };
        delete next.applicationId;
        return next;
      });
    }
  };

  const handleApprovedApplicationSelect = (application: ApprovedClientApplicationCandidate) => {
    setSelectedApplicationId(application.id);
    setFormData(prev => ({
      ...prev,
      applicationId: application.id,
      name: application.fullName,
      email: application.email,
      phoneNumber: application.phoneNumber,
    }));

    setPhoneDigits(application.phoneNumber.replace(/\D/g, '').slice(-10));
    setErrors(prev => {
      const next = { ...prev };
      delete next.applicationId;
      delete next.name;
      delete next.email;
      delete next.phoneNumber;
      return next;
    });
  };

  const handlePhoneDigitChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);

    const phoneValidation = validatePhoneDigits(digits);
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
    const nameValidation = validateUserName(value);
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

  const showAccountFields = formData.role !== 'CLIENT' || Boolean(selectedApplication);

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
        role: 'ADMIN',
        twoFactorEnabled: false,
        applicationId: null,
      });
      setPhoneDigits('');
      setErrors({});
      setValidations({ name: false, email: false, phoneNumber: false });
      setEmailWarning('');
      setSelectedApplicationId('');
      setApplicationSearchQuery('');
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
          <div className="p-6 shrink-0">
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
              {/* Role Cards */}
              <div className="mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Account type</p>
                  <p className="text-xs text-slate-500">Choose the account kind before entering details</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: 'ADMIN', label: 'Admin', description: 'Standard internal admin access', icon: Shield },
                    { value: 'SUPERADMIN', label: 'Super Admin', description: 'Full administrative access', icon: ShieldCheck },
                    { value: 'CLIENT', label: 'Client', description: 'Provision from an approved application', icon: UserCircle2 },
                  ].map(option => {
                    const Icon = option.icon;
                    const active = formData.role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoleSelect(option.value as UserFormData['role'])}
                        className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                      >
                        <div className={`mb-3 inline-flex rounded-xl p-2 ${active ? 'bg-cyan-500/15 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>
                          <Icon size={18} />
                        </div>
                        <p className="font-semibold text-white">{option.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.role === 'CLIENT' && (
                <div className="mb-5 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-white">Approved application</p>
                      <p className="text-xs text-slate-500">Search and pick the approved application that will provision the client account and subscription.</p>
                    </div>
                    {selectedApplication && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApplicationId('');
                          setFormData(prev => ({ ...prev, applicationId: null }));
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next.applicationId;
                            return next;
                          });
                        }}
                        className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={applicationSearchQuery}
                      onChange={e => setApplicationSearchQuery(e.target.value)}
                      placeholder="Search by ticket, name, email, plan, branch..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-white/8"
                    />
                  </div>

                  {isLoadingApplications ? (
                    <p className="text-sm text-slate-400">Loading approved applications...</p>
                  ) : applicationLoadError ? (
                    <p className="text-sm text-red-300">{applicationLoadError}</p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {filteredApplications.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                          No approved applications match your search.
                        </div>
                      ) : (
                        filteredApplications.map(application => {
                          const isSelected = selectedApplicationId === application.id;

                          return (
                            <button
                              key={application.id}
                              type="button"
                              onClick={() => handleApprovedApplicationSelect(application)}
                              className={`w-full rounded-xl border p-4 text-left transition-all ${isSelected ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-white">{application.fullName}</span>
                                    <span className="rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-xs text-slate-300">{application.ticketNumber}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 break-words">{application.email}</p>
                                  <p className="text-xs text-slate-400 break-words">{application.planName} · PHP {application.planMonthlyPrice.toLocaleString()} / month · {application.planDeviceCap} devices</p>
                                  <p className="text-xs text-slate-500 break-words">{application.branchName}{application.branchCity ? ` · ${application.branchCity}` : ''}{application.branchProvince ? `, ${application.branchProvince}` : ''}</p>
                                </div>
                                <div className="text-xs text-slate-500 md:text-right">
                                  {isSelected ? 'Selected' : 'Tap to select'}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  {selectedApplication && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                      <p className="font-medium text-white">{selectedApplication.fullName}</p>
                      <p className="mt-1 text-xs text-cyan-100/80">Client account will be created from this approved application and the subscription will use {selectedApplication.planName}.</p>
                    </div>
                  )}

                  {errors.applicationId && <p className="text-red-400 text-xs">{errors.applicationId}</p>}
                </div>
              )}

              <div className={!showAccountFields ? 'hidden' : ''}>
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
                      value={formatPhoneDigitsForInput(phoneDigits)}
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

                {/* Role Summary */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Shield size={16} className="text-cyan-400" />
                      Role
                    </span>
                  </label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    {formData.role === 'ADMIN' ? 'Admin' : formData.role === 'SUPERADMIN' ? 'Super Admin' : 'Client'}
                  </div>
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
          <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-linear-to-t from-white/5 to-transparent">
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
