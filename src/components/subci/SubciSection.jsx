import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HalaqaAPI } from '../../api/halaqa'
import useStudentsStore from '../../store/studentsStore'
import { 
  Search, 
  PlusCircle, 
  Trash2, 
  UserPlus, 
  X, 
  Menu, 
  ChevronLeft, 
  Save, 
  Edit3, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  Download,
  Filter,
  Star,
  Eye
} from 'lucide-react'
import { toast } from 'react-toastify'
import { LessonRecordsAPI } from '../../api/lessonRecords'
import { Link } from 'react-router-dom'
import PrintButton from '../common/PrintButton'

const statusConfig = {
  0: { label: 'Wanaagsan', color: 'green', icon: CheckCircle, bgLight: 'bg-green-50', textLight: 'text-green-700', border: 'border-green-200' },
  1: { label: 'Dhexdhexaad', color: 'yellow', icon: Clock, bgLight: 'bg-yellow-50', textLight: 'text-yellow-700', border: 'border-yellow-200' },
  2: { label: 'Hoose', color: 'orange', icon: AlertCircle, bgLight: 'bg-orange-50', textLight: 'text-orange-700', border: 'border-orange-200' },
  3: { label: 'Aad u hooseeya', color: 'red', icon: AlertCircle, bgLight: 'bg-red-50', textLight: 'text-red-700', border: 'border-red-200' }
}

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

function SubcisSection() {
  const { students, fetchStudents, loading: studentsLoading } = useStudentsStore()
  const [query, setQuery] = useState('')
  const [halaqas, setHalaqas] = useState([])
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newHalaqa, setNewHalaqa] = useState({ name: '', description: '', startingSurah: '', taxdiid: '' })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [subciPerformances, setSubciPerformances] = useState([])
  const [records, setRecords] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingRows, setEditingRows] = useState([])
  const [mobileView, setMobileView] = useState('list')
  const [expandedRecords, setExpandedRecords] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [activeTab, setActiveTab] = useState('details')
  const [showFilters, setShowFilters] = useState(false)
  const [filterScore, setFilterScore] = useState('all')
  const [loading, setLoading] = useState(false) // Added missing loading state

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchStudents()
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const res = await HalaqaAPI.getAll()
      setHalaqas(res.data)
    } catch (e) {
      toast.error('Ku guuldareysatay inaad soo dejiso Xalqooyinka')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newHalaqa.name.trim()) return toast.error('Magaca Xalqada geli')
    setSaving(true)
    try {
      const res = await HalaqaAPI.create(newHalaqa)
      setHalaqas(prev => [res.data, ...prev])
      setNewHalaqa({ name: '', description: '', startingSurah: '', taxdiid: '' })
      setCreating(false)
      setMobileView('list')
      toast.success('Xalqad la abuuray')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Abuuristu wey fashilantay')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    if (!query) return halaqas
    return halaqas.filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, halaqas])

  const openHalaqa = async (name) => {
    try {
      const res = await HalaqaAPI.searchByName(name)
      setSelected(res.data)
      setMobileView('detail')
      setActiveTab('details')
    } catch (e) {
      toast.error('Xalqad lama helin')
    }
  }

  const addStudents = async (ids) => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await HalaqaAPI.addStudents(selected._id, ids)
      setSelected(res.data)
      setHalaqas(prev => prev.map(h => h._id === res.data._id ? res.data : h))
      toast.success('Arday la daray')
    } catch (e) {
      toast.error('Ku daristu wey fashilantay')
    } finally { setSaving(false) }
  }

  const removeStudent = async (studentId) => {
    if (!selected) return
    setRemoving(true)
    try {
      const res = await HalaqaAPI.removeStudent(selected._id, studentId)
      setSelected(res.data)
      setHalaqas(prev => prev.map(h => h._id === res.data._id ? res.data : h))
      toast.success('Arday la saaray')
    } catch (e) {
      toast.error('Ka saaristu wey fashilantay')
    } finally { setRemoving(false) }
  }

  const deleteHalaqa = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirayso?')) return
    try {
      await HalaqaAPI.remove(id)
      setHalaqas(prev => prev.filter(h => h._id !== id))
      if (selected?._id === id) {
        setSelected(null)
        setMobileView('list')
      }
      toast.success('Xalqad la tirtiray')
    } catch (e) { toast.error('Tirtiristu wey fashilantay') }
  }

  useEffect(() => {
    if (selected?.students) {
      setSubciPerformances(selected.students.map(s => ({ student: s._id, versesTaken: 0, statusScore: 0, notes: '' })))
    }
  }, [selected])

  const autoJudge = (verses) => {
    const n = Number(verses) || 0
    if (n <= 3) return 0
    if (n <= 6) return 1
    if (n <= 10) return 2
    return 3
  }

  const updateSubciPerf = (idx, key, value) => {
    setSubciPerformances(prev => prev.map((sp, i) => i === idx ? { 
      ...sp, 
      [key]: value, 
      statusScore: key === 'versesTaken' ? autoJudge(value) : sp.statusScore 
    } : sp))
  }

  const saveSubciRecord = async () => {
    if (!selected?._id) return toast.error('Xulo Xalqad')
    setSaving(true)
    try {
      await LessonRecordsAPI.createSubci({ 
        halaqaId: selected._id, 
        startingSurah: selected.startingSurah || '', 
        taxdiid: selected.taxdiid || '', 
        notes: '', 
        studentPerformances: subciPerformances 
      })
      toast.success('Diiwaan Subci waa la kaydiyay')
      setEditMode(false)
      loadRecords(selected._id)
      setSubciPerformances(selected.students.map(s => ({ student: s._id, versesTaken: 0, statusScore: 0, notes: '' })))
    } catch (e) { 
      toast.error('Kaydinta Subci waa fashilantay') 
    } finally {
      setSaving(false)
    }
  }

  const loadRecords = async (halaqaId) => {
    try {
      const res = await LessonRecordsAPI.getByHalaqa(halaqaId)
      setRecords(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { 
    if (selected?._id) loadRecords(selected._id) 
  }, [selected?._id])

  const startEdit = (r) => {
    setEditingId(r._id)
    setEditingRows((r.studentPerformances || []).map(sp => ({ 
      student: sp.student?._id || sp.student, 
      versesTaken: sp.versesTaken || 0, 
      statusScore: sp.statusScore || 0, 
      notes: sp.notes || '' 
    })))
  }
  
  const cancelEdit = () => { setEditingId(null); setEditingRows([]) }
  
  const updateRow = (idx, key, value) => { 
    setEditingRows(prev => prev.map((x, i) => i === idx ? { 
      ...x, 
      [key]: value,
      statusScore: key === 'versesTaken' && editingId === 'new' ? autoJudge(value) : x.statusScore
    } : x)) 
  }
  
  const saveEdit = async (id) => {
    try {
      const res = await LessonRecordsAPI.update(id, { studentPerformances: editingRows })
      setRecords(prev => prev.map(r => r._id === id ? res.data : r))
      setEditingId(null); 
      setEditingRows([])
      toast.success('Diiwaan Subcis waa la cusbooneysiiyay')
    } catch { toast.error('Cusbooneysiin fashilantay') }
  }
  
  const removeRecord = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto diiwaankan?')) return
    try {
      await LessonRecordsAPI.remove(id)
      setRecords(prev => prev.filter(r => r._id !== id))
      toast.success('Diiwaan waa la tirtiray')
    } catch { toast.error('Tirtiristu fashilantay') }
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  const getStatusBadge = (statusScore) => {
    const config = statusConfig[statusScore] || statusConfig[0]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.bgLight} ${config.textLight} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getStats = () => {
    const totalHalaqas = halaqas.length
    const totalStudents = halaqas.reduce((sum, h) => sum + (h.students?.length || 0), 0)
    const totalRecords_count = records.length
    const avgVerses = records.reduce((sum, r) => {
      const totalVerses = (r.studentPerformances || []).reduce((s, sp) => s + (sp.versesTaken || 0), 0)
      return sum + totalVerses
    }, 0) / (records.length || 1)
    
    return { totalHalaqas, totalStudents, totalRecords: totalRecords_count, avgVerses: avgVerses.toFixed(1) }
  }

  const stats = getStats()

  const HalaqaCard = ({ halaqa, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => openHalaqa(halaqa.name)}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white truncate">{halaqa.name}</h3>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteHalaqa(halaqa._id) }}
            className="p-1 text-white/80 hover:text-red-200 transition-colors"
          >
            <Trash2 size={16} />
          </button>
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
            Faahfaahin →
          </span>
        </div>
      </div>
    </motion.div>
  )

  const StudentPerformanceRow = ({ student, idx, performance, onChange }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {student.fullname?.charAt(0) || '?'}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{student.fullname}</h4>
              <p className="text-xs text-gray-500">ID: {student.studentId || '-'}</p>
            </div>
            {getStatusBadge(performance?.statusScore || 0)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Aayadaha</label>
              <input
                type="number"
                min="0"
                value={performance?.versesTaken || 0}
                onChange={e => onChange(idx, 'versesTaken', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600 block mb-1">Faallo</label>
              <input
                value={performance?.notes || ''}
                onChange={e => onChange(idx, 'notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Faallo dheeraad ah..."
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const RecordCard = ({ record, index }) => {
    const isExpanded = expandedRecords[record._id]
    const isEditing = editingId === record._id
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
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
              <PrintButton 
                title={`Diiwaan Subcis - ${selected?.name || ''}`}
                subtitle={`Taariikh: ${new Date(record.date).toLocaleDateString()}`}
              >
                {`
                  <div class="info-section">
                    <div class="info-label">Xogta Guud ee Xalqada</div>
                    <div class="info-grid">
                      <div class="info-item"><span class="info-key">Xalqada</span><span class="info-value">${selected?.name || '-'}</span></div>
                      <div class="info-item"><span class="info-key">Suurada laga bilaabayo</span><span class="info-value">${selected?.startingSurah || '-'}</span></div>
                      <div class="info-item"><span class="info-key">Taxdiid</span><span class="info-value">${selected?.taxdiid || '-'}</span></div>
                    </div>
                  </div>
                  <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
                    <thead>
                      <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">#</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Arday</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Aayadaha</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Xaalad</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Faallo</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(record.studentPerformances || []).map((sp, idx) => `
                        <tr>
                          <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.student?.fullname || sp.student?.name || '-'}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.versesTaken ?? '-'}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${statusConfig[sp.statusScore]?.label || '-'}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${sp.notes || '-'}</td>
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
                    <Edit3 className="w-4 h-4" />
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
              
              {!isMobile && !isEditing && (
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
                const student = selected?.students?.find(s => s._id === (sp.student?._id || sp.student))
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium mb-2">{student?.fullname || 'Arday'}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Aayadaha</label>
                        <input
                          type="number"
                          value={editingRows[idx]?.versesTaken || 0}
                          onChange={e => updateRow(idx, 'versesTaken', Number(e.target.value))}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Faallo</label>
                        <input
                          value={editingRows[idx]?.notes || ''}
                          onChange={e => updateRow(idx, 'notes', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Faallo"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Xaalad: {statusConfig[editingRows[idx]?.statusScore || 0]?.label}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={cancelEdit} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
                Jooji
              </button>
              <button onClick={() => saveEdit(record._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4 inline mr-1" />
                Kaydi
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {(isExpanded || !isMobile) && (
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
                      const student = selected?.students?.find(s => s._id === (sp.student?._id || sp.student))
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
                            {getStatusBadge(sp.statusScore)}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Aayadaha</p>
                              <p className="font-medium">{sp.versesTaken || 0}</p>
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
                  Maamulka Subcis
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Maamul oo la soco horumarka ardayda ee Subcis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 md:p-4 text-white shadow-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 mb-1 opacity-80" />
                <p className="text-xs opacity-90">Ardayda</p>
                <p className="text-lg md:text-2xl font-bold">{selected.students?.length || 0}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 md:p-4 text-white shadow-lg">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 mb-1 opacity-80" />
                <p className="text-xs opacity-90">Diiwaannada</p>
                <p className="text-lg md:text-2xl font-bold">{stats.totalRecords}</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 md:p-4 text-white shadow-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mb-1 opacity-80" />
                <p className="text-xs opacity-90">Celceliska Aayadaha</p>
                <p className="text-lg md:text-2xl font-bold">{stats.avgVerses}</p>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-3 md:p-4 text-white shadow-lg">
                <Award className="w-5 h-5 md:w-6 md:h-6 mb-1 opacity-80" />
                <p className="text-xs opacity-90">Heerka Guud</p>
                <p className="text-lg md:text-2xl font-bold">
                  {records.length > 0 ? 
                    ((records.reduce((sum, r) => {
                      const avgScore = (r.studentPerformances || []).reduce((s, sp) => s + (sp.statusScore || 0), 0) / (r.studentPerformances?.length || 1)
                      return sum + avgScore
                    }, 0) / records.length) / 3 * 100).toFixed(0) : 0}%
                  </p>
              </div>
            </motion.div>
          )}

          {/* Mobile Tab Navigation for Detail View */}
          {selected && isMobile && (
            <div className="bg-white rounded-xl shadow-sm p-1 mb-4">
              <div className="flex gap-1">
                <button
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${activeTab === 'details' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('details')}
                >
                  <BookOpen className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Xogta</span>
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${activeTab === 'records' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('records')}
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Diiwaannada</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Header for Detail View */}
          {selected && isMobile && (
            <div className="mb-4">
              <button
                onClick={() => { setSelected(null); setMobileView('list') }}
                className="flex items-center gap-2 text-gray-600 mb-3"
              >
                <ChevronLeft size={20} />
                <span>Ku noqo liiska</span>
              </button>
            </div>
          )}

          {/* Halaqa List View */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${(selected && isMobile) ? 'hidden' : ''}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Dhamaan Xalqooyinka</h3>
                <Link
                  to="/subci/manage"
                  className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle size={16} />
                  Abuur Xalqad
                </Link>
              </div>
            </div>
            
            <div className="p-5">
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
                
                <Link
                  to="/subci/manage"
                  className="md:hidden inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  <PlusCircle size={18} />
                  Abuur Xalqad
                </Link>
              </div>
              
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
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-auto">
                  {filtered.map((halaqa, index) => (
                    <HalaqaCard key={halaqa._id} halaqa={halaqa} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Halaqa Detail View */}
          {selected && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${isMobile && activeTab !== 'details' ? 'hidden' : ''}`}
              >
                {/* Detail Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">{selected.name}</h3>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                    >
                      {editMode ? <X size={16} /> : <Edit3 size={16} />}
                      {editMode ? 'Dami Edit' : 'Fur Edit'}
                    </button>
                  </div>
                </div>
                
                <div className="p-5">
                  {/* Halaqa Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Suurada laga bilaabayo</p>
                      <p className="font-medium text-gray-900">{selected.startingSurah || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Taxdiid</p>
                      <p className="font-medium text-gray-900">{selected.taxdiid || '-'}</p>
                    </div>
                    {selected.description && (
                      <div className="md:col-span-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Sharaxaad</p>
                        <p className="font-medium text-gray-900">{selected.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Mode - Student Performance Entry */}
                  {editMode && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                        Diiwaanka Subciska Cusub
                      </h4>
                      
                      <div className="space-y-3 max-h-96 overflow-auto">
                        {(selected.students || []).map((student, idx) => (
                          <StudentPerformanceRow
                            key={student._id}
                            student={student}
                            idx={idx}
                            performance={subciPerformances[idx]}
                            onChange={updateSubciPerf}
                          />
                        ))}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={saveSubciRecord}
                          disabled={saving}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-all shadow-md"
                        >
                          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                          Kaydi Subcis
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Records List */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Diiwaannada Subcis ({records.length})
                    </h4>
                    
                    {records.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Ma jiro diiwaanno subcis</p>
                        {!editMode && (
                          <button
                            onClick={() => setEditMode(true)}
                            className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            Ku dar diiwaan cusub
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {records.map((record, index) => (
                          <RecordCard key={record._id} record={record} index={index} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default SubcisSection