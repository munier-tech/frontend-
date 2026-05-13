import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiCheck, FiX, FiClock, 
  FiUsers, FiBook, FiEye, FiPrinter, FiSave,
  FiChevronDown, FiCheckCircle, FiRotateCw,
  FiDownload, FiLoader, FiSearch, FiInfo, FiAlertCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';
import { useDailyQuranStore } from '../../store/dailyQuranStore';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const translations = {
  heading: "Abuur Cashar Quraan Maalinle",
  selectClass: "Dooro Fasalka",
  searchClass: "Raadi fasalka...",
  selectDate: "Dooro Taariikhda",
  studentName: "Magaca Ardayga",
  studentId: "Lambarka Ardayga",
  phone: "Taleefoonka",
  status: "Heerka Casharka",
  gartay: "Gartay",
  garanWaayay: "Garan Waayay",
  majoogo: "Majoogo",
  submitAll: "Diiwaan Geli Dhammaan",
  submitSingle: "Diiwaan Geli",
  loading: "Soo dejineyn...",
  saving: "Keydinaya...",
  noClasses: "Ma jiro fasallo la heli karo",
  noStudents: "Fasalkan ma laha arday",
  success: "Casharka maalinle si guul leh ayaa loo diiwaangeliyay",
  error: "Qalad ayaa dhacay",
  creating: "Diiwaangelinta...",
  statistics: "Tirakoobka",
  totalStudents: "Wadarta Ardayda",
  passed: "Gartay",
  failed: "Garan Waayay",
  absent: "Majoogo",
  refresh: "Cusboonaysii",
  selectAll: "Dooro Dhammaan",
  updateStatus: "Cusboonaysii Heerka",
  viewSessions: "Eeg Casharrada",
  printReport: "Daabac Warbixinta",
  reportTitle: "Warbixinta Casharrada Quraanka Maalinle",
  class: "Fasalka",
  date: "Taariikhda",
  summary: "Wadarta",
  generatedOn: "Lagu sameeyay",
  downloadPDF: "Soo dejiso PDF",
  print: "Daabac",
  loadDateSessions: "Soo deji casharrada taariikhdan",
  dateInfo: "Waxaad diiwaan gelin kartaa casharro taariikho kala duwan",
  noSessionsForDate: "Ma jiro casharro diiwaan gashan taariikhdan",
  selectNewDate: "Dooro taariikh kale si aad u diiwaan geliso cashar cusub",
  loadingDateData: "Soo dejineyn xogta taariikhdan..."
};

