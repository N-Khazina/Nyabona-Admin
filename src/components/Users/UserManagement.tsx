import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Filter, User, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';
import debounce from 'lodash.debounce';

type StatusFilter = 'all' | 'active' | 'banned' | 'pending';
type ValidStatus = Exclude<StatusFilter, 'all'>;

interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: StatusFilter;
  totalRides: number;
  joinDate: Date;
  role: string;
}

export function UserManagement() {
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'client'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const clients = await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        const ridesQuery = query(collection(db, 'bookings'), where('clientId', '==', data.clientId || docSnap.id));
        const ridesSnapshot = await getDocs(ridesQuery);

        return {
          id: data.clientId || docSnap.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.profileImageURL || '',  // <-- changed here to use profileImageURL
          status: (['active', 'banned'].includes(data.status) ? data.status : 'active') as StatusFilter,
          totalRides: ridesSnapshot.size,
          joinDate: data.createdAt ? new Date(data.createdAt) : new Date(),
          role: data.role || ''
        };
      }));

      setAllUsers(clients);
    });

    return () => unsubscribe();
  }, []);

  const filterUsers = useMemo(
    () => debounce((term: string, status: StatusFilter) => {
      const filtered = allUsers.filter(user => {
        const matchesSearch =
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.phone.includes(term);
        const matchesStatus = status === 'all' || user.status === status;
        return matchesSearch && matchesStatus;
      });
      setFilteredUsers(filtered);
    }, 300),
    [allUsers]
  );

  useEffect(() => {
    filterUsers(searchTerm.toLowerCase(), statusFilter);
  }, [searchTerm, statusFilter, allUsers]);

  const toggleStatus = async (userId: string, currentStatus: StatusFilter) => {
    const newStatus: ValidStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const previous = [...allUsers];

    setAllUsers(users =>
      users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );

    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Reverting.');
      setAllUsers(previous);
    }
  };

  const getStatusBadge = (status: ValidStatus) => {
    const styles: Record<ValidStatus, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      banned: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const icons: Record<ValidStatus, React.ElementType> = {
      active: CheckCircle,
      banned: XCircle,
      pending: AlertCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600">Manage all registered users</p>
        </div>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold">{filteredUsers.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rides</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Join Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(user.status as ValidStatus)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{user.totalRides}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        className={`text-sm font-medium ${user.status === 'banned' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                      >
                        {user.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                {getStatusBadge(selectedUser.status as ValidStatus)}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Rides</label>
                  <p className="text-sm text-gray-600">{selectedUser.totalRides}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Join Date</label>
                  <p className="text-sm text-gray-600">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
