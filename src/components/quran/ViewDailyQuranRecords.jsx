import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiUsers, FiBook, FiEye, FiSearch,
  FiFilter, FiDownload, FiPrinter, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiClock, FiUserCheck,
  FiUserX, FiUserMinus, FiAward, FiStar, FiTrendingUp,
  FiBarChart2, FiGrid, FiList
} from 'react-icons/fi';
import { useDailyQuranStore } from '../../store/dailyQuranStore';
import useClassesStore from '../../store/classesStore';
import { toast } from 'react-hot-toast';

const translations = {
  heading: "Eeg Casharrada Quraanka Maalinle",
  subtitle: "Maamul oo la soco horumarka ardayda ee casharrada Quraanka maalinle",
  selectClass: "Dooro Fasalka",
  selectDate: "Dooro Taariikhda",
  searchRecords: "Raadi diiwaanka...",
  noRecords: "Ma jiro diiwaan la heli karo",
  loading: "Soo dejineyn...",
  refresh: "Cusboonaysii",
  printReport: "Daabac Warbixinta",
  downloadReport: "Soo dejiso Warbixinta",
  totalSessions: "Wadarta Casharrada",
  totalStudents: "Wadarta Ardayda",
  date: "Taariikhda",
  class: "Fasalka",
  student: "Ardayga",
  status: "Heerka",
  notes: "Qoraal",
  createdBy: "Loo abuuray",
  actions: "Tallaabooyin",
  viewDetails: "Eeg Faahfaahin",
  edit: "Wax ka beddel",
  delete: "Tirtir",
  gartay: "Gartay",
  garanWaayay: "Garan Waayay",
  majoogo: "Majoogo",
  filterByStatus: "Shaandhee heerka",
  allStatuses: "Dhammaan heerarka",
  noClassSelected: "Fadlan dooro fasal si aad u aragto diiwaanka",
  noDateSelected: "Fadlan dooro taariikh si aad u aragto diiwaanka",
  attendanceRate: "Heerka Ka qaybgalka",
  comprehensionRate: "Heerka Fahamka",
  quickStats: "Tirakoob Degdeg ah",
  today: "Maanta",
  thisWeek: "Usbuucan",
  thisMonth: "Bishan",
  exportData: "Soo Deji Xogta",
  share: "La wadaag",
};

const statusConfig = {
  gartay: {
    label: "Gartay",
    icon: FiUserCheck,
    color: "green",
    bgLight: "bg-green-50",
    bgDark: "bg-green-600",
    textLight: "text-green-700",
    textDark: "text-white",
    border: "border-green-200",
    gradient: "from-green-400 to-emerald-500"
  },
  garan_waayay: {
    label: "Garan Waayay",
    icon: FiUserX,
    color: "red",
    bgLight: "bg-red-50",
    bgDark: "bg-red-600",
    textLight: "text-red-700",
    textDark: "text-white",
    border: "border-red-200",
    gradient: "from-red-400 to-rose-500"
  },
  majoogo: {
    label: "Majoogo",
    icon: FiUserMinus,
    color: "yellow",
    bgLight: "bg-yellow-50",
    bgDark: "bg-yellow-600",
    textLight: "text-yellow-700",
    textDark: "text-white",
    border: "border-yellow-200",
    gradient: "from-yellow-400 to-orange-500"
  }
};

