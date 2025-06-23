import { User, Driver, Ride, Report, Analytics } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+256700123456',
    status: 'active',
    joinDate: '2024-01-15',
    totalRides: 45,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+256700123457',
    status: 'active',
    joinDate: '2024-02-01',
    totalRides: 32,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+256700123458',
    status: 'banned',
    joinDate: '2024-01-20',
    totalRides: 8,
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    phone: '+256700123459',
    status: 'active',
    joinDate: '2024-03-10',
    totalRides: 15,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
  }
];

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'James Mukasa',
    email: 'james@example.com',
    phone: '+256700234567',
    status: 'active',
    licenseNumber: 'DL123456789',
    vehicleType: 'Sedan',
    rating: 4.8,
    totalRides: 127,
    joinDate: '2023-12-01',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    documents: {
      license: 'license_123.pdf',
      insurance: 'insurance_123.pdf',
      vehicle: 'vehicle_123.pdf'
    }
  },
  {
    id: '2',
    name: 'Grace Nakato',
    email: 'grace@example.com',
    phone: '+256700234568',
    status: 'pending',
    licenseNumber: 'DL987654321',
    vehicleType: 'SUV',
    rating: 0,
    totalRides: 0,
    joinDate: '2024-12-01',
    documents: {
      license: 'license_124.pdf',
      insurance: 'insurance_124.pdf',
      vehicle: 'vehicle_124.pdf'
    }
  },
  {
    id: '3',
    name: 'Peter Ssemakula',
    email: 'peter@example.com',
    phone: '+256700234569',
    status: 'active',
    licenseNumber: 'DL456789123',
    vehicleType: 'Hatchback',
    rating: 4.6,
    totalRides: 89,
    joinDate: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    documents: {
      license: 'license_125.pdf',
      insurance: 'insurance_125.pdf',
      vehicle: 'vehicle_125.pdf'
    }
  }
];

export const mockRides: Ride[] = [
  {
    id: '1',
    userId: '1',
    driverId: '1',
    userName: 'John Doe',
    driverName: 'James Mukasa',
    from: 'Kampala City',
    to: 'Entebbe Airport',
    status: 'completed',
    type: 'ride',
    fare: 25000,
    date: '2024-12-01T14:30:00Z',
    duration: '45 mins'
  },
  {
    id: '2',
    userId: '2',
    driverId: '3',
    userName: 'Sarah Wilson',
    driverName: 'Peter Ssemakula',
    from: 'Makerere University',
    to: 'Garden City Mall',
    status: 'ongoing',
    type: 'ride',
    fare: 15000,
    date: '2024-12-01T16:00:00Z'
  },
  {
    id: '3',
    userId: '4',
    driverId: '1',
    userName: 'Emma Davis',
    driverName: 'James Mukasa',
    from: 'Ntinda',
    to: 'Jinja Road',
    status: 'scheduled',
    type: 'rental',
    fare: 120000,
    date: '2024-12-02T09:00:00Z',
    duration: '8 hours'
  }
];

export const mockReports: Report[] = [
  {
    id: '1',
    reporterId: '1',
    reporterName: 'John Doe',
    reportedId: '2',
    reportedName: 'Grace Nakato',
    type: 'driver',
    reason: 'Reckless driving',
    description: 'Driver was speeding and not following traffic rules',
    status: 'pending',
    date: '2024-12-01T10:00:00Z',
    severity: 'high'
  },
  {
    id: '2',
    reporterId: '3',
    reporterName: 'Peter Ssemakula',
    reportedId: '3',
    reportedName: 'Mike Johnson',
    type: 'user',
    reason: 'Inappropriate behavior',
    description: 'User was rude and abusive during the ride',
    status: 'resolved',
    date: '2024-11-28T15:30:00Z',
    severity: 'medium'
  }
];

export const mockAnalytics: Analytics = {
  totalRides: 1247,
  totalRentals: 156,
  totalRevenue: 45000000,
  activeUsers: 1250,
  activeDrivers: 89,
  monthlyGrowth: 12.5,
  dailyRides: [
    { date: '2024-11-25', rides: 45, revenue: 1200000 },
    { date: '2024-11-26', rides: 52, revenue: 1450000 },
    { date: '2024-11-27', rides: 38, revenue: 980000 },
    { date: '2024-11-28', rides: 61, revenue: 1680000 },
    { date: '2024-11-29', rides: 49, revenue: 1320000 },
    { date: '2024-11-30', rides: 57, revenue: 1540000 },
    { date: '2024-12-01', rides: 63, revenue: 1750000 }
  ],
  topDrivers: [
    { name: 'James Mukasa', rides: 127, rating: 4.8 },
    { name: 'Peter Ssemakula', rides: 89, rating: 4.6 },
    { name: 'David Kato', rides: 76, rating: 4.7 }
  ]
};