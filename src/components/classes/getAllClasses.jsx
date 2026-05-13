import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEye, FiEdit2, FiTrash2, FiUsers, FiSearch, 
  FiBook, FiFilter, FiX, FiChevronDown, FiClock
} from 'react-icons/fi';
import useClassesStore from '../../store/classesStore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120
    }
  }
};

const cardHover = {
  y: -4,
  boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)"
};

const GetAllClass = () => {
  const {
    classes,
    loading,
    fetchClasses,
    deleteClass,
    updateClass,
    updating
  } = useClassesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [editFormData, setEditFormData] = useState({
    name: '',
    level: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (classId) => {
    const confirmation = window.confirm('Ma hubtaa inaad tirtirayso fasalkan?');
    if (confirmation) {
      await deleteClass(classId);
    }
  };

  const startEditing = (cls) => {
    setEditingClassId(cls._id);
    setEditFormData({
      name: cls.name,
      level: cls.level
    });
  };

  const cancelEditing = () => {
    setEditingClassId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitEdit = async (classId) => {
    await updateClass(classId, editFormData);
    setEditingClassId(null);
  };

  // Get unique levels for filter
  const levels = ['all', ...new Set(classes.map(cls => cls.level).filter(Boolean))];

  // Filter and sort classes
  const filteredClasses = classes
    .filter(cls => {
      const matchesSearch = cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.level?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || cls.level === selectedLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name);
        case 'students':
          return (b.students?.length || 0) - (a.students?.length || 0);
        case 'level':
          return a.level?.localeCompare(b.level);
        default:
          return 0;
      }
    });

  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Soo celin fasallada...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Fasallada
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Maamul iyo isbeddelka fasallada dugsiga. Ku darsan, wax ka beddel, ama tirtir fasallada.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/addClass"
                className="group flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="mr-3 text-lg group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold text-lg">Fasalka Cusub</span>
              </Link>
            </motion.div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <motion.div 
                className="flex-1 relative"
                whileFocus={{ scale: 1.01 }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="Raadi fasalka... (magaca ama heerka)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-300 font-medium"
              >
                <FiFilter className="mr-2" />
                Filter
                <FiChevronDown className={`ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Level Filter */}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Filter by Heerka
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>
                            {level === 'all' ? 'Dhammaan Heerka' : level}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By */}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Kala Saar
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                      >
                        <option value="name">Magaca</option>
                        <option value="students">Tirada Ardayda</option>
                        <option value="level">Heerka</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Classes Grid */}
        <AnimatePresence mode="wait">
          {filteredClasses.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 lg:py-24"
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiBook className="text-4xl text-blue-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery || selectedLevel !== 'all' ? 'Fasallo lama helin' : 'Ma jiro fasallo'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchQuery || selectedLevel !== 'all' 
                    ? 'Raadintaada wax fasallo ah lama helin. Iska day inaad bedesho filter-ka ama raadinta.'
                    : 'Bilow sameynta fasallada cusub si aad u maamusho ardayda.'}
                </p>
                <Link
                  to="/addClass"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 font-semibold"
                >
                  <FiPlus className="mr-2" />
                  Abuur Fasalka Koowaad
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="classes-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8"
            >
              {filteredClasses.map((cls) => (
                <motion.div
                  key={cls._id}
                  variants={itemVariants}
                  whileHover={cardHover}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col group min-w-[320px]"
                >
                  {/* Class Header */}
                  <div className="p-6 lg:p-8 flex-grow">
                    {editingClassId === cls._id ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Magaca Fasalka</label>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                            placeholder="Geli magaca fasalka"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Heerka</label>
                          <input
                            type="text"
                            name="level"
                            value={editFormData.level}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                            placeholder="Geli heerka"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 break-words">
                              {cls.name}
                            </h3>
                            <p className="text-base text-gray-500 mt-2">Heerka: {cls.level}</p>
                          </div>
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 whitespace-nowrap flex-shrink-0 ml-4"
                          >
                            <FiUsers className="mr-2" />
                            {cls.students?.length || 0} Arday
                          </motion.span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center text-gray-600 text-base">
                            <FiUsers className="mr-4 text-lg" />
                            <span>Tirada ardayda: {cls.students?.length || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-base">
                            <FiClock className="mr-4 text-lg" />
                            <span>La abuuray: {new Date(cls.createdAt).toLocaleDateString('so-SO')}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="bg-gray-50 px-6 lg:px-8 py-6 border-t border-gray-200">
                    {editingClassId === cls._id ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={cancelEditing}
                          className="flex-1 flex items-center justify-center px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-300 text-base"
                        >
                          <FiX className="mr-3" />
                          Jooji
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => submitEdit(cls._id)}
                          disabled={updating}
                          className="flex-1 flex items-center justify-center px-4 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors duration-300 text-base"
                        >
                          {updating ? 'Kaydinta...' : 'Kaydi'}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="grid grid-cols-3 gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={`/classes/${cls._id}`}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-300 h-full"
                          >
                            <FiEye className="text-lg mb-2" />
                            <span className="text-xs font-semibold">Fiiri</span>
                          </Link>
                        </motion.div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEditing(cls)}
                          className="flex flex-col items-center justify-center p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors duration-300 h-full"
                        >
                          <FiEdit2 className="text-lg mb-2" />
                          <span className="text-xs font-semibold">Wax ka beddel</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(cls._id)}
                          className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-colors duration-300 h-full"
                        >
                          <FiTrash2 className="text-lg mb-2" />
                          <span className="text-xs font-semibold">Tirtir</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {filteredClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 text-lg">
              Waxaa la helay <span className="font-semibold text-blue-600">{filteredClasses.length}</span> fasal
              {filteredClasses.length !== 1 ? ' oo' : ''}
              {(searchQuery || selectedLevel !== 'all') && ' ku habboon raadintaada'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GetAllClass;