import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useClassesStore from '../../store/classesStore'
import axios from '../../config/axios'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  Calendar, 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Printer,
  Edit2,
  Trash2,
  Save,
  XCircle,
  Download,
  Eye,
  Grid,
  List
} from 'lucide-react'
import { toast } from 'react-toastify'
import PrintButton from '../common/PrintButton'

const statusConfig = {
  gaadhay: {
    label: 'Gaadhay',
    color: 'green',
    icon: CheckCircle,
    bgLight: 'bg-green-50',
    textLight: 'text-green-700',
    border: 'border-green-200',
    gradient: 'from-green-400 to-emerald-500'
  },
  dhexda_maraya: {
    label: 'Dhexda maraya',
    color: 'yellow',
    icon: Clock,
    bgLight: 'bg-yellow-50',
    textLight: 'text-yellow-700',
    border: 'border-yellow-200',
    gradient: 'from-yellow-400 to-orange-500'
  },
  aad_uga_fog: {
    label: 'Aad uga fog',
    color: 'red',
    icon: AlertCircle,
    bgLight: 'bg-red-50',
    textLight: 'text-red-700',
    border: 'border-red-200',
    gradient: 'from-red-400 to-rose-500'
  }
}

function QuranSection() {
  const { classes, fetchClasses } = useClassesStore()
  const [selectedClassId, setSelectedClassId] = useState('')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))

  const [dailyLessonHint, setDailyLessonHint] = useState('')
  const [currentSurah, setCurrentSurah] = useState('')
  const [taxdiid, setTaxdiid] = useState('')
  const [studentStatus, setStudentStatus] = useState('dhexda_maraya')
  const [notes, setNotes] = useState('')

  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [saving, setSaving] = useState(false)

  const [students, setStudents] = useState([])
  const [studentRows, setStudentRows] = useState([])

  const [editingRecordId, setEditingRecordId] = useState(null)
  const [editingRows, setEditingRows] = useState([])
  
  // Mobile state management
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [expandedRecords, setExpandedRecords] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('newEntry')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents(selectedClassId)
      loadRecords(selectedClassId, month, year)
    }
  }, [selectedClassId, month, year])

  const loadRecords = async (classId, m, y) => {
    setLoadingRecords(true)
    try {
      const res = await LessonRecordsAPI.getQuranByClassMonth(classId, m, y)
      setRecords(res.data)
    } catch (e) { 
      toast.error('Ku guuldareysatay helista diiwaannada bisha') 
    } finally { 
      setLoadingRecords(false) 
    }
  }

  const loadClassStudents = async (classId) => {
    try {
      const res = await axios.get(`/classes/getStudents/${classId}`)
      const data = res.data
      setStudents(data.students || [])
      setStudentRows((data.students||[]).map(s => ({ 
        student: s._id, 
        dailyLessonHint: '', 
        currentSurah: '', 
        taxdiid: '', 
        studentStatus: 'dhexda_maraya', 
        notes: '' 
      })))
    } catch (e) {
      toast.error('Ku guuldareysatay helista ardayda fasalka')
    }
  }

  const updateRow = (idx, key, value) => {
    setStudentRows(prev => prev.map((r, i) => i===idx ? { ...r, [key]: value } : r))
  }

  const saveRecord = async (e) => {
    e.preventDefault()
    if (!selectedClassId) return toast.error('Dooro Fasalka')
    setSaving(true)
    try {
      const payload = { 
        classId: selectedClassId, 
        dailyLessonHint: '', 
        currentSurah: '', 
        taxdiid: '', 
        studentStatus: 'dhexda_maraya', 
        notes: '', 
        studentPerformances: studentRows 
      }
      const res = await LessonRecordsAPI.createQuran(payload)
      setRecords(prev => [res.data, ...prev])
      setStudentRows(students.map(s => ({ 
        student: s._id, 
        dailyLessonHint: '', 
        currentSurah: '', 
        taxdiid: '', 
        studentStatus: 'dhexda_maraya', 
        notes: '' 
      })))
      toast.success('Diiwaan la kaydiyay')
      if (isMobileView) setActiveTab('records')
    } catch (e) { 
      toast.error('Kaydintu wey fashilantay') 
    } finally { 
      setSaving(false) 
    }
  }

  const startEdit = (record) => {
    setEditingRecordId(record._id)
    setEditingRows((record.studentPerformances||[]).map(sp => ({
      student: sp.student?._id || sp.student,
      dailyLessonHint: sp.dailyLessonHint || '',
      currentSurah: sp.currentSurah || '',
      taxdiid: sp.taxdiid || '',
      studentStatus: sp.studentStatus || 'dhexda_maraya',
      notes: sp.notes || ''
    })))
  }
  
  const cancelEdit = () => { 
    setEditingRecordId(null)
    setEditingRows([]) 
  }
  
  const updateEditingRow = (idx, key, value) => {
    setEditingRows(prev => prev.map((r, i) => i===idx ? { ...r, [key]: value } : r))
  }
  
  const saveEdit = async (id) => {
    try {
      const res = await LessonRecordsAPI.update(id, { studentPerformances: editingRows })
      setRecords(prev => prev.map(r => r._id === id ? res.data : r))
      setEditingRecordId(null)
      setEditingRows([])
      toast.success('Diiwaan waa la cusbooneysiiyay')
    } catch (e) { 
      toast.error('Cusbooneysiintu waa fashilantay') 
    }
  }
  
  const removeRecord = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto diiwaankan?')) return
    
    try {
      await LessonRecordsAPI.remove(id)
      setRecords(prev => prev.filter(r => r._id !== id))
      toast.success('Diiwaan waa la tirtiray')
    } catch (e) { 
      toast.error('Tirtiristu waa fashilantay') 
    }
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.dhexda_maraya
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.bgLight} ${config.textLight} border ${config.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const calculateStats = () => {
    const totalStudents = students.length
    const totalRecords = records.length
    const totalPerformances = records.reduce((sum, r) => sum + (r.studentPerformances?.length || 0), 0)
    
    return { totalStudents, totalRecords, totalPerformances }
  }

  const stats = calculateStats()

  const MobileTabs = () => (
    <div className="md:hidden bg-white rounded-xl shadow-sm p-1 mb-4">
      <div className="flex gap-1">
        <button
          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'newEntry' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('newEntry')}
        >
          <PlusCircle className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs">Diiwaan Cusub</span>
        </button>
        <button
          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'records' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('records')}
        >
          <BookOpen className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs">Diiwaannada</span>
        </button>
      </div>
    </div>
  )

  const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-r ${gradient} rounded-xl p-4 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-90 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
    </motion.div>
  )

  const StudentPerformanceRow = ({ student, idx, row, onChange }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {student.fullname?.charAt(0) || '?'}
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900">{student.fullname}</h4>
            <p className="text-xs text-gray-500">ID: {student.studentId || '-'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Cashar (bog)</label>
              <input 
                value={row?.dailyLessonHint || ''} 
                onChange={e => onChange(idx, 'dailyLessonHint', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Casharka"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600 block mb-1">Suuro</label>
              <input 
                value={row?.currentSurah || ''} 
                onChange={e => onChange(idx, 'currentSurah', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Suuro"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600 block mb-1">Taxdiid</label>
              <input 
                value={row?.taxdiid || ''} 
                onChange={e => onChange(idx, 'taxdiid', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Taxdiid"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600 block mb-1">Xaalad</label>
              <select 
                value={row?.studentStatus || 'dhexda_maraya'} 
                onChange={e => onChange(idx, 'studentStatus', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="gaadhay">✅ Gaadhay</option>
                <option value="dhexda_maraya">🔄 Dhexda maraya</option>
                <option value="aad_uga_fog">⚠️ Aad uga fog</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600 block mb-1">Faallo</label>
            <input 
              value={row?.notes || ''} 
              onChange={e => onChange(idx, 'notes', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Faallo dheeraad ah..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  )

  const RecordCard = ({ record, index }) => {
    const isExpanded = expandedRecords[record._id]
    const isEditing = editingRecordId === record._id
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {new Date(record.date).toLocaleDateString('so-SO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(record.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                <Users className="w-4 h-4 inline mr-1" />
                {record.studentPerformances?.length || 0} Arday
              </span>
              
              <PrintButton 
                title={`Qur'aan - Diiwaan Maalinle (${record.class?.name || ''})`}
                subtitle={`Taariikh: ${new Date(record.date).toLocaleDateString()} | Bil: ${month}/${year}`}
              >
                {`
                  <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
                    <thead>
                      <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">#</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Arday</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Cashar (bog)</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Suuro</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Taxdiid</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Xaalad</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Faallo</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(record.studentPerformances||[]).map((sp, idx) => `
                        <tr>
                          <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.student?.fullname || '-'}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.dailyLessonHint || ''}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.currentSurah || ''}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.taxdiid || ''}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${statusConfig[sp.studentStatus]?.label || sp.studentStatus || ''}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.notes || ''}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `}
              </PrintButton>
              
              {!isEditing && (
                <>
                  <button 
                    onClick={() => startEdit(record)} 
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Tafatir"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeRecord(record._id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Tirtir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {!isMobileView && !isEditing && (
                <button
                  onClick={() => toggleRecordExpansion(record._id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="p-4">
            <div className="space-y-3 max-h-96 overflow-auto">
              {(record.studentPerformances || []).map((sp, idx) => {
                const student = students.find(s => s._id === (sp.student?._id || sp.student))
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium mb-2">{student?.fullname || 'Arday'}</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <input 
                        value={editingRows[idx]?.dailyLessonHint || ''} 
                        onChange={e => updateEditingRow(idx, 'dailyLessonHint', e.target.value)} 
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Cashar"
                      />
                      <input 
                        value={editingRows[idx]?.currentSurah || ''} 
                        onChange={e => updateEditingRow(idx, 'currentSurah', e.target.value)} 
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Suuro"
                      />
                      <input 
                        value={editingRows[idx]?.taxdiid || ''} 
                        onChange={e => updateEditingRow(idx, 'taxdiid', e.target.value)} 
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Taxdiid"
                      />
                      <select 
                        value={editingRows[idx]?.studentStatus || 'dhexda_maraya'} 
                        onChange={e => updateEditingRow(idx, 'studentStatus', e.target.value)} 
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="gaadhay">Gaadhay</option>
                        <option value="dhexda_maraya">Dhexda maraya</option>
                        <option value="aad_uga_fog">Aad uga fog</option>
                      </select>
                      <input 
                        value={editingRows[idx]?.notes || ''} 
                        onChange={e => updateEditingRow(idx, 'notes', e.target.value)} 
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Faallo"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={cancelEdit} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors">
                <XCircle className="w-4 h-4 inline mr-1" />
                Jooji
              </button>
              <button onClick={() => saveEdit(record._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Save className="w-4 h-4 inline mr-1" />
                Kaydi
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {(isExpanded || !isMobileView) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    {(record.studentPerformances || []).map((sp, idx) => {
                      const student = students.find(s => s._id === (sp.student?._id || sp.student))
                      return (
                        <div key={idx} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {student?.fullname?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student?.fullname || 'Arday'}</p>
                                <p className="text-xs text-gray-500">ID: {student?.studentId || '-'}</p>
                              </div>
                            </div>
                            {getStatusBadge(sp.studentStatus)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Cashar</p>
                              <p className="font-medium">{sp.dailyLessonHint || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Suuro</p>
                              <p className="font-medium">{sp.currentSurah || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Taxdiid</p>
                              <p className="font-medium">{sp.taxdiid || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Faallo</p>
                              <p className="font-medium">{sp.notes || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    )
  }

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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Qur'aan - Diiwaanka Maalinlaha
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Maamul oo la soco horumarka ardayda ee casharrada Quraanka
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mobile Tabs */}
          {isMobileView && <MobileTabs />}

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center md:hidden">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filitaanka
              </h3>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showFilters ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            
            <AnimatePresence>
              {(showFilters || !isMobileView) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fasalka</label>
                      <select 
                        value={selectedClassId} 
                        onChange={e => setSelectedClassId(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Dooro Fasalka</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bisha</label>
                      <select 
                        value={month} 
                        onChange={e => setMonth(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {[
                          'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'Maajo', 'Juun',
                          'Luuliyo', 'Agoosto', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar'
                        ].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sanadka</label>
                      <input 
                        type="number" 
                        value={year} 
                        onChange={e => setYear(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button 
                        onClick={() => selectedClassId && loadRecords(selectedClassId, month, year)} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg px-4 py-2 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Hel Taariikhda
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Statistics Cards */}
          {selectedClassId && students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
            >
              <StatCard 
                icon={Users} 
                label="Ardayda Fasalka" 
                value={stats.totalStudents}
                gradient="from-indigo-500 to-purple-500"
              />
              <StatCard 
                icon={Calendar} 
                label="Diiwaannada Bisha" 
                value={stats.totalRecords}
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard 
                icon={TrendingUp} 
                label="Wadarta Ka qaybgalka" 
                value={stats.totalPerformances}
                gradient="from-green-500 to-emerald-500"
              />
            </motion.div>
          )}

          {/* Add New Record Form */}
          <AnimatePresence>
            {(!isMobileView || activeTab === 'newEntry') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Ku dar Diiwaan Maalinle
                  </h3>
                </div>
                
                <div className="p-6">
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {selectedClassId ? "Fasalkaan ma laha ardayda" : "Fasalka dooro si aad ugu darto diiwaan"}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={saveRecord} className="space-y-4">
                      <div className="max-h-96 overflow-auto space-y-3">
                        {students.map((student, idx) => (
                          <StudentPerformanceRow
                            key={student._id}
                            student={student}
                            idx={idx}
                            row={studentRows[idx]}
                            onChange={updateRow}
                          />
                        ))}
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={saving || !selectedClassId} 
                          type="submit" 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                        >
                          {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlusCircle className="w-4 h-4" />
                          )}
                          Kaydi Diiwaanka
                        </motion.button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Records Section */}
          <AnimatePresence>
            {(!isMobileView || activeTab === 'records') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Diiwaannada Bisha
                  </h3>
                  
                  {records.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                      >
                        {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  {loadingRecords ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500">Diiwaanno ayaa soo degaya...</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Lama helin diiwaanno</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {records.map((record, index) => (
                        <RecordCard key={record._id} record={record} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {records.map((record, index) => (
                        <RecordCard key={record._id} record={record} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default QuranSection