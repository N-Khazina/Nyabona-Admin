export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'banned' | 'pending';
  joinDate: string;
  totalRides: number;
  avatar?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'rejected' | 'banned';
  licenseNumber: string;
  vehicleType: string;
  rating: number;
  totalRides: number;
  joinDate: string;
  avatar?: string;
  documents: {
    license: string;
    insurance: string;
    vehicle: string;
  };
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string;
  userName: string;
  driverName: string;
  from: string;
  to: string;
  status: 'ongoing' | 'completed' | 'cancelled' | 'scheduled';
  type: 'ride' | 'rental';
  fare: number;
  date: string;
  duration?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  type: 'user' | 'driver';
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Analytics {
  totalRides: number;
  totalRentals: number;
  totalRevenue: number;
  activeUsers: number;
  activeDrivers: number;
  monthlyGrowth: number;
  dailyRides: Array<{ date: string; rides: number; revenue: number }>;
  topDrivers: Array<{ name: string; rides: number; rating: number }>;
}