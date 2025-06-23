import React, { useEffect, useState } from 'react';
import { Users, Car, Route, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Define a User interface matching Firestore user documents
interface User {
  id: string;
  name: string;
  role: string;
  rides?: number;
  rating?: number;
  // add any other user fields here if needed
}

export function DashboardOverview() {
  const [stats, setStats] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<
    { name: string; rides: number; rating: number }[]
  >([]);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      // Cast doc.data() to Omit<User, 'id'> since id comes from doc.id
      const allUsers: User[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>),
      }));

      const drivers = allUsers.filter(u => u.role === 'driver');
      const clients = allUsers.filter(u => u.role === 'client');

      const driverRatings = drivers
        .map(d => ({
          name: d.name,
          rides: d.rides || 0,
          rating: d.rating || 5
        }))
        .sort((a, b) => b.rides - a.rides)
        .slice(0, 5);

      setTopDrivers(driverRatings);

      setStats(current => {
        const others = current.filter(
          s => s.title !== 'Total Users' && s.title !== 'Active Drivers'
        );
        return [
          {
            title: 'Total Users',
            value: clients.length.toLocaleString(),
            change: '+12% from last month',
            changeType: 'positive',
            icon: Users,
            iconColor: 'bg-blue-600'
          },
          {
            title: 'Active Drivers',
            value: drivers.length.toLocaleString(),
            change: '+8% from last month',
            changeType: 'positive',
            icon: Car,
            iconColor: 'bg-green-600'
          },
          ...others
        ];
      });
    });

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      let totalRides = snapshot.size;
      let dailyMap: { [date: string]: { rides: number; revenue: number } } = {};

      snapshot.forEach(doc => {
        const b = doc.data();
        const date = b.createdAt?.toDate().toISOString().split('T')[0];
        if (!date) return;
        if (!dailyMap[date]) dailyMap[date] = { rides: 0, revenue: 0 };
        dailyMap[date].rides += 1;
      });

      const daily = Object.entries(dailyMap)
        .map(([date, data]) => ({
          date,
          ...data
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDailyData(daily);

      setStats(current => {
        const others = current.filter(s => s.title !== 'Total Rides');
        return [
          ...others,
          {
            title: 'Total Rides',
            value: totalRides.toLocaleString(),
            change: '+15% from last month',
            changeType: 'positive',
            icon: Route,
            iconColor: 'bg-purple-600'
          }
        ];
      });
    });

    const unsubscribePayments = onSnapshot(
      query(collection(db, 'payments'), where('status', '==', 'SUCCESSFUL')),
      (snapshot) => {
        let revenue = 0;
        let dailyRevenue: { [date: string]: number } = {};

        snapshot.forEach(doc => {
          const p = doc.data();
          const amount = p.amount || 0;
          revenue += amount;

          const date = p.createdAt?.toDate().toISOString().split('T')[0];
          if (!date) return;
          if (!dailyRevenue[date]) dailyRevenue[date] = 0;
          dailyRevenue[date] += amount;
        });

        setDailyData(prev =>
          prev.map(d => ({
            ...d,
            revenue: dailyRevenue[d.date] || 0
          }))
        );

        setStats(current => {
          const others = current.filter(s => s.title !== 'Revenue');
          return [
            ...others,
            {
              title: 'Revenue',
              // <-- Changed here: show raw RWF amount with thousands separator, no conversion
              value: `RWF ${revenue.toLocaleString()}`,
              change: '+18% from last month',
              changeType: 'positive',
              icon: DollarSign,
              iconColor: 'bg-orange-600'
            }
          ];
        });
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeBookings();
      unsubscribePayments();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Rides</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Rides']}
              />
              <Line
                type="monotone"
                dataKey="rides"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              />
              <YAxis
                tick={{ fontSize: 12 }}
                // Show RWF in thousands with M suffix removed (show full amount)
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`RWF ${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Drivers</h3>
        <div className="space-y-4">
          {topDrivers.map((driver, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {driver.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{driver.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Route className="w-4 h-4" />
                      <span>{driver.rides} rides</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{driver.rating} rating</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">#{index + 1}</div>
                <div className="text-sm text-gray-600">Rank</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