const CreateDailyQuranSession = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [quranRecords, setQuranRecords] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDateSessions, setIsLoadingDateSessions] = useState(false);
  const [dateInfo, setDateInfo] = useState('');
  const [hasExistingSessions, setHasExistingSessions] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentSurah, setCurrentSurah] = useState('');
  const [taxdiid, setTaxdiid] = useState('');
  const [notes, setNotes] = useState('');
  const classDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const printRef = useRef();

  // Using stores
  const { classes, fetchClasses } = useClassesStore();
  const { students, fetchStudentsByClass } = useStudentsStore();
  const { 
    createDailyQuran,
    createBulkDailyQuran,
    updateDailyQuran,
    getClassSessionsByDate,
    todaySessions,
    classSessionsByDate,
    loading,
    error,
    clearError,
    resetForNewDate
  } = useDailyQuranStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target)) {
        setIsClassDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isClassDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isClassDropdownOpen]);

  // Fetch classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        await fetchClasses();
      } catch (error) {
        console.error('Error loading classes:', error);
        toast.error('Khalad ayaa dhacay markii la soo dejini fasallada');
      } finally {
        setLoadingClasses(false);
      }
    };
    
    loadClasses();
  }, [fetchClasses]);

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.level && cls.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('so-SO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Normalize date for comparison
  const normalizeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // Load students for selected class
  const loadClassStudents = useCallback(async (classId) => {
    if (!classId) {
      setQuranRecords([]);
      return;
    }

    setLoadingStudents(true);
    try {
      await fetchStudentsByClass(classId);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Khalad ayaa dhacay markii laga soo saaray ardayda');
    } finally {
      setLoadingStudents(false);
    }
  }, [fetchStudentsByClass]);

  // Load sessions for specific date - FIXED VERSION
  const loadDateSessions = useCallback(async (classId, date) => {
    if (!classId || !date) {
      console.log('Missing classId or date:', { classId, date });
      return;
    }
    
    console.log('Loading sessions for:', { classId, date });
    setIsLoadingDateSessions(true);
    setDateInfo(translations.loadingDateData);
    
    try {
      // Clear previous sessions first
      resetForNewDate();
      
      const result = await getClassSessionsByDate(classId, date);
      
      if (result.success) {
        const sessions = result.data || [];
        const sessionCount = sessions.length;
        setHasExistingSessions(sessionCount > 0);
        
        console.log('Sessions loaded:', {
          count: sessionCount,
          sessions: sessions.map(s => ({
            id: s._id,
            student: s.student?._id || s.student,
            date: s.date,
            status: s.status
          }))
        });
        
        if (sessionCount > 0) {
          setDateInfo(`${sessionCount} arday ayaa hore u cashar helay taariikhdan`);
          toast.success(`Lagu helay ${sessionCount} cashar taariikhda ${formatDateForDisplay(date)}`);
        } else {
          setDateInfo(translations.noSessionsForDate);
          // FIXED: Use toast with custom styling instead of toast.info()
          toast(translations.selectNewDate, {
            icon: 'ℹ️',
            style: {
              background: '#3b82f6',
              color: 'white',
            },
          });
        }
      } else {
        setDateInfo('Khalad ayaa dhacay');
        toast.error(result.error || translations.error);
      }
    } catch (error) {
      console.error('Error loading date sessions:', error);
      setDateInfo('Khalad ayaa dhacay');
      toast.error('Khalad ayaa dhacay markii laga soo dejinin casharrada');
    } finally {
      setIsLoadingDateSessions(false);
    }
  }, [getClassSessionsByDate, resetForNewDate]);

  // Handle class selection
  const handleClassSelect = async (classId) => {
    console.log('Class selected:', classId);
    setSelectedClassId(classId);
    setIsClassDropdownOpen(false);
    setSearchQuery('');
    
    // Clear previous data
    setQuranRecords([]);
    setHasExistingSessions(false);
    setDateInfo('');
    resetForNewDate();
    
    if (classId) {
      setIsInitialLoad(true);
      try {
        await Promise.all([
          loadClassStudents(classId),
          loadDateSessions(classId, selectedDate)
        ]);
      } catch (error) {
        console.error('Error loading class data:', error);
      } finally {
        setIsInitialLoad(false);
      }
    }
  };

  // Handle date change - FIXED VERSION
  const handleDateChange = async (newDate) => {
    console.log('Date changed from', selectedDate, 'to', newDate);
    
    if (newDate === selectedDate) return;
    
    setSelectedDate(newDate);
    
    // Clear ALL previous data immediately
    setQuranRecords([]);
    setHasExistingSessions(false);
    setDateInfo('');
    resetForNewDate();
    
    if (selectedClassId) {
      setIsLoadingDateSessions(true);
      try {
        // Load sessions for the new date
        await loadDateSessions(selectedClassId, newDate);
      } catch (error) {
        console.error('Error changing date:', error);
      } finally {
        setIsLoadingDateSessions(false);
      }
    }
  };

  // Quick date buttons
  const handleQuickDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const dateString = date.toISOString().split('T')[0];
    handleDateChange(dateString);
  };

  // Update records when students or sessions change - FIXED VERSION
  useEffect(() => {
    console.log('Building records:', {
      selectedClassId,
      studentsCount: students?.length,
      classSessionsCount: classSessionsByDate?.length,
      todaySessionsCount: todaySessions?.length,
      selectedDate,
      hasExistingSessions
    });

    if (selectedClassId && students && students.length > 0) {
      // Always use classSessionsByDate for date-specific sessions
      const sessionsToUse = classSessionsByDate || [];
      const normalizedSelectedDate = normalizeDate(selectedDate);
      
      console.log('Using sessions:', sessionsToUse.map(s => ({
        id: s._id,
        studentId: s.student?._id || s.student,
        date: s.date,
        normalizedDate: normalizeDate(s.date),
        status: s.status
      })));

      const initialRecords = students.map(student => {
        // Find session for this student that matches the selected date
        let existingSession = null;
        let isSessionForThisDate = false;
        
        for (const session of sessionsToUse) {
          const sessionStudentId = session.student?._id || session.student;
          const sessionDate = session.date ? normalizeDate(session.date) : null;
          
          if (sessionStudentId === student._id) {
            existingSession = session;
            isSessionForThisDate = sessionDate === normalizedSelectedDate;
            if (isSessionForThisDate) break;
          }
        }
        
        return {
          student: student._id,
          status: (isSessionForThisDate && existingSession?.status) || 'majoogo',
          name: student.fullname,
          studentId: student.studentId,
          phone: student.motherNumber || student.fatherNumber || '-',
          hasExistingSession: isSessionForThisDate,
          sessionId: isSessionForThisDate ? existingSession?._id : null,
          sessionDate: existingSession?.date,
          updatedAt: existingSession?.updatedAt,
          isForSelectedDate: isSessionForThisDate
        };
      });

      console.log('Built records:', initialRecords.map(r => ({
        student: r.student,
        name: r.name,
        status: r.status,
        hasExistingSession: r.hasExistingSession,
        isForSelectedDate: r.isForSelectedDate
      })));

      setQuranRecords(initialRecords);
      
      // Update existing sessions count
      const existingCount = initialRecords.filter(r => r.hasExistingSession).length;
      setHasExistingSessions(existingCount > 0);
      
      if (existingCount > 0 && !dateInfo) {
        setDateInfo(`${existingCount} arday ayaa hore u cashar helay taariikhdan`);
      } else if (existingCount === 0 && !dateInfo && !isLoadingDateSessions) {
        setDateInfo(translations.noSessionsForDate);
      }
    }
  }, [students, classSessionsByDate, todaySessions, selectedClassId, selectedDate, dateInfo, isLoadingDateSessions]);

  // Handle individual status change
  const handleStatusChange = (studentId, status) => {
    setQuranRecords(prev =>
      prev.map(record =>
        record.student === studentId ? { 
          ...record, 
          status,
          updatedAt: new Date().toISOString(),
          hasExistingSession: record.hasExistingSession && record.status === status
        } : record
      )
    );
  };

  // Handle select all with a specific status
  const handleSelectAll = (status) => {
    const updatedRecords = quranRecords.map(record => ({
      ...record,
      status,
      updatedAt: new Date().toISOString(),
      hasExistingSession: record.hasExistingSession && record.status === status
    }));
    setQuranRecords(updatedRecords);
    toast.success(`Dhammaan ardayda waa la dooray ${status === 'gartay' ? 'gartay' : status === 'garan waayay' ? 'garan waayay' : 'majoogo'}`);
  };

  // Save single session with specific date
  const handleSaveSingleSession = async (studentId, status) => {
    if (!selectedClassId || !studentId) {
      toast.error('Fadlan dooro fasalka iyo arday');
      return;
    }
    
    try {
      const record = quranRecords.find(r => r.student === studentId);
      
      if (record?.hasExistingSession && record?.sessionId) {
        // Update existing session
        const result = await updateDailyQuran(record.sessionId, { 
          status,
          date: selectedDate
        });
        
        if (result.success) {
          toast.success('Casharka maalinle waa la cusboonaysiiyay');
          await loadDateSessions(selectedClassId, selectedDate);
        } else {
          toast.error(result.error || translations.error);
        }
      } else {
        // Create new session
        const result = await createDailyQuran({
          student: studentId,
          status,
          class: selectedClassId,
          date: selectedDate,
          currentSurah,
          taxdiid,
          notes
        });
        
        if (result.success) {
          toast.success('Casharka maalinle waa lagu daray');
          await loadDateSessions(selectedClassId, selectedDate);
        } else {
          toast.error(result.error || translations.error);
        }
      }
    } catch (error) {
      toast.error(error.message || translations.error);
    }
  };

  // Save all sessions with specific date
  const handleSaveAllSessions = async () => {
    if (!selectedClassId || quranRecords.length === 0) {
      toast.error('Fadlan buuxi dhammaan goobaha loo baahan yahay');
      return;
    }

    try {
      const studentsToSave = quranRecords.map(record => ({
        studentId: record.student,
        status: record.status,
        currentSurah,
        taxdiid,
        notes
      }));

      const result = await createBulkDailyQuran({
        classId: selectedClassId,
        date: selectedDate,
        students: studentsToSave
      });
      
      if (result.success) {
        const message = result.message || `${studentsToSave.length} arday ayaa loo diiwaangeliyay`;
        toast.success(message);
        await loadDateSessions(selectedClassId, selectedDate);
      } else {
        toast.error(result.error || translations.error);
      }
    } catch (error) {
      console.error('Bulk save error:', error);
      toast.error(error.message || translations.error);
    }
  };

  // Refresh data for current date
  const handleRefresh = async () => {
    if (selectedClassId) {
      try {
        setLoadingStudents(true);
        await Promise.all([
          loadClassStudents(selectedClassId),
          loadDateSessions(selectedClassId, selectedDate)
        ]);
        toast.success('Xogta waa la cusboonaysiiyay');
      } catch (error) {
        toast.error('Khalad ayaa dhacay markii laga cusboonaysiinayay xogta');
      } finally {
        setLoadingStudents(false);
      }
    }
  };

  // Load sessions for specific date
  const handleLoadDateSessions = async () => {
    if (!selectedClassId) {
      toast.error('Fadlan dooro fasalka marka hore');
      return;
    }
    
    await loadDateSessions(selectedClassId, selectedDate);
  };

  // Get statistics
  const statistics = {
    total: quranRecords.length,
    gartay: quranRecords.filter(r => r.status === 'gartay').length,
    garanWaayay: quranRecords.filter(r => r.status === 'garan waayay').length,
    majoogo: quranRecords.filter(r => r.status === 'majoogo').length,
    existing: quranRecords.filter(r => r.hasExistingSession).length,
    new: quranRecords.filter(r => !r.hasExistingSession).length
  };

  // Get status button style
  const getStatusStyle = (status, currentStatus) => {
    const isActive = status === currentStatus;
    const baseClasses = "px-3 py-2 rounded-md text-sm flex items-center justify-center min-h-[36px] min-w-[80px] transition-all duration-200";
    
    switch(status) {
      case 'gartay':
        return `${baseClasses} ${
          isActive 
            ? 'bg-green-100 text-green-800 border-2 border-green-500' 
            : 'bg-gray-100 text-gray-800 hover:bg-green-50 active:bg-green-200'
        }`;
      case 'garan waayay':
        return `${baseClasses} ${
          isActive 
            ? 'bg-red-100 text-red-800 border-2 border-red-500' 
            : 'bg-gray-100 text-gray-800 hover:bg-red-50 active:bg-red-200'
        }`;
      case 'majoogo':
        return `${baseClasses} ${
          isActive 
            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500' 
            : 'bg-gray-100 text-gray-800 hover:bg-yellow-50 active:bg-yellow-200'
        }`;
      default:
        return baseClasses;
    }
  };

  // Generate PDF Report
  const generatePDF = async () => {
    if (!selectedClassId || quranRecords.length === 0) {
      toast.error('Ma jiro xog la daabici karo');
      return;
    }

    try {
      const printContent = document.createElement('div');
      printContent.style.position = 'absolute';
      printContent.style.left = '-9999px';
      printContent.style.top = '0';
      printContent.style.width = '794px';
      printContent.style.padding = '20px';
      printContent.style.backgroundColor = 'white';
      printContent.style.fontFamily = 'Arial, sans-serif';
      
      const cls = classes.find(c => c._id === selectedClassId);
      const successRate = statistics.total > 0 ? ((statistics.gartay / statistics.total) * 100).toFixed(1) : 0;
      
      printContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #1a56db; margin-bottom: 5px;">
            ${translations.reportTitle}
          </h1>
          <p style="font-size: 16px; color: #4b5563;">
            ${cls?.name || 'Fasalka'} | ${formatDateForDisplay(selectedDate)}
          </p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; margin-right: 10px; color: #374151;">${translations.class}:</span>
              <span style="color: #6b7280;">${cls?.name || '-'}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; margin-right: 10px; color: #374151;">${translations.date}:</span>
              <span style="color: #6b7280;">${formatDateForDisplay(selectedDate)}</span>
            </div>
          </div>
          <div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; margin-right: 10px; color: #374151;">${translations.generatedOn}:</span>
              <span style="color: #6b7280;">${new Date().toLocaleDateString('so-SO')}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; margin-right: 10px; color: #374151;">${translations.totalStudents}:</span>
              <span style="color: #6b7280;">${statistics.total}</span>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div style="padding: 15px; border-radius: 8px; text-align: center; background: #d1fae5; border: 1px solid #10b981;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${statistics.gartay}</div>
            <div style="font-size: 14px; color: #6b7280;">${translations.passed}</div>
          </div>
          <div style="padding: 15px; border-radius: 8px; text-align: center; background: #fee2e2; border: 1px solid #ef4444;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${statistics.garanWaayay}</div>
            <div style="font-size: 14px; color: #6b7280;">${translations.failed}</div>
          </div>
          <div style="padding: 15px; border-radius: 8px; text-align: center; background: #fef3c7; border: 1px solid #f59e0b;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${statistics.majoogo}</div>
            <div style="font-size: 14px; color: #6b7280;">${translations.absent}</div>
          </div>
          <div style="padding: 15px; border-radius: 8px; text-align: center; background: #dbeafe; border: 1px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${successRate}%</div>
            <div style="font-size: 14px; color: #6b7280;">Guul</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
          <thead>
            <tr>
              <th style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">#</th>
              <th style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">${translations.studentName}</th>
              <th style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">${translations.studentId}</th>
              <th style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">${translations.phone}</th>
              <th style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">${translations.status}</th>
            </tr>
          </thead>
          <tbody>
            ${quranRecords.map((record, index) => `
              <tr style="${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="border: 1px solid #d1d5db; padding: 10px;">${index + 1}</td>
                <td style="border: 1px solid #d1d5db; padding: 10px;">${record.name}</td>
                <td style="border: 1px solid #d1d5db; padding: 10px;">${record.studentId}</td>
                <td style="border: 1px solid #d1d5db; padding: 10px;">${record.phone}</td>
                <td style="border: 1px solid #d1d5db; padding: 10px;">
                  <span style="color: ${record.status === 'gartay' ? '#065f46' : record.status === 'garan waayay' ? '#991b1b' : '#92400e'}; 
                        background: ${record.status === 'gartay' ? '#d1fae5' : record.status === 'garan waayay' ? '#fee2e2' : '#fef3c7'}; 
                        padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    ${record.status === 'gartay' ? translations.gartay : 
                     record.status === 'garan waayay' ? translations.garanWaayay : 
                     translations.majoogo}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #d1d5db; padding-top: 20px;">
          <p>Warbixinta ayaa lagu sameeyay ${new Date().toLocaleString('so-SO')}</p>
        </div>
      `;
      
      document.body.appendChild(printContent);
      
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: printContent.offsetWidth,
        height: printContent.scrollHeight
      });

      document.body.removeChild(printContent);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Cashar_Maalinle_${cls?.name || 'Fasalka'}_${selectedDate}.pdf`;
      
      pdf.save(fileName);
      setShowPrintModal(false);
      toast.success('Warbixinta PDF ayaa la soo dejiyay');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Khalad ayaa dhacay markii la sameeyay PDF');
    }
  };

  // Direct print
  const handlePrint = () => {
    const cls = classes.find(c => c._id === selectedClassId);
    const successRate = statistics.total > 0 ? ((statistics.gartay / statistics.total) * 100).toFixed(1) : 0;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${translations.reportTitle}</title>
        <style>
          @media print {
            @page {
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #1a56db;
              margin-bottom: 5px;
            }
            .print-subtitle {
              font-size: 16px;
              color: #4b5563;
            }
            .print-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-key {
              font-weight: bold;
              margin-right: 10px;
              color: #374151;
            }
            .info-value {
              color: #6b7280;
            }
            .stats-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-card.green {
              background: #d1fae5;
              border: 1px solid #10b981;
            }
            .stat-card.red {
              background: #fee2e2;
              border: 1px solid #ef4444;
            }
            .stat-card.yellow {
              background: #fef3c7;
              border: 1px solid #f59e0b;
            }
            .stat-card.blue {
              background: #dbeafe;
              border: 1px solid #3b82f6;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .print-table th {
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              color: #374151;
            }
            .print-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
            }
            .print-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .status-gartay {
              color: #065f46;
              background: #d1fae5;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .status-garanwaayay {
              color: #991b1b;
              background: #fee2e2;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .status-majoogo {
              color: #92400e;
              background: #fef3c7;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #d1d5db;
              padding-top: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">${translations.reportTitle}</h1>
          <p class="print-subtitle">
            ${cls?.name || 'Fasalka'} | ${formatDateForDisplay(selectedDate)}
          </p>
        </div>
        
        <div class="print-info">
          <div>
            <div class="info-item">
              <span class="info-key">${translations.class}:</span>
              <span class="info-value">${cls?.name || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-key">${translations.date}:</span>
              <span class="info-value">${formatDateForDisplay(selectedDate)}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-key">${translations.generatedOn}:</span>
              <span class="info-value">${new Date().toLocaleDateString('so-SO')}</span>
            </div>
            <div class="info-item">
              <span class="info-key">${translations.totalStudents}:</span>
              <span class="info-value">${statistics.total}</span>
            </div>
          </div>
        </div>
        
        <div class="stats-container">
          <div class="stat-card green">
            <div class="stat-number">${statistics.gartay}</div>
            <div class="stat-label">${translations.passed}</div>
          </div>
          <div class="stat-card red">
            <div class="stat-number">${statistics.garanWaayay}</div>
            <div class="stat-label">${translations.failed}</div>
          </div>
          <div class="stat-card yellow">
            <div class="stat-number">${statistics.majoogo}</div>
            <div class="stat-label">${translations.absent}</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-number">${successRate}%</div>
            <div class="stat-label">Guul</div>
          </div>
        </div>
        
        <table class="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${translations.studentName}</th>
              <th>${translations.studentId}</th>
              <th>${translations.phone}</th>
              <th>${translations.status}</th>
            </tr>
          </thead>
          <tbody>
            ${quranRecords.map((record, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${record.name}</td>
                <td>${record.studentId}</td>
                <td>${record.phone}</td>
                <td>
                  <span class="status-${record.status.replace(/\s+/g, '')}">
                    ${record.status === 'gartay' ? translations.gartay : 
                     record.status === 'garan waayay' ? translations.garanWaayay : 
                     translations.majoogo}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Warbixinta ayaa lagu sameeyay ${new Date().toLocaleString('so-SO')}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const selectedClass = classes.find(c => c._id === selectedClassId);
  const successRate = statistics.total > 0 ? ((statistics.gartay / statistics.total) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <FiBook className="mr-2" />
                {translations.heading}
              </h1>
              <p className="mt-1 text-blue-100">
                Deji casharrada quraanka maalinle ee ardayda fasalka
              </p>
            </div>
            
            <Link
              to="/daily-quran/view"
              className="px-4 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-lg flex items-center justify-center transition-colors w-full md:w-auto min-h-[44px]"
            >
              <FiEye className="mr-2" />
              {translations.viewSessions}
            </Link>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FiUsers className="mr-2" /> {translations.selectClass} <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative" ref={classDropdownRef}>
                <button
                  type="button"
                  onClick={() => !loadingClasses && setIsClassDropdownOpen(!isClassDropdownOpen)}
                  disabled={loadingClasses}
                  className={`w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${
                    loadingClasses 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center truncate">
                    {loadingClasses ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        <span className="truncate">{translations.loading}</span>
                      </>
                    ) : selectedClass ? (
                      <>
                        <FiUsers className="mr-2 flex-shrink-0" />
                        <span className="truncate">{selectedClass.name}</span>
                        {selectedClass.level && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">
                            {selectedClass.level}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="truncate">{translations.selectClass}</span>
                    )}
                  </div>
                  <FiChevronDown className={`ml-2 transition-transform flex-shrink-0 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isClassDropdownOpen && !loadingClasses && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-lg py-2 ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={translations.searchClass}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto touch-pan-y">
                      {filteredClasses.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          {searchQuery ? 'Lama helin fasalo' : translations.noClasses}
                        </div>
                      ) : (
                        filteredClasses.map((cls) => (
                          <button
                            key={cls._id}
                            onClick={() => handleClassSelect(cls._id)}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:bg-blue-50 transition-colors min-h-[44px] ${
                              selectedClassId === cls._id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium truncate">{cls.name}</div>
                            {cls.level && (
                              <div className="text-xs text-gray-500 mt-1">Darajo: {cls.level}</div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    
                    {searchQuery && (
                      <div className="border-t border-gray-200 px-3 py-2">
                        <button
                          onClick={() => setSearchQuery('')}
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2 min-h-[44px]"
                        >
                          Nadiifinta raadinta
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {loadingClasses && (
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <FiLoader className="animate-spin mr-1" />
                  Soo dejineyn fasallada...
                </p>
              )}
            </div>

            {/* Date Selection with Load Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiCalendar className="mr-2" /> {translations.selectDate} <span className="text-red-500 ml-1">*</span>
                </label>
                {selectedClassId && (
                  <button
                    onClick={handleLoadDateSessions}
                    disabled={isLoadingDateSessions || !selectedClassId}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
                  >
                    {isLoadingDateSessions ? (
                      <FiLoader className="animate-spin mr-1" />
                    ) : (
                      <FiRotateCw className="mr-1" />
                    )}
                    {translations.loadDateSessions}
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-sm"
                    disabled={loading || loadingClasses}
                  />
                  <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Quick date buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleQuickDate(0)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 min-h-[44px]"
                    title="Maanta"
                  >
                    Maanta
                  </button>
                  <button
                    onClick={() => handleQuickDate(-1)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 min-h-[44px]"
                    title="Shalay"
                  >
                    Shalay
                  </button>
                  <button
                    onClick={() => handleQuickDate(-2)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 min-h-[44px]"
                    title="Doraad"
                  >
                    -2
                  </button>
                </div>
              </div>
              
              {dateInfo && (
                <p className={`text-xs mt-1 flex items-center ${
                  dateInfo.includes('Khalad') ? 'text-red-600' : 
                  dateInfo.includes('hore u cashar') ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {dateInfo.includes('Khalad') ? <FiAlertCircle className="mr-1" /> : <FiInfo className="mr-1" />}
                  {dateInfo}
                </p>
              )}
              
              {isLoadingDateSessions && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <FiLoader className="animate-spin mr-1" />
                  {translations.loadingDateData}
                </p>
              )}
            </div>
          </div>

          {/* Quran Lesson Details */}
          {selectedClassId && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-3">Faahfaahin Casharka Quraanka</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">Surah</label>
                  <input
                    type="text"
                    value={currentSurah}
                    onChange={(e) => setCurrentSurah(e.target.value)}
                    placeholder="Tusaale: Al-Fatiha"
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">Taxdiid</label>
                  <input
                    type="text"
                    value={taxdiid}
                    onChange={(e) => setTaxdiid(e.target.value)}
                    placeholder="Tusaale: 1-7"
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">Qoraal dheeraad ah</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Qoraal dheeraad ah..."
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display message when no classes */}
          {!loadingClasses && classes.length === 0 && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 flex items-center">
                <FiUsers className="mr-2" />
                {translations.noClasses}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Fadlan hubi in aad leedahay fasallo ama internet-kaaga iska hubi.
              </p>
            </div>
          )}

          {/* Date Information */}
          {selectedClassId && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <FiInfo className="mr-2 flex-shrink-0" />
                <span>
                  Waxaad diiwaan gelin kartaa casharro taariikhda <strong>{formatDateForDisplay(selectedDate)}</strong>.
                  Hadii casharro hore u jiraan taariikhdan, waxaa la cusboonaysiin doonaa.
                </span>
              </p>
            </div>
          )}

          {/* Statistics */}
          {selectedClassId && quranRecords.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
                  <div className="text-xs md:text-sm text-blue-600 font-medium">{translations.totalStudents}</div>
                  <div className="text-xl md:text-2xl font-bold text-blue-700">{statistics.total}</div>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
                  <div className="text-xs md:text-sm text-green-600 font-medium">{translations.passed}</div>
                  <div className="text-xl md:text-2xl font-bold text-green-700">{statistics.gartay}</div>
                </div>
                <div className="bg-red-50 p-3 md:p-4 rounded-lg border border-red-200">
                  <div className="text-xs md:text-sm text-red-600 font-medium">{translations.failed}</div>
                  <div className="text-xl md:text-2xl font-bold text-red-700">{statistics.garanWaayay}</div>
                </div>
                <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
                  <div className="text-xs md:text-sm text-yellow-600 font-medium">{translations.absent}</div>
                  <div className="text-xl md:text-2xl font-bold text-yellow-700">{statistics.majoogo}</div>
                </div>
                <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-200">
                  <div className="text-xs md:text-sm text-purple-600 font-medium">Hore u diiwaan gashan</div>
                  <div className="text-xl md:text-2xl font-bold text-purple-700">{statistics.existing}</div>
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 min-h-[44px] w-full md:w-auto"
                >
                  <FiPrinter className="mr-2" />
                  {translations.printReport}
                </button>
              </div>
            </>
          )}

          {/* Bulk Actions */}
          {selectedClassId && quranRecords.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-gray-700">{translations.selectAll}:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectAll('gartay')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 active:bg-green-300 flex-1 min-w-[120px] min-h-[44px] flex items-center justify-center"
                  >
                    <FiCheck className="mr-1" />
                    {translations.gartay} Dhammaan
                  </button>
                  <button
                    onClick={() => handleSelectAll('garan waayay')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 active:bg-red-300 flex-1 min-w-[120px] min-h-[44px] flex items-center justify-center"
                  >
                    <FiX className="mr-1" />
                    {translations.garanWaayay} Dhammaan
                  </button>
                  <button
                    onClick={() => handleSelectAll('majoogo')}
                    className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 active:bg-yellow-300 flex-1 min-w-[120px] min-h-[44px] flex items-center justify-center"
                  >
                    <FiClock className="mr-1" />
                    {translations.majoogo} Dhammaan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(loadingStudents || isLoadingDateSessions || isInitialLoad) && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {isLoadingDateSessions ? 'Soo dejineyn casharrada taariikhdan...' : 
                 isInitialLoad ? 'Soo dejineyn xogta...' : 
                 'Soo dejineyn ardayda fasalka...'}
              </p>
            </div>
          )}

          {/* No Students Message */}
          {selectedClassId && !loadingStudents && students && students.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{translations.noStudents}</h3>
              <p className="text-gray-600">Fasalkan ma laha arday diiwaan gashan.</p>
            </div>
          )}

          {/* Students Table */}
          {quranRecords.length > 0 && !loadingStudents && !isLoadingDateSessions && !isInitialLoad && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Ardayda Fasalka ({quranRecords.length}) - {formatDateForDisplay(selectedDate)}
                {hasExistingSessions && (
                  <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    {statistics.existing} cashar hore u diiwaan gashan
                  </span>
                )}
              </h3>
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {translations.studentName}
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {translations.studentId}
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {translations.status}
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            {translations.updateStatus}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {quranRecords.map((record, index) => (
                          <tr key={record.student} className={`hover:bg-gray-50 ${record.hasExistingSession ? 'bg-blue-50' : ''}`}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {index + 1}
                              {record.hasExistingSession && (
                                <span className="ml-2 text-xs text-blue-600" title="Hore u diiwaan gashan">
                                  ✓
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                              {record.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.studentId}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${
                                  record.status === 'gartay' ? 'bg-green-500' :
                                  record.status === 'garan waayay' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                                <span className={`font-medium ${
                                  record.status === 'gartay' ? 'text-green-700' :
                                  record.status === 'garan waayay' ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                  {record.status === 'gartay' ? translations.gartay :
                                   record.status === 'garan waayay' ? translations.garanWaayay :
                                   translations.majoogo}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleStatusChange(record.student, 'gartay')}
                                  className={`px-3 py-2 rounded-md text-sm flex items-center justify-center min-h-[36px] min-w-[80px] ${getStatusStyle('gartay', record.status)}`}
                                >
                                  <FiCheck className="mr-1 flex-shrink-0" /> 
                                  <span className="truncate">{translations.gartay}</span>
                                </button>
                                <button
                                  onClick={() => handleStatusChange(record.student, 'garan waayay')}
                                  className={`px-3 py-2 rounded-md text-sm flex items-center justify-center min-h-[36px] min-w-[80px] ${getStatusStyle('garan waayay', record.status)}`}
                                >
                                  <FiX className="mr-1 flex-shrink-0" /> 
                                  <span className="truncate">{translations.garanWaayay}</span>
                                </button>
                                <button
                                  onClick={() => handleStatusChange(record.student, 'majoogo')}
                                  className={`px-3 py-2 rounded-md text-sm flex items-center justify-center min-h-[36px] min-w-[80px] ${getStatusStyle('majoogo', record.status)}`}
                                >
                                  <FiClock className="mr-1 flex-shrink-0" /> 
                                  <span className="truncate">{translations.majoogo}</span>
                                </button>
                                <button
                                  onClick={() => handleSaveSingleSession(record.student, record.status)}
                                  disabled={loading}
                                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 active:bg-blue-300 disabled:opacity-50 flex items-center justify-center min-h-[36px] min-w-[80px]"
                                >
                                  {loading ? (
                                    <span className="truncate">{translations.saving}</span>
                                  ) : (
                                    <>
                                      <FiSave className="mr-1 flex-shrink-0" />
                                      <span className="truncate">{translations.submitSingle}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleRefresh}
                disabled={loading || !selectedClassId}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 w-full md:w-auto min-h-[44px]"
              >
                <FiRotateCw className="mr-2" />
                {translations.refresh}
              </button>
              
              {selectedClassId && (
                <button
                  onClick={handleLoadDateSessions}
                  disabled={isLoadingDateSessions || !selectedClassId}
                  className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-200 active:bg-blue-300 disabled:opacity-50 w-full md:w-auto min-h-[44px]"
                >
                  {isLoadingDateSessions ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Soo dejineyn...
                    </>
                  ) : (
                    <>
                      <FiCalendar className="mr-2" />
                      Soo deji taariikhdan
                    </>
                  )}
                </button>
              )}
            </div>
            
            {selectedClassId && quranRecords.length > 0 && (
              <button
                onClick={handleSaveAllSessions}
                disabled={loading || !selectedClassId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center justify-center w-full md:w-auto min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {translations.creating}
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    {translations.submitAll} ({formatDateForDisplay(selectedDate)})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{translations.printReport}</h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-white hover:text-gray-200 p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4 md:p-8 overflow-auto max-h-[70vh]">
              <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold text-blue-700 mb-2">{translations.reportTitle}</h1>
                <p className="text-gray-600">
                  {selectedClass?.name || 'Fasalka'} | {formatDateForDisplay(selectedDate)}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="mb-2"><strong className="text-gray-700">{translations.class}:</strong> {selectedClass?.name || '-'}</p>
                  <p><strong className="text-gray-700">{translations.date}:</strong> {formatDateForDisplay(selectedDate)}</p>
                </div>
                <div>
                  <p className="mb-2"><strong className="text-gray-700">{translations.generatedOn}:</strong> {new Date().toLocaleDateString('so-SO')}</p>
                  <p><strong className="text-gray-700">{translations.totalStudents}:</strong> {statistics.total}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-700">{statistics.gartay}</div>
                  <div className="text-sm text-green-600">{translations.passed}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                  <div className="text-2xl font-bold text-red-700">{statistics.garanWaayay}</div>
                  <div className="text-sm text-red-600">{translations.failed}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{statistics.majoogo}</div>
                  <div className="text-sm text-yellow-600">{translations.absent}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-700">{successRate}%</div>
                  <div className="text-sm text-blue-600">Guul</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">#</th>
                      <th className="border border-gray-300 p-3 text-left">{translations.studentName}</th>
                      <th className="border border-gray-300 p-3 text-left">{translations.studentId}</th>
                      <th className="border border-gray-300 p-3 text-left">{translations.phone}</th>
                      <th className="border border-gray-300 p-3 text-left">{translations.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quranRecords.map((record, index) => (
                      <tr key={record.student} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{index + 1}</td>
                        <td className="border border-gray-300 p-3 font-medium">{record.name}</td>
                        <td className="border border-gray-300 p-3">{record.studentId}</td>
                        <td className="border border-gray-300 p-3">{record.phone}</td>
                        <td className="border border-gray-300 p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            record.status === 'gartay' ? 'bg-green-100 text-green-800' :
                            record.status === 'garan waayay' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status === 'gartay' ? translations.gartay :
                             record.status === 'garan waayay' ? translations.garanWaayay :
                             translations.majoogo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-300 text-center text-gray-600 text-sm">
                <p>Warbixinta ayaa lagu sameeyay ${new Date().toLocaleString('so-SO')}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-end gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 w-full md:w-auto min-h-[44px]"
              >
                Xidh
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 active:bg-blue-300 flex items-center justify-center w-full md:w-auto min-h-[44px]"
              >
                <FiPrinter className="mr-2" />
                {translations.print}
              </button>
              <button
                onClick={generatePDF}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center w-full md:w-auto min-h-[44px]"
              >
                <FiDownload className="mr-2" />
                {translations.downloadPDF}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDailyQuranSession;