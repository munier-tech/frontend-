import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Save, 
  UserPlus, 
  UserMinus, 
  Search, 
  Menu, 
  X, 
  ChevronLeft,
  BookOpen,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Filter,
  RefreshCw,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { HalaqaAPI } from '../../api/halaqa';
import { toast } from 'react-toastify';
import useStudentsStore from '../../store/studentsStore';

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
};

const SubcisManage = () => {
  const { students, fetchStudents, loading: studentsLoading } = useStudentsStore();
  const [halaqas, setHalaqas] = useState([]);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState({ name: '', startingSurah: '', taxdiid: '', description: '' });
  const [selected, setSelected] = useState(null);
  const [editingMeta, setEditingMeta] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list', 'create', 'details'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Changed from isMobileView to isMobile

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadHalaqas();
    fetchStudents();
  }, []);

  const loadHalaqas = async () => {
    try {
      setLoading(true);
      const res = await HalaqaAPI.getAll();
      setHalaqas(res.data);
    } catch (e) {
      toast.error('Ku guuldareysatay inaad soo dejiso Xalqooyinka');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let filteredList = halaqas;
    if (query) {
      filteredList = filteredList.filter(h => 
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        (h.startingSurah && h.startingSurah.toLowerCase().includes(query.toLowerCase()))
      );
    }
    if (filterStatus !== 'all') {
      filteredList = filteredList.filter(h => 
        filterStatus === 'hasStudents' ? (h.students?.length || 0) > 0 : (h.students?.length || 0) === 0
      );
    }
    return filteredList;
  }, [query, halaqas, filterStatus]);

  const createHalaqa = async (e) => {
    e.preventDefault();
    if (!creating.name.trim()) {
      toast.error('Magaca Xalqada geli');
      return;
    }
    
    setSaving(true);
    try {
      const res = await HalaqaAPI.create(creating);
      setHalaqas(prev => [res.data, ...prev]);
      setCreating({ name: '', startingSurah: '', taxdiid: '', description: '' });
      setMobileView('list');
      toast.success('Xalqad la abuuray');
    } catch (e) {
      console.error('Creation failed', e);
      toast.error(e.response?.data?.message || 'Abuuristu wey fashilantay');
    } finally {
      setSaving(false);
    }
  };

  const selectHalaqa = (h) => {
    setSelected(h);
    setEditingMeta({ 
      name: h.name, 
      startingSurah: h.startingSurah || '', 
      taxdiid: h.taxdiid || '', 
      description: h.description || '' 
    });
    setMobileView('details');
  };

  const saveMeta = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updatedHalaqa = { ...selected, ...editingMeta };
      const res = await HalaqaAPI.update(selected._id, updatedHalaqa);
      setHalaqas(prev => prev.map(h => h._id === selected._id ? res.data : h));
      setSelected(res.data);
      toast.success('Xalqad la cusbooneysiiyay');
    } catch (e) {
      console.error('Update failed', e);
      toast.error(e.response?.data?.message || 'Cusbooneysiintu wey fashilantay');
    } finally {
      setSaving(false);
    }
  };

  const deleteHalaqa = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirayso?')) return;
    try {
      await HalaqaAPI.remove(id);
      setHalaqas(prev => prev.filter(h => h._id !== id));
      if (selected?._id === id) {
        setSelected(null);
        setMobileView('list');
      }
      toast.success('Xalqad la tirtiray');
    } catch (e) {
      console.error('Deletion failed', e);
      toast.error(e.response?.data?.message || 'Tirtiristu wey fashilantay');
    }
  };

  const addStudent = async (sid) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await HalaqaAPI.addStudents(selected._id, [sid]);
      setHalaqas(prev => prev.map(h => h._id === selected._id ? res.data : h));
      setSelected(res.data);
      toast.success('Arday la daray');
    } catch (e) {
      console.error('Adding student failed', e);
      toast.error(e.response?.data?.message || 'Ku daristu wey fashilantay');
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (sid) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await HalaqaAPI.removeStudent(selected._id, sid);
      setHalaqas(prev => prev.map(h => h._id === selected._id ? res.data : h));
      setSelected(res.data);
      toast.success('Arday la saaray');
    } catch (e) {
      console.error('Removing student failed', e);
      toast.error(e.response?.data?.message || 'Ka saaristu wey fashilantay');
    } finally {
      setSaving(false);
    }
  };

  const memberIds = new Set((selected?.students || []).map(s => s._id));

  const getStats = () => {
    const totalHalaqas = halaqas.length;
    const totalStudents = halaqas.reduce((sum, h) => sum + (h.students?.length || 0), 0);
    const avgStudentsPerHalaqa = totalHalaqas > 0 ? (totalStudents / totalHalaqas).toFixed(1) : 0;
    return { totalHalaqas, totalStudents, avgStudentsPerHalaqa };
  };

  const stats = getStats();

  const HalaqaCard = ({ halaqa, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => selectHalaqa(halaqa)}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white truncate">{halaqa.name}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); selectHalaqa(halaqa); }}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteHalaqa(halaqa._id); }}
              className="p-1 text-white/80 hover:text-red-200 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{halaqa.students?.length || 0} Arday</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{halaqa.startingSurah || 'Bilow'}</span>
          </div>
        </div>
        
        {halaqa.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {halaqa.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {new Date(halaqa.createdAt).toLocaleDateString('so-SO')}
          </span>
          <span className="text-indigo-600 hover:text-indigo-700 font-medium">
            Faahfaahin <ChevronRight className="w-3 h-3 inline" />
          </span>
        </div>
      </div>
    </motion.div>
  );

  const StudentItem = ({ student, isMember, onAdd, onRemove }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors rounded-lg"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {student.fullname?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
            <div className="text-xs text-gray-500">ID: {student.studentId || '-'}</div>
          </div>
        </div>
      </div>
      <button
        onClick={() => isMember ? onRemove(student._id) : onAdd(student._id)}
        disabled={isMember && saving}
        className={`p-2 rounded-lg transition-all ${
          isMember 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-indigo-600 hover:bg-indigo-50'
        } disabled:opacity-50`}
      >
        {isMember ? <UserMinus size={18} /> : <UserPlus size={18} />}
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Maamulka Xalqooyinka
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Maamul oo la soco xalqooyinka Quraanka
                  </p>
                </div>
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {viewMode === 'grid' ? 'View List' : 'View Grid'}
                </button>
                <button
                  onClick={loadHalaqas}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Wadarta Xalqooyinka</p>
                  <p className="text-2xl font-bold">{stats.totalHalaqas}</p>
                </div>
                <BookOpen className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Wadarta Ardayda</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Celceliska Ardayda</p>
                  <p className="text-2xl font-bold">{stats.avgStudentsPerHalaqa}</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </motion.div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white shadow-md"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold">Xalqooyinka</h2>
            <button
              onClick={() => setMobileView('create')}
              className="p-2 rounded-lg bg-indigo-600 text-white shadow-md"
            >
              <PlusCircle size={20} />
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mb-4 bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => { setMobileView('list'); setIsMobileMenuOpen(false); }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${mobileView === 'list' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                  >
                    📋 Liiska Xalqooyinka
                  </button>
                  <button
                    onClick={() => { setMobileView('create'); setIsMobileMenuOpen(false); }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${mobileView === 'create' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                  >
                    ➕ Abuur Xalqad
                  </button>
                  {selected && (
                    <button
                      onClick={() => { setMobileView('details'); setIsMobileMenuOpen(false); }}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${mobileView === 'details' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                    >
                      ℹ️ Xogta Xalqada
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Create Halaqa Form */}
            <AnimatePresence>
              {(!isMobile || mobileView === 'create') && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${mobileView !== 'create' ? 'hidden md:block' : ''}`}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Abuur Xalqad
                    </h3>
                  </div>
                  
                  <div className="p-5">
                    <form onSubmit={createHalaqa} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Magaca Xalqada *
                        </label>
                        <input
                          value={creating.name}
                          onChange={e => setCreating(v => ({ ...v, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Geli magaca xalqada"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suurada laga bilaabayo
                        </label>
                        <input
                          value={creating.startingSurah}
                          onChange={e => setCreating(v => ({ ...v, startingSurah: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Geli suurada"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Taxdiid
                        </label>
                        <input
                          value={creating.taxdiid}
                          onChange={e => setCreating(v => ({ ...v, taxdiid: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Geli taxdiidka"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sharaxaad
                        </label>
                        <textarea
                          value={creating.description}
                          onChange={e => setCreating(v => ({ ...v, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Geli sharaxaada"
                          rows="3"
                        />
                      </div>
                      
                      <button
                        disabled={saving}
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-all duration-200 shadow-md"
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          'Abuur Xalqad'
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Halaqas List */}
            <AnimatePresence>
              {(!isMobile || mobileView === 'list') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${mobileView !== 'list' ? 'hidden md:block' : 'md:col-span-2'}`}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                    <h3 className="text-white font-semibold text-lg">Dhamaan Xalqooyinka</h3>
                  </div>
                  
                  <div className="p-5">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          placeholder="Raadi Xalqad..."
                          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="all">Dhammaan</option>
                        <option value="hasStudents">Waxay leedahay arday</option>
                        <option value="noStudents">Malaha arday</option>
                      </select>
                    </div>
                    
                    {/* Results */}
                    {loading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">Soo dejineysa...</p>
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {query ? 'Xalqad lama helin' : 'Ma jiro xalqooyin'}
                        </p>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-auto">
                        {filtered.map((halaqa, index) => (
                          <HalaqaCard key={halaqa._id} halaqa={halaqa} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y max-h-[calc(100vh-300px)] overflow-auto">
                        {filtered.map((halaqa, index) => (
                          <motion.div
                            key={halaqa._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              selected?._id === halaqa._id ? 'bg-indigo-50' : ''
                            }`}
                            onClick={() => selectHalaqa(halaqa)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{halaqa.name}</div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {halaqa.students?.length || 0} arday
                                </span>
                                {halaqa.startingSurah && (
                                  <span className="text-xs text-gray-500">
                                    Suuro: {halaqa.startingSurah}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); selectHalaqa(halaqa); }}
                                className="p-2 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteHalaqa(halaqa._id); }}
                                className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Halaqa Details */}
            <AnimatePresence>
              {selected && (!isMobile || mobileView === 'details') && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${mobileView !== 'details' ? 'hidden md:block' : 'md:col-span-2'}`}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-lg">Xogta Xalqada</h3>
                      <button
                        onClick={() => setMobileView('list')}
                        className="md:hidden text-white p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {/* Edit Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Magaca Xalqada
                        </label>
                        <input
                          value={editingMeta?.name || ''}
                          onChange={e => setEditingMeta(v => ({ ...v, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suurada laga bilaabayo
                        </label>
                        <input
                          value={editingMeta?.startingSurah || ''}
                          onChange={e => setEditingMeta(v => ({ ...v, startingSurah: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Suurada laga bilaabayo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Taxdiid
                        </label>
                        <input
                          value={editingMeta?.taxdiid || ''}
                          onChange={e => setEditingMeta(v => ({ ...v, taxdiid: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Taxdiid"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sharaxaad
                        </label>
                        <textarea
                          value={editingMeta?.description || ''}
                          onChange={e => setEditingMeta(v => ({ ...v, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Sharaxaad"
                          rows="3"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mb-6">
                      <button
                        disabled={saving}
                        onClick={saveMeta}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Kaydi
                      </button>
                    </div>
                    
                    {/* Student Management */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Maaree Ardayda Xalqada
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Members Section */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Ardayda Xalqadan ({selected.students?.length || 0})
                          </h4>
                          <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-auto">
                            {selected.students && selected.students.length > 0 ? (
                              selected.students.map(student => (
                                <StudentItem
                                  key={student._id}
                                  student={student}
                                  isMember={true}
                                  onRemove={removeStudent}
                                />
                              ))
                            ) : (
                              <div className="p-6 text-center">
                                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Ardayda Xalqadan majiraan</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* All Students Section */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Dhamaan Ardayda
                          </h4>
                          <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-auto">
                            {studentsLoading ? (
                              <div className="p-6 text-center">
                                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Soo degaya...</p>
                              </div>
                            ) : students.length > 0 ? (
                              students.map(student => (
                                <StudentItem
                                  key={student._id}
                                  student={student}
                                  isMember={memberIds.has(student._id)}
                                  onAdd={addStudent}
                                  onRemove={removeStudent}
                                />
                              ))
                            ) : (
                              <div className="p-6 text-center">
                                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Ardayda majiraan</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SubcisManage;