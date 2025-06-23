import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Car
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

type StatusFilter = 'all' | 'active' | 'offline' | 'rejected' | 'banned';
type ValidStatus = Exclude<StatusFilter, 'all'>;

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: StatusFilter;
  rating: number;
  licenseNumber: string;
  vehicleType: string;
  totalRides: number;
  joinDate: Date;
  documents: Record<string, string>;
}

export function DriverManagement() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const drivers = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const ridesQuery = query(collection(db, 'bookings'), where('driverId', '==', docSnap.id));
        const ridesSnapshot = await getDocs(ridesQuery);

        return {
          id: docSnap.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.profileImageURL || '',
          status: (['active', 'offline', 'rejected', 'banned'].includes(data.status) ? data.status : 'offline') as StatusFilter,
          rating: data.rating || 0,
          licenseNumber: data.licenseNumber || '',
          vehicleType: data.vehicleType || '',
          totalRides: ridesSnapshot.size,
          joinDate: data.createdAt ? new Date(data.createdAt) : new Date(),
          documents: data.documents || {}
        } as Driver;
      }));
      setAllDrivers(drivers);
    });

    return () => unsubscribe();
  }, []);

  const filterDrivers = useMemo(() => debounce((term: string, status: StatusFilter) => {
    const filtered = allDrivers.filter(driver => {
      const lowerTerm = term.toLowerCase();
      const matchesSearch =
        driver.name.toLowerCase().includes(lowerTerm) ||
        driver.email.toLowerCase().includes(lowerTerm) ||
        driver.phone.includes(lowerTerm) ||
        driver.licenseNumber.toLowerCase().includes(lowerTerm);
      const matchesStatus = status === 'all' || driver.status === status;
      return matchesSearch && matchesStatus;
    });
    setFilteredDrivers(filtered);
  }, 300), [allDrivers]);

  useEffect(() => {
    filterDrivers(searchTerm, statusFilter);
  }, [searchTerm, statusFilter, allDrivers, filterDrivers]);

  const changeStatus = async (driverId: string, newStatus: ValidStatus, email?: string, name?: string) => {
    const prevDrivers = [...allDrivers];
    setAllDrivers(drivers =>
      drivers.map(d => d.id === driverId ? { ...d, status: newStatus } : d)
    );
    try {
      await updateDoc(doc(db, 'users', driverId), { status: newStatus });

      if ((newStatus === 'active') && email && name) {
        // Call backend API to send email
        await fetch('/api/notify-driver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        });
      }
    } catch (error) {
      console.error('Failed to update driver status:', error);
      alert('Failed to update driver status. Reverting.');
      setAllDrivers(prevDrivers);
    }
  };

  const getStatusBadge = (status: ValidStatus) => {
    const styles: Record<ValidStatus, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      offline: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      banned: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const icons: Record<ValidStatus, React.ElementType> = {
      active: CheckCircle,
      offline: AlertCircle,
      rejected: XCircle,
      banned: XCircle,
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Driver Management</h3>
          <p className="text-sm text-gray-600">Manage driver registrations and approvals</p>
        </div>
        <div className="text-sm text-gray-600">
          Total Drivers: <span className="font-semibold">{filteredDrivers.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers by name, email, phone, or license..."
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
              <option value="offline">Offline</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Driver</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rating</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rides</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {driver.avatar ? (
                        <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      License: {driver.licenseNumber}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span>{driver.vehicleType}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(driver.status as ValidStatus)}
                  </td>
                  <td className="py-4 px-6">
                    {driver.rating > 0 ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(Math.floor(driver.rating))}
                        </div>
                        <span className="text-sm text-gray-600">{driver.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No ratings</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{driver.totalRides}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      {driver.status === 'offline' && (
                        <>
                          <button
                            onClick={() => changeStatus(driver.id, 'active')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => changeStatus(driver.id, 'rejected')}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {driver.status === 'active' && (
                        <button
                          onClick={() => changeStatus(driver.id, 'banned')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Ban
                        </button>
                      )}
                      {(driver.status === 'banned' || driver.status === 'rejected') && (
                        <button
                          onClick={() => changeStatus(driver.id, 'active')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Driver Details</h3>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              {selectedDriver.avatar ? (
                <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div>
                <h4 className="text-xl font-semibold">{selectedDriver.name}</h4>
                {getStatusBadge(selectedDriver.status as ValidStatus)}
                {selectedDriver.rating > 0 && (
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(Math.floor(selectedDriver.rating))}
                    <span className="text-gray-600">{selectedDriver.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Contact Info</h5>
                <p><strong>Email:</strong> {selectedDriver.email}</p>
                <p><strong>Phone:</strong> {selectedDriver.phone}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Driver Info</h5>
                <p><strong>License Number:</strong> {selectedDriver.licenseNumber}</p>
                <p><strong>Vehicle Type:</strong> {selectedDriver.vehicleType}</p>
                <p><strong>Total Rides:</strong> {selectedDriver.totalRides}</p>
                <p><strong>Join Date:</strong> {selectedDriver.joinDate.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">Documents</h5>
              {Object.entries(selectedDriver.documents).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(selectedDriver.documents).map(([type, filename]) => (
                    <li key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize font-medium">{type}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No documents available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
