'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  FilterIcon,
  UserPlusIcon,
  UserXIcon,
  EditIcon,
  ShieldIcon,
  MailIcon,
  PhoneIcon,
  MoreVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  BadgeCheckIcon,
  FingerprintIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge } from '../../components/StatusBadge';
import { AddUserModal, type UserFormData } from './components/AddUserModal';
import { EditUserModal, type EditUserData } from './components/EditUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { createUserAccount, deleteUserAccount, fetchUsersForManagement, updateUserAccount, type UserManagementItem } from '../../_actions/users';

const roleColors = {
  admin: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  user: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const roleIcons = {
  admin: ShieldIcon,
  user: UserPlusIcon,
};

type RoleFilter = 'all' | 'admin' | 'user';
type StatusFilter = 'all' | 'normal' | 'warning';

function formatFriendlyDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatPhoneDisplay(phoneNumber: string | null | undefined): string {
  if (!phoneNumber || phoneNumber.trim() === '') return '(none)';
  const digits = phoneNumber.replace(/\D/g, '').slice(-10);
  if (digits.length === 0) return '(none)';
  if (digits.length <= 3) return `+63 ${digits}`;
  if (digits.length <= 6) return `+63 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserManagementItem | null>(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserManagementItem | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotification(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const refreshUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const items = await fetchUsersForManagement();
      setUsers(items);
      setPageError(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter(user => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.phoneNumber.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter, users]);

  const totalCount = users.length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const securityReadyCount = users.filter(user => user.twoFactorEnabled).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleAddUser = async (userData: UserFormData) => {
    await createUserAccount(userData);
    setNotification({
      message: `User ${userData.name} created successfully. Credentials were emailed to ${userData.email}.`,
      type: 'success',
    });
    void refreshUsers();
  };

  const handleEditUser = (user: UserManagementItem) => {
    setSelectedUserForEdit(user);
    setIsEditUserModalOpen(true);
  };

  const handleDeleteUser = (user: UserManagementItem) => {
    setSelectedUserForDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleSaveUserChanges = async (userId: string, updates: EditUserData) => {
    await updateUserAccount(userId, updates);
    setNotification({
      message: `User updated successfully.`,
      type: 'success',
    });
    void refreshUsers();
    setIsEditUserModalOpen(false);
  };

  const handleConfirmDeleteUser = async (userId: string) => {
    try {
      setIsDeletingUser(true);
      await deleteUserAccount(userId);
      setNotification({
        message: 'User deactivated successfully.',
        type: 'success',
      });
      await refreshUsers();
      setIsDeleteUserModalOpen(false);
      setSelectedUserForDelete(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}
        >
          {notification.type === 'success' ? <CheckCircleIcon size={20} /> : <XCircleIcon size={20} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6 pb-8 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-slate-400 mt-1">Manage admin and user accounts from a single source of truth.</p>
          </div>
          <motion.button
            onClick={() => setIsAddUserModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <UserPlusIcon size={20} />
            Add User
          </motion.button>
        </div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard glowColor="cyan" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-white">{totalCount}</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <UserPlusIcon className="text-cyan-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard glowColor="red" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Admin Users</p>
                <p className="text-3xl font-bold text-red-400">{adminCount}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <ShieldIcon className="text-red-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard glowColor="emerald" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Security Ready</p>
                <p className="text-3xl font-bold text-emerald-400">{securityReadyCount}</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <BadgeCheckIcon className="text-emerald-400" size={24} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative group">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all flex items-center gap-2">
                  <FilterIcon size={18} />
                  Role
                </button>
                <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-40 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                  {(['all', 'admin', 'user'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-all ${
                        roleFilter === role ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role === 'admin' ? 'Admin' : 'User'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all flex items-center gap-2">
                  <FilterIcon size={18} />
                  Status
                </button>
                <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-40 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                  {(['all', 'normal', 'warning'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-all ${
                        statusFilter === status ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      {status === 'all' ? 'All' : status === 'normal' ? 'Active' : 'Restricted'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {pageError && (
          <GlassCard className="p-5 border border-red-500/20 bg-red-500/5 text-red-300">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p>{pageError}</p>
              <button
                onClick={() => void refreshUsers()}
                className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </GlassCard>
        )}

        <motion.div variants={containerVariants} className="space-y-3">
          {isLoadingUsers ? (
            <GlassCard className="p-12 text-center">
              <p className="text-slate-400">Loading users...</p>
            </GlassCard>
          ) : filteredUsers.length === 0 ? (
            <motion.div variants={itemVariants}>
              <GlassCard className="p-12 text-center">
                <UserXIcon className="mx-auto mb-4 text-slate-500" size={40} />
                <p className="text-slate-400">No users found matching your criteria.</p>
              </GlassCard>
            </motion.div>
          ) : (
            filteredUsers.map(user => {
              const RoleIcon = roleIcons[user.role];
              const roleStyle = roleColors[user.role];
              const isExpanded = expandedUser === user.id;

              return (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  className="cursor-pointer"
                >
                  <GlassCard glowColor={user.status === 'normal' ? 'cyan' : 'red'} hover className="p-5">
                    <div className="flex items-center justify-between gap-4" onClick={() => setExpandedUser(isExpanded ? null : user.id)}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 flex items-center justify-center border border-cyan-500/30 shrink-0">
                          <span className="text-lg font-bold text-cyan-400">
                            {user.name
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-semibold text-white truncate">{user.name}</h3>
                            <StatusBadge status={user.status} />
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border} flex items-center gap-1`}
                            >
                              <RoleIcon size={12} />
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden md:block text-sm text-slate-500">Joined {user.joinedLabel}</span>
                        <motion.button
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <MoreVerticalIcon size={20} className="text-slate-400" />
                        </motion.button>
                      </div>
                    </div>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <MailIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Email</p>
                              <p className="text-sm text-slate-300">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <PhoneIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                              <p className={`text-sm ${user.phoneNumber && user.phoneNumber.trim() !== '' ? 'text-slate-300' : 'text-slate-500'}`}>
                                {formatPhoneDisplay(user.phoneNumber)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <FingerprintIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Two-Factor</p>
                              <p className="text-sm text-slate-300">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <BadgeCheckIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Email Verification</p>
                              <p className="text-sm text-slate-300">{user.emailVerified ? 'Verified' : 'Unverified'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <CalendarIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Joined</p>
                              <p className="text-sm text-slate-300">{formatFriendlyDate(user.joinedAt)}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MoreVerticalIcon size={18} className="text-cyan-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Last Activity</p>
                              <p className="text-sm text-slate-300">{user.lastActiveLabel}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10" onClick={e => e.stopPropagation()}>
                          <motion.button
                            onClick={() => handleEditUser(user)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <EditIcon size={16} />
                            Edit
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteUser(user)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <UserXIcon size={16} />
                            Deactivate
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="text-sm text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </motion.div>

        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSubmit={handleAddUser}
        />

        <EditUserModal
          isOpen={isEditUserModalOpen}
          user={selectedUserForEdit}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUserForEdit(null);
          }}
          onSubmit={handleSaveUserChanges}
        />

        <DeleteUserModal
          isOpen={isDeleteUserModalOpen}
          user={selectedUserForDelete}
          isLoading={isDeletingUser}
          onClose={() => {
            setIsDeleteUserModalOpen(false);
            setSelectedUserForDelete(null);
          }}
          onConfirm={handleConfirmDeleteUser}
        />
      </motion.div>
    </>
  );
}
