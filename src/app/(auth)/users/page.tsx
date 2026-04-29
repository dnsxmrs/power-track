'use client';

import { useMemo, useState } from 'react';
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
  MapPinIcon,
  MoreVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { StatusBadge } from '../../components/StatusBadge';
import { AddUserModal, type UserFormData } from './components/AddUserModal';
import type { StatusType } from '../../types/status';

const usersData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+63 (917) 123-4567',
    role: 'admin' as const,
    status: 'normal' as StatusType,
    joinDate: '2024-01-15',
    lastActive: '2 min ago',
    department: 'Operations',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@company.com',
    phone: '+63 (918) 234-5678',
    role: 'manager' as const,
    status: 'normal' as StatusType,
    joinDate: '2024-02-20',
    lastActive: '5 min ago',
    department: 'Management',
  },
  {
    id: 3,
    name: 'Juan Cruz',
    email: 'juan.cruz@company.com',
    phone: '+63 (919) 345-6789',
    role: 'viewer' as const,
    status: 'normal' as StatusType,
    joinDate: '2024-03-10',
    lastActive: '1 hour ago',
    department: 'Warehouse',
  },
  {
    id: 4,
    name: 'Rosa Mendoza',
    email: 'rosa.mendoza@company.com',
    phone: '+63 (916) 456-7890',
    role: 'manager' as const,
    status: 'warning' as StatusType,
    joinDate: '2024-01-25',
    lastActive: '3 days ago',
    department: 'Administration',
  },
  {
    id: 5,
    name: 'Carlos Reyes',
    email: 'carlos.reyes@company.com',
    phone: '+63 (917) 567-8901',
    role: 'viewer' as const,
    status: 'normal' as StatusType,
    joinDate: '2024-04-05',
    lastActive: '2 hours ago',
    department: 'Maintenance',
  },
  {
    id: 6,
    name: 'Ana Garcia',
    email: 'ana.garcia@company.com',
    phone: '+63 (918) 678-9012',
    role: 'admin' as const,
    status: 'normal' as StatusType,
    joinDate: '2024-02-01',
    lastActive: '15 min ago',
    department: 'IT Support',
  },
];

const roleColors = {
  admin: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  manager: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  viewer: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

const roleIcons = {
  admin: ShieldIcon,
  manager: UserPlusIcon,
  viewer: UserPlusIcon,
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'viewer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning'>('all');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return usersData.filter(user => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.department.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const activeCount = usersData.filter(u => u.status === 'normal').length;
  const warningCount = usersData.filter(u => u.status === 'warning').length;
  const adminCount = usersData.filter(u => u.role === 'admin').length;

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
    // TODO: Implement API call to create user
    console.log('Creating user:', userData);
    // Example: await fetch('/api/users', { method: 'POST', body: JSON.stringify(userData) })
    // For now, just log and show success
    alert(`User ${userData.name} would be created with role ${userData.role}`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 pb-8 p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-1">Manage user accounts, roles, and permissions.</p>
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

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <GlassCard glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-2">Total Users</p>
              <p className="text-3xl font-bold text-white">{usersData.length}</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <UserPlusIcon className="text-cyan-400" size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="emerald" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-2">Active Users</p>
              <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CheckCircleIcon className="text-emerald-400" size={24} />
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
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <div className="relative group">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all flex items-center gap-2">
                <FilterIcon size={18} />
                Role
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-40 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl z-10">
                {(['all', 'admin', 'manager', 'viewer'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-all first:rounded-t-lg last:rounded-b-lg ${
                      roleFilter === role ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all flex items-center gap-2">
                <FilterIcon size={18} />
                Status
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-40 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl z-10">
                {(['all', 'normal', 'warning'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-all first:rounded-t-lg last:rounded-b-lg ${
                      statusFilter === status ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'normal' ? 'Active' : 'Inactive'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div variants={containerVariants} className="space-y-3">
        {filteredUsers.length === 0 ? (
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
                onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                className="cursor-pointer"
              >
                <GlassCard glowColor={user.status === 'normal' ? 'cyan' : 'none'} hover className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 flex items-center justify-center border border-cyan-500/30">
                        <span className="text-lg font-bold text-cyan-400">
                          {user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <StatusBadge status={user.status} />
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border} flex items-center gap-1`}
                          >
                            <RoleIcon size={12} />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{user.lastActive}</span>
                      <motion.button
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <MoreVerticalIcon size={20} className="text-slate-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Details */}
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
                            <p className="text-sm text-slate-300">{user.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPinIcon size={18} className="text-cyan-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Department</p>
                            <p className="text-sm text-slate-300">{user.department}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <ShieldIcon size={18} className="text-cyan-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Join Date</p>
                            <p className="text-sm text-slate-300">{user.joinDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <EditIcon size={16} />
                          Edit
                        </motion.button>
                        <motion.button
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

      {/* Results Count */}
      <motion.div variants={itemVariants} className="text-sm text-slate-400">
        Showing {filteredUsers.length} of {usersData.length} users
      </motion.div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </motion.div>
  );
}
