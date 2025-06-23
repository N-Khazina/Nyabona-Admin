import { useEffect, useState } from 'react';
import {
  Search, Filter, MapPin, Clock, DollarSign, Calendar,
  CheckCircle, XCircle, Play
} from 'lucide-react';
import { Ride } from '../../types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export function RideManagement() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const ridePromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        if (data.type !== 'ride') return null;

        const clientId = data.clientId;
        const driverId = data.driverId;

        const [userDoc, driverDoc] = await Promise.all([
          getDoc(doc(db, 'users', clientId)),
          getDoc(doc(db, 'users', driverId)),
        ]);

        const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User';
        const driverName = driverDoc.exists() ? driverDoc.data().name : 'Unknown Driver';

        return {
          id: docSnap.id,
          userId: clientId,
          driverId: driverId,
          userName,
          driverName,
          from: data.pickup?.address || 'Unknown Pickup',
          to: data.destination?.address || 'Unknown Destination',
          status: data.status || 'pending',
          fare: data.amount || 0,
          date: data.createdAt?.toDate?.() || new Date(),
          duration: data.distance ? `${data.distance.toFixed(1)} km` : undefined,
          type: 'ride',
        } as Ride;
      });

      const resolved = await Promise.all(ridePromises);
      setRides(resolved.filter((r): r is Ride => r !== null));
    };

    fetchRides();
  }, []);

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Ride['status']) => {
    const styles: Record<string, string> = {
      ongoing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const icons: Record<string, React.ElementType> = {
      ongoing: Play,
      completed: CheckCircle,
      cancelled: XCircle,
      scheduled: Clock,
      pending: Clock,
    };

    const Icon = icons[status] || Clock;
    const style = styles[status] || styles.pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rides</h3>
          <p className="text-sm text-gray-600">Monitor all ride activities</p>
        </div>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Ongoing: <span className="font-semibold text-blue-600">{rides.filter(r => r.status === 'ongoing').length}</span></span>
          <span>Completed: <span className="font-semibold text-green-600">{rides.filter(r => r.status === 'completed').length}</span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, driver, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Ride Details</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Fare</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">User: {ride.userName}</p>
                      <p className="text-sm text-gray-600">Driver: {ride.driverName}</p>
                      {ride.duration && (
                        <p className="text-xs text-gray-500">Duration: {ride.duration}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{ride.from}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{ride.to}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(ride.status)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      <span>RWF {ride.fare.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ride.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ride.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedRide(ride)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ride Detail Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ride Details</h3>
              <button
                onClick={() => setSelectedRide(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  RWF {selectedRide.fare.toLocaleString()}
                </div>
                {getStatusBadge(selectedRide.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedRide.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Driver</label>
                  <p className="text-sm text-gray-900">{selectedRide.driverName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Route</label>
                  <p className="text-sm text-gray-900">From: {selectedRide.from}</p>
                  <p className="text-sm text-gray-900">To: {selectedRide.to}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRide.date).toLocaleDateString()} at {new Date(selectedRide.date).toLocaleTimeString()}
                  </p>
                </div>
                {selectedRide.duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Distance</label>
                    <p className="text-sm text-gray-900">{selectedRide.duration}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