const ViewDailyQuranRecords = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRecords, setExpandedRecords] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const {
    classSessionsByDate,
    getClassSessionsByDate,
    loading,
    error
  } = useDailyQuranStore();

  const { classes, fetchClasses } = useClassesStore();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      loadRecords();
    }
  }, [selectedClassId, selectedDate]);

  const loadRecords = async () => {
    if (!selectedClassId || !selectedDate) return;

    try {
      await getClassSessionsByDate(selectedClassId, selectedDate);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Khalad ayaa dhacay markii la soo dejinayay diiwaanka');
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.gartay;
  };

  const getStatusColor = (status) => {
    const config = getStatusConfig(status);
    return `${config.bgLight} ${config.textLight} border ${config.border}`;
  };

  const getStatusText = (status) => {
    return statusConfig[status]?.label || status;
  };

  const filteredRecords = classSessionsByDate.filter(record => {
    const matchesSearch = !searchQuery ||
      record.student?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student?.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('so-SO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('so-SO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedClass = classes.find(cls => cls._id === selectedClassId);

  // Calculate statistics
  const calculateStats = () => {
    const total = filteredRecords.length;
    const gartay = filteredRecords.filter(r => r.status === 'gartay').length;
    const garanWaayay = filteredRecords.filter(r => r.status === 'garan_waayay').length;
    const majoogo = filteredRecords.filter(r => r.status === 'majoogo').length;
    
    return {
      total,
      gartay,
      garanWaayay,
      majoogo,
      comprehensionRate: total > 0 ? ((gartay / total) * 100).toFixed(1) : 0,
      attendanceRate: total > 0 ? (((gartay + garanWaayay) / total) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data = filteredRecords.map(record => ({
      'Student Name': record.student?.fullname,
      'Student ID': record.student?.studentId,
      'Status': getStatusText(record.status),
      'Date': formatDate(record.date),
      'Class': record.class?.name,
      'Surah': record.currentSurah,
      'Taxdiid': record.taxdiid,
      'Notes': record.notes,
      'Created By': record.createdBy?.username
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_records_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Xogta si guul leh ayaa loo soo dejiyay');
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    return csvRows.join('\n');
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${config.bgLight} ${config.textLight} border ${config.border}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </motion.span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-90 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
    </motion.div>
  );

  const RecordCard = ({ record, index }) => {
    const config = getStatusConfig(record.status);
    const Icon = config.icon;
    const isExpanded = expandedRecords[record._id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="p-4 cursor-pointer" onClick={() => toggleRecordExpansion(record._id)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${config.bgLight} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.textLight}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{record.student?.fullname || 'Unknown Student'}</h3>
                  <p className="text-xs text-gray-500">ID: {record.student?.studentId || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={record.status} />
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              {formatDate(record.date)}
            </span>
            <span className="flex items-center">
              <FiUsers className="w-3 h-3 mr-1" />
              {record.class?.name}
            </span>
            <span className="flex items-center">
              <FiClock className="w-3 h-3 mr-1" />
              {record.createdBy?.username}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 bg-gray-50"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <FiBook className="w-4 h-4 mr-1 text-green-600" />
                      Faahfaahin Casharka
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-700">{translations.date}:</span> <span className="text-gray-600">{formatDate(record.date)}</span></p>
                      <p><span className="font-medium text-gray-700">{translations.class}:</span> <span className="text-gray-600">{record.class?.name || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-700">Surah:</span> <span className="text-gray-600">{record.currentSurah || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-700">Taxdiid:</span> <span className="text-gray-600">{record.taxdiid || 'N/A'}</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <FiEye className="w-4 h-4 mr-1 text-blue-600" />
                      Qoraal dheeraad ah
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-700">{translations.notes}:</span> <span className="text-gray-600">{record.notes || 'Ma jiro'}</span></p>
                      <p><span className="font-medium text-gray-700">La abuuray:</span> <span className="text-gray-600">{formatDateTime(record.createdAt)}</span></p>
                      <p><span className="font-medium text-gray-700">La cusboonaysiiyay:</span> <span className="text-gray-600">{formatDateTime(record.updatedAt)}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                  <FiBook className="mr-3 text-green-600" />
                  {translations.heading}
                </h1>
                <p className="text-gray-600 mt-2 ml-1">
                  {translations.subtitle}
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filters Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations.selectClass}
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">{translations.selectClass}</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations.selectDate}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations.searchRecords}
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={translations.searchRecords}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations.filterByStatus}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">{translations.allStatuses}</option>
                  <option value="gartay">{translations.gartay}</option>
                  <option value="garan_waayay">{translations.garanWaayay}</option>
                  <option value="majoogo">{translations.majoogo}</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadRecords}
                disabled={loading || !selectedClassId || !selectedDate}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
              >
                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {translations.refresh}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center shadow-md"
              >
                <FiPrinter className="mr-2" />
                {translations.printReport}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center shadow-md"
              >
                <FiDownload className="mr-2" />
                {translations.exportData}
              </motion.button>
            </div>
          </motion.div>

          {/* Class Info and Statistics */}
          {selectedClass && filteredRecords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {selectedClass.name} - {selectedClass.subject}
                    </h3>
                    <p className="text-blue-100 flex items-center">
                      <FiCalendar className="mr-2" />
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-blue-100">{translations.totalSessions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{new Set(filteredRecords.map(r => r.student?._id)).size}</p>
                      <p className="text-xs text-blue-100">{translations.totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <StatCard
                  icon={FiUserCheck}
                  label="Wadarta Ardayda"
                  value={stats.total}
                  gradient="from-green-400 to-emerald-500"
                />
                <StatCard
                  icon={FiAward}
                  label="Gartay"
                  value={stats.gartay}
                  gradient="from-blue-400 to-indigo-500"
                />
                <StatCard
                  icon={FiTrendingUp}
                  label="Fahamka"
                  value={`${stats.comprehensionRate}%`}
                  gradient="from-purple-400 to-pink-500"
                />
                <StatCard
                  icon={FiBarChart2}
                  label="Ka qaybgalka"
                  value={`${stats.attendanceRate}%`}
                  gradient="from-orange-400 to-red-500"
                />
              </div>
            </motion.div>
          )}

          {/* Records Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <FiRefreshCw className="w-8 h-8 text-blue-600" />
                </motion.div>
                <p className="mt-4 text-gray-600">{translations.loading}</p>
              </div>
            ) : !selectedClassId ? (
              <div className="p-12 text-center">
                <FiUsers className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-gray-500 text-lg">{translations.noClassSelected}</p>
              </div>
            ) : !selectedDate ? (
              <div className="p-12 text-center">
                <FiCalendar className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-gray-500 text-lg">{translations.noDateSelected}</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <FiBook className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-gray-500 text-lg">{translations.noRecords}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredRecords.map((record, index) => (
                  <RecordCard key={record._id} record={record} index={index} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {translations.student}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {translations.status}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {translations.createdBy}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {translations.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredRecords.map((record, index) => {
                        const config = getStatusConfig(record.status);
                        const Icon = config.icon;
                        const isExpanded = expandedRecords[record._id];
                        
                        return (
                          <React.Fragment key={record._id}>
                            <motion.tr
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => toggleRecordExpansion(record._id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full ${config.bgLight} flex items-center justify-center mr-3`}>
                                    <Icon className={`w-5 h-5 ${config.textLight}`} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.student?.fullname || 'Unknown Student'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ID: {record.student?.studentId || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={record.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                                  {record.createdBy?.username || 'System'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <motion.button
                                  whileHover={{ x: 3 }}
                                  className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
                                >
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FiChevronDown className="mr-1" />
                                  </motion.div>
                                  {translations.viewDetails}
                                </motion.button>
                              </td>
                            </motion.tr>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <td colSpan="4" className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                          <FiBook className="w-4 h-4 mr-2 text-green-600" />
                                          Faahfaahin Casharka
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">{translations.date}:</span>
                                            <span className="text-gray-600">{formatDate(record.date)}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">{translations.class}:</span>
                                            <span className="text-gray-600">{record.class?.name || 'N/A'}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">Surah:</span>
                                            <span className="text-gray-600">{record.currentSurah || 'N/A'}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">Taxdiid:</span>
                                            <span className="text-gray-600">{record.taxdiid || 'N/A'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                          <FiEye className="w-4 h-4 mr-2 text-blue-600" />
                                          Qoraal dheeraad ah
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-start">
                                            <span className="font-medium text-gray-700 w-24">{translations.notes}:</span>
                                            <span className="text-gray-600 flex-1">{record.notes || 'Ma jiro'}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">La abuuray:</span>
                                            <span className="text-gray-600">{formatDateTime(record.createdAt)}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-24">La cusboonaysiiyay:</span>
                                            <span className="text-gray-600">{formatDateTime(record.updatedAt)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .container {
            margin: 0;
            padding: 0;
          }
          button, .shadow-xl, .shadow-md {
            box-shadow: none !important;
          }
          .bg-gradient-to-r, .bg-gradient-to-br {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewDailyQuranRecords;