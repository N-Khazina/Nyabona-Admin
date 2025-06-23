import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Users, Car, Route, DollarSign, Calendar
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AnalyticsView() {
  const [dailyRides, setDailyRides] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      let drivers = 0;
      let clients = 0;
      const driverStats: any[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'driver') {
          drivers++;
          driverStats.push({
            name: data.name || 'Unnamed',
            rides: data.rides || 0,
            rating: data.rating || 5
          });
        } else if (data.role === 'client') {
          clients++;
        }
      });

      setActiveDrivers(drivers);
      setActiveUsers(clients);
      setTopDrivers(driverStats.sort((a, b) => b.rides - a.rides).slice(0, 5));
    });

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      let dailyMap: { [date: string]: { rides: number; revenue: number } } = {};

      snapshot.forEach(doc => {
        const b = doc.data();
        const date = b.createdAt?.toDate().toISOString().split('T')[0];
        if (!date) return;
        if (!dailyMap[date]) dailyMap[date] = { rides: 0, revenue: 0 };
        dailyMap[date].rides += 1;
      });

      setTotalRides(snapshot.size);

      const daily = Object.entries(dailyMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDailyRides(daily);
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

        setTotalRevenue(revenue);
        setDailyRides(prev => prev.map(day => ({
          ...day,
          revenue: dailyRevenue[day.date] || 0
        })));
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeBookings();
      unsubscribePayments();
    };
  }, []);

  const revenueData = dailyRides.map((day, i) => ({
    ...day,
    cumulative: dailyRides.slice(0, i + 1).reduce((sum, d) => sum + d.revenue, 0)
  }));

  const statusData = [
    { name: 'Completed Rides', value: totalRides, color: '#10B981' },
    { name: 'Active Rentals', value: 15, color: '#F59E0B' },
    { name: 'Cancelled', value: 45, color: '#EF4444' },
    { name: 'Scheduled', value: 23, color: '#8B5CF6' }
  ];

  const performanceData = topDrivers.map(d => ({
    name: d.name.split(' ')[0],
    rides: d.rides,
    rating: d.rating * 20
  }));

  const avgRevenue = dailyRides.length > 0
    ? (dailyRides.reduce((sum, day) => sum + day.revenue, 0) / dailyRides.length)
    : 0;
  const avgRides = dailyRides.length > 0
    ? (dailyRides.reduce((sum, day) => sum + day.rides, 0) / dailyRides.length)
    : 0;
  const driverUtilization = activeDrivers > 0 ? ((activeDrivers / (activeDrivers + 25)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`RWF ${totalRevenue.toLocaleString()}`} growth="+18%" icon={<DollarSign />} color="blue" />
        <MetricCard title="Total Rides" value={totalRides.toLocaleString()} growth="+15%" icon={<Route />} color="green" />
        <MetricCard title="Active Users" value={activeUsers.toLocaleString()} growth="+8%" icon={<Users />} color="purple" />
        <MetricCard title="Active Drivers" value={activeDrivers} growth="+12%" icon={<Car />} color="orange" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" icon={<TrendingUp className="text-green-600" />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Top Driver Performance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rides" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rating" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Activity">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRides}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rides" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Average Daily Revenue" value={`RWF ${avgRevenue.toFixed(0)}`} color="blue" />
        <SummaryCard title="Average Daily Rides" value={Math.round(avgRides)} color="green" />
        <SummaryCard title="Driver Utilization Rate" value={`${driverUtilization}%`} color="purple" />
      </div>
    </div>
  );
}

// Helper UI components
function MetricCard({ title, value, growth, icon, color }: any) {
  return (
    <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-100 text-sm`}>{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-${color}-100 text-sm mt-1`}>{growth} this month</p>
        </div>
        <div className={`text-${color}-200`}>{icon}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, children }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        {icon}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ title, value, color }: any) {
  return (
    <div className={`text-center p-4 bg-${color}-50 rounded-lg`}>
      <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
