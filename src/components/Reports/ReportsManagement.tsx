import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Clock, CheckCircle, XCircle, Flag, User, Car } from 'lucide-react';
import { mockReports } from '../../data/mockData';
import { Report } from '../../types';

export function ReportsManagement() {
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (reportId: string, newStatus: Report['status']) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      pending: Clock,
      resolved: CheckCircle,
      dismissed: XCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getSeverityBadge = (severity: Report['severity']) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[severity]}`}>
        <span className="capitalize">{severity}</span>
      </span>
    );
  };

  const getTypeBadge = (type: Report['type']) => {
    const styles = {
      user: 'bg-purple-100 text-purple-800 border-purple-200',
      driver: 'bg-green-100 text-green-800 border-green-200'
    };

    const icons = {
      user: User,
      driver: Car
    };

    const Icon = icons[type];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{type}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reports & Flagged Accounts</h3>
          <p className="text-sm text-gray-600">Manage user reports and misconduct cases</p>
        </div>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Pending: <span className="font-semibold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</span></span>
          <span>High Priority: <span className="font-semibold text-red-600">{reports.filter(r => r.severity === 'high').length}</span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by name or reason..."
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
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="user">User Reports</option>
              <option value="driver">Driver Reports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Report Details</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Reported Person</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Severity</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{report.reason}</p>
                      <p className="text-sm text-gray-600">Reporter: {report.reporterName}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{report.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {report.type === 'user' ? (
                        <User className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Car className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium text-gray-900">{report.reportedName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getTypeBadge(report.type)}
                  </td>
                  <td className="py-4 px-6">
                    {getSeverityBadge(report.severity)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(report.id, 'resolved')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleStatusChange(report.id, 'dismissed')}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Flag className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedReport.reason}</h4>
                      <p className="text-sm text-gray-600">Report #{selectedReport.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {getTypeBadge(selectedReport.type)}
                    {getSeverityBadge(selectedReport.severity)}
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                {/* Report Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Reporter Information</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedReport.reporterName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID</label>
                        <p className="text-sm text-gray-600">{selectedReport.reporterId}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Reported {selectedReport.type}</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedReport.reportedName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID</label>
                        <p className="text-sm text-gray-600">{selectedReport.reportedId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Description</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReport.description}</p>
                </div>

                {/* Metadata */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Additional Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date Reported</label>
                      <p className="text-sm text-gray-600">{new Date(selectedReport.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Severity Level</label>
                      <div className="mt-1">{getSeverityBadge(selectedReport.severity)}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedReport.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedReport.id, 'resolved');
                        setSelectedReport(null);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedReport.id, 'dismissed');
                        setSelectedReport(null);
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Dismiss Report
                    </button>
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