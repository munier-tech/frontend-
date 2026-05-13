import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom,
  Badge,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Paid as PaidIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  CalendarMonth as CalendarMonthIcon,
  FilterAlt as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSalaryStore } from '../store/salaryStore';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

const translations = {
  so: {
    title: 'Maamulka Mushaharka',
    subtitle: 'Maamul wax ku ool ah oo mushaharka macalimiinta',
    addSalary: 'Ku Dar Diiwaan Mushahar',
    addAllSalaries: 'Ku Dar Dhammaan Mushaharka',
    teacher: 'Macalin',
    amount: 'Qadarka',
    month: 'Bisha',
    year: 'Sanadka',
    bonus: 'AbaalMarin',
    deductions: 'Lacag ka Goosasho',
    note: 'Qoraal',
    paid: 'La Bixiyay',
    unpaid: 'Aan La Bixin',
    markAsPaid: 'Calaamadee in La Bixiyay',
    edit: 'Wax Ka Beddel',
    delete: 'Tirtir',
    cancel: 'Jooji',
    save: 'Kaydi',
    totalSalaries: 'Wadarta Mushaharka',
    paidSalaries: 'Mushaharka La Bixiyay',
    unpaidSalaries: 'Mushaharka Aan La Bixin',
    totalAmount: 'Wadarta Qadarka',
    paidAmount: 'Qadar La Bixiyay',
    unpaidAmount: 'Qadar Aan La Bixin',
    salaryRecords: 'Diiwaanka Mushaharka',
    statistics: 'Tirakoob',
    allTeachers: 'Macalimiinta Oo Dhan',
    createSuccess: 'Diiwaanka mushahara si guul leh ayaa loo abuuray',
    updateSuccess: 'Diiwaanka mushahara si guul leh ayaa loo cusboonaysiiyay',
    deleteSuccess: 'Diiwaanka mushahara si guul leh ayaa loo tirtiray',
    markPaidSuccess: 'Mushaharka si guul leh ayaa loo calaamadeeyay in la bixiyay',
    selectTeacher: 'Xulo Macalin',
    selectMonth: 'Xulo Bisha',
    selectYear: 'Xulo Sanadka',
    confirmDelete: 'Ma hubtaa inaad rabto inaad tirtirto diiwaankan mushahara?',
    requiredField: 'Goobtan waa lagama maarmaanka ah',
    loading: 'Soo dejinta...',
    noRecords: 'Lama helin diiwaan mushahar',
    noTeachers: 'Macalimiin lama helin',
    filter: 'Filter',
    clear: 'Nadiif',
    total: 'Wadarta',
    status: 'Xaalad',
    actions: 'Tallaabooyin',
    salaryStatus: 'Xaaladda Mushaharka',
    currentPeriod: 'Mudada Hadda',
    noRecord: 'Diiwaan ma jiro',
    quickStats: 'Tirakoob Degdeg ah',
    paymentProgress: 'Horumarinta Bixinta',
  },
};

const months = [
  { value: 1, label: { so: 'Janaayo' }, short: 'Jan', color: '#FF6B6B' },
  { value: 2, label: { so: 'Febraayo' }, short: 'Feb', color: '#4ECDC4' },
  { value: 3, label: { so: 'Maarso' }, short: 'Mar', color: '#45B7D1' },
  { value: 4, label: { so: 'Abriil' }, short: 'Apr', color: '#96CEB4' },
  { value: 5, label: { so: 'Maajo' }, short: 'May', color: '#FFEAA7' },
  { value: 6, label: { so: 'Juun' }, short: 'Jun', color: '#DDA0DD' },
  { value: 7, label: { so: 'Luuliyo' }, short: 'Jul', color: '#98D8C8' },
  { value: 8, label: { so: 'Agoosto' }, short: 'Aug', color: '#F7B787' },
  { value: 9, label: { so: 'Sebtembar' }, short: 'Sep', color: '#B5EAD7' },
  { value: 10, label: { so: 'Oktoobar' }, short: 'Oct', color: '#FFDAC1' },
  { value: 11, label: { so: 'Nofembar' }, short: 'Nov', color: '#E2F0CB' },
  { value: 12, label: { so: 'Desembar' }, short: 'Dec', color: '#FFB7B2' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function SalaryFile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const language = 'so';
  const t = translations[language];

  const {
    salaryRecords,
    teachers,
    salaryStatistics,
    loading,
    createSalaryRecord,
    createAllTeachersSalaries,
    getAllTeachers,
    getAllSalaryRecords,
    updateSalaryRecord,
    deleteSalaryRecord,
    getSalaryStatistics,
  } = useSalaryStore();

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear,
    paid: '',
  });

  const [formData, setFormData] = useState({
    teacher: '',
    amount: '',
    month: filters.month,
    year: filters.year,
    bonus: '',
    deductions: '',
    note: '',
    paid: false,
  });

  const [bulkFormData, setBulkFormData] = useState({
    amount: '',
    month: filters.month,
    year: filters.year,
    bonus: '',
    deductions: '',
    note: '',
  });

  useEffect(() => {
    getAllSalaryRecords(filters);
    getSalaryStatistics(filters.month, filters.year);
    getAllTeachers(filters.month, filters.year);
  }, [filters.month, filters.year, filters.paid]);

  const handleTabChange = (_e, newValue) => setTabValue(newValue);

  const handleOpenDialog = (record = null) => {
    setCurrentRecord(record);
    if (record) {
      setFormData({
        teacher: record.teacher?._id || '',
        amount: record.amount ?? '',
        month: record.month,
        year: record.year,
        bonus: record.bonus ?? '',
        deductions: record.deductions ?? '',
        note: record.note ?? '',
        paid: !!record.paid,
      });
    } else {
      setFormData({
        teacher: '',
        amount: '',
        month: filters.month,
        year: filters.year,
        bonus: '',
        deductions: '',
        note: '',
        paid: false,
      });
    }
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({
      amount: '',
      month: filters.month,
      year: filters.year,
      bonus: '',
      deductions: '',
      note: '',
    });
    setOpenBulkDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenBulkDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ month: new Date().getMonth() + 1, year: currentYear, paid: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRecord) {
        await updateSalaryRecord(currentRecord._id, {
          ...formData,
          paid: !!formData.paid,
        });
        toast.success(t.updateSuccess);
      } else {
        await createSalaryRecord({
          ...formData,
          paid: !!formData.paid,
        });
        toast.success(t.createSuccess);
      }
      setOpenDialog(false);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error saving salary record:', error);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAllTeachersSalaries(bulkFormData);
      toast.success(t.createSuccess);
      setOpenBulkDialog(false);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error creating bulk salaries:', error);
    }
  };

  const handleMarkAsPaid = async (record) => {
    try {
      await updateSalaryRecord(record._id, { paid: true });
      toast.success(t.markPaidSuccess);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
    } catch (error) {
      console.error('Error marking salary as paid:', error);
    }
  };

  const handleOpenDeleteDialog = (record) => {
    setCurrentRecord(record);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!currentRecord) return;
    try {
      await deleteSalaryRecord(currentRecord._id);
      toast.success(t.deleteSuccess);
      setOpenDeleteDialog(false);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error deleting salary record:', error);
    }
  };

  const getMonthName = (monthValue) => {
    const m = months.find((mm) => mm.value === monthValue);
    return m ? m.label[language] : '';
  };

  const getMonthColor = (monthValue) => {
    const m = months.find((mm) => mm.value === monthValue);
    return m ? m.color : theme.palette.primary.main;
  };

  const calculateProgress = () => {
    const total = salaryStatistics?.totalSalaries || 0;
    const paid = salaryStatistics?.paidSalaries || 0;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  const renderSalaryRecordCells = (record) => {
    const totalStr = (record.totalAmount ?? (Number(record.amount || 0) + Number(record.bonus || 0) - Number(record.deductions || 0))).toLocaleString();

    if (isMobile) {
      return (
        <>
          <TableCell>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  {record.teacher?.name?.charAt(0) || '?'}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {record.teacher?.name || 'N/A'}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label={record.paid ? t.paid : t.unpaid}
                      color={record.paid ? 'success' : 'error'}
                      size="small"
                      icon={record.paid ? <CheckCircleIcon /> : <CancelIcon />}
                      sx={{ height: 24, fontSize: '0.7rem' }}
                    />
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      ${totalStr}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title={t.edit}>
                <IconButton size="small" onClick={() => handleOpenDialog(record)} sx={{ color: 'info.main' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t.delete}>
                <IconButton size="small" onClick={() => handleOpenDeleteDialog(record)} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {!record.paid && (
                <Tooltip title={t.markAsPaid}>
                  <IconButton size="small" onClick={() => handleMarkAsPaid(record)} sx={{ color: 'success.main' }}>
                    <PaidIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        </>
      );
    }

    return (
      <>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              {record.teacher?.name?.charAt(0) || '?'}
            </Avatar>
            <Typography fontWeight="medium">{record.teacher?.name || 'N/A'}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography fontWeight="bold" color="primary.main">
            ${Number(record.amount || 0).toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography color="success.main">+${Number(record.bonus || 0).toLocaleString()}</Typography>
        </TableCell>
        <TableCell>
          <Typography color="error.main">-${Number(record.deductions || 0).toLocaleString()}</Typography>
        </TableCell>
        <TableCell>
          <Typography fontWeight="bold" fontSize="1.1rem">
            ${totalStr}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={record.paid ? t.paid : t.unpaid}
            color={record.paid ? 'success' : 'error'}
            size="small"
            icon={record.paid ? <CheckCircleIcon /> : <CancelIcon />}
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t.edit}>
              <IconButton size="small" onClick={() => handleOpenDialog(record)} sx={{ color: 'info.main', '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t.delete}>
              <IconButton size="small" onClick={() => handleOpenDeleteDialog(record)} sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {!record.paid && (
              <Tooltip title={t.markAsPaid}>
                <IconButton size="small" onClick={() => handleMarkAsPaid(record)} sx={{ color: 'success.main', '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) } }}>
                  <PaidIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative Background Elements */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '40%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: '30%', background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      
      <Box sx={{ p: isSmallMobile ? 2 : 4, position: 'relative', zIndex: 1 }}>
        {/* Header Section with Animation */}
        <Grow in={true} timeout={800}>
          <Box sx={{ mb: isSmallMobile ? 3 : 5 }}>
            <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} sx={{ mb: 3 }}>
              <Box>
                <Typography 
                  variant={isMobile ? 'h4' : 'h3'} 
                  component="h1" 
                  sx={{ 
                    fontWeight: '800',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  {t.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {t.subtitle}
                </Typography>
              </Box>
              
              <Zoom in={true} timeout={600}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    mt: isMobile ? 2 : 0,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.addSalary}
                </Button>
              </Zoom>
            </Stack>

            {/* Period Selector Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: '20px',
                p: isSmallMobile ? 2 : 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`, borderRadius: '50%' }} />
              <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, background: `radial-gradient(circle, ${alpha('#fff', 0.08)} 0%, transparent 70%)`, borderRadius: '50%' }} />
              
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 48, height: 48 }}>
                  <CalendarMonthIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t.currentPeriod}
                  </Typography>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold' }}>
                    {getMonthName(filters.month)} {filters.year}
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: alpha('#fff', 0.8) }}>{t.month}</InputLabel>
                    <Select 
                      value={filters.month} 
                      onChange={(e) => setFilters({ ...filters, month: e.target.value })} 
                      label={t.month}
                      sx={{ 
                        backgroundColor: alpha('#fff', 0.15),
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.5) },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      {months.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {isMobile ? month.short : month.label[language]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: alpha('#fff', 0.8) }}>{t.year}</InputLabel>
                    <Select 
                      value={filters.year} 
                      onChange={(e) => setFilters({ ...filters, year: e.target.value })} 
                      label={t.year}
                      sx={{ 
                        backgroundColor: alpha('#fff', 0.15),
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.5) },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()} 
                    fullWidth 
                    sx={{ 
                      height: '40px',
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: alpha('#fff', 0.9), transform: 'translateY(-2px)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t.addSalary}
                  </Button>
                </Grid>
              </Grid>
            </MotionCard>
          </Box>
        </Grow>

        {/* Statistics Cards with Animation */}
        <Grid container spacing={isSmallMobile ? 2 : 3} sx={{ mb: 4 }}>
          {[
            { icon: <PeopleIcon />, label: t.totalSalaries, value: salaryStatistics?.totalSalaries || 0, color: theme.palette.primary.main, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { icon: <PaidIcon />, label: t.paidSalaries, value: salaryStatistics?.paidSalaries || 0, color: theme.palette.success.main, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
            { icon: <AttachMoneyIcon />, label: t.unpaidSalaries, value: salaryStatistics?.unpaidSalaries || 0, color: theme.palette.error.main, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Grow in={true} timeout={600 + index * 100}>
                <MotionCard
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  sx={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, white 0%, ${alpha(stat.color, 0.05)} 100%)`,
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle, ${alpha(stat.color, 0.1)} 0%, transparent 100%)` }} />
                  <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: alpha(stat.color, 0.1), 
                        color: stat.color, 
                        width: isSmallMobile ? 48 : 56, 
                        height: isSmallMobile ? 48 : 56,
                        background: `linear-gradient(135deg, ${alpha(stat.color, 0.15)} 0%, ${alpha(stat.color, 0.05)} 100%)`
                      }}>
                        {stat.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant={isSmallMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold', color: stat.color, lineHeight: 1.2 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </MotionCard>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Card */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          elevation={0}
          sx={{ borderRadius: '20px', boxShadow: `0 20px 40px ${alpha('#000', 0.05)}`, overflow: 'hidden' }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 2, borderColor: 'divider', bgcolor: '#fafbfc' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
                  py: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                },
                '& .MuiTabs-indicator': { height: 3, backgroundColor: theme.palette.primary.main }
              }}
            >
              <Tab icon={<ReceiptLongIcon />} iconPosition="start" label={t.salaryRecords} />
              <Tab icon={<BarChartIcon />} iconPosition="start" label={t.statistics} />
              <Tab icon={<SchoolIcon />} iconPosition="start" label={t.allTeachers} />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: isSmallMobile ? 2 : 3 }}>
            {/* Salary Records Tab */}
            {tabValue === 0 && (
              <Fade in={tabValue === 0}>
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 3, gap: isMobile ? 2 : 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {t.salaryRecords}
                      <Chip 
                        label={`${getMonthName(filters.month)} ${filters.year}`}
                        size="small"
                        sx={{ ml: 1, bgcolor: alpha(getMonthColor(filters.month), 0.1), color: getMonthColor(filters.month), fontWeight: 'bold' }}
                      />
                    </Typography>

                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} width={isMobile ? '100%' : 'auto'}>
                      <Button 
                        variant="outlined" 
                        startIcon={<FilterIcon />} 
                        onClick={handleOpenBulkDialog} 
                        fullWidth={isMobile}
                        sx={{ borderRadius: '10px' }}
                      >
                        {t.addAllSalaries}
                      </Button>

                      <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 140 }}>
                        <InputLabel>{t.status}</InputLabel>
                        <Select value={filters.paid} onChange={(e) => setFilters({ ...filters, paid: e.target.value })} label={t.status}>
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="true">{t.paid}</MenuItem>
                          <MenuItem value="false">{t.unpaid}</MenuItem>
                        </Select>
                      </FormControl>

                      <Button variant="text" onClick={clearFilters} sx={{ color: 'text.secondary' }}>{t.clear}</Button>
                    </Stack>
                  </Box>

                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Table sx={{ minWidth: isMobile ? 320 : 750 }}>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                          {isMobile ? (
                            <>
                              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{t.teacher}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{t.actions}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.teacher}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.amount}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.bonus}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.deductions}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.total}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.status}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={isMobile ? 2 : 7} align="center" sx={{ py: 8 }}>
                                <CircularProgress />
                              </TableCell>
                            </TableRow>
                          ) : salaryRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={isMobile ? 2 : 7} align="center" sx={{ py: 8 }}>
                                <Typography color="text.secondary">{t.noRecords}</Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            salaryRecords.map((record, index) => (
                              <MotionTableRow
                                key={record._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                hover
                                sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                              >
                                {renderSalaryRecordCells(record)}
                              </MotionTableRow>
                            ))
                          )}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Fade>
            )}

            {/* Statistics Tab */}
            {tabValue === 1 && (
              <Fade in={tabValue === 1}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {t.statistics}
                    <Chip 
                      label={`${getMonthName(filters.month)} ${filters.year}`}
                      size="small"
                      sx={{ ml: 1, bgcolor: alpha(getMonthColor(filters.month), 0.1), color: getMonthColor(filters.month) }}
                    />
                  </Typography>
                  
                  <Grid container spacing={isSmallMobile ? 2 : 3}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        p: isSmallMobile ? 2 : 3, 
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, white 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            <AttachMoneyIcon />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                            {t.totalAmount}
                          </Typography>
                        </Stack>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                          ${Number(salaryStatistics?.totalAmount || 0).toLocaleString()}
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        p: isSmallMobile ? 2 : 3, 
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, white 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                      }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                            <CheckCircleIcon />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                            {t.paidAmount}
                          </Typography>
                        </Stack>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                          ${Number(salaryStatistics?.paidAmount || 0).toLocaleString()}
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        p: isSmallMobile ? 2 : 3, 
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, white 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                      }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                            <CancelIcon />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                            {t.unpaidAmount}
                          </Typography>
                        </Stack>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                          ${Number(salaryStatistics?.unpaidAmount || 0).toLocaleString()}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Progress Card */}
                  <Card sx={{ mt: 3, p: 3, borderRadius: '16px', background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)` }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <TrendingUpIcon color="info" />
                      <Typography variant="subtitle1" fontWeight="bold">{t.paymentProgress}</Typography>
                    </Stack>
                    <Box sx={{ position: 'relative', height: 8, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${calculateProgress()}%`, background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`, borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{calculateProgress().toFixed(1)}%</Typography>
                    <Typography variant="caption" color="text.secondary">{salaryStatistics?.paidSalaries || 0} of {salaryStatistics?.totalSalaries || 0} teachers paid</Typography>
                  </Card>
                </Box>
              </Fade>
            )}

            {/* All Teachers Tab */}
            {tabValue === 2 && (
              <Fade in={tabValue === 2}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t.teacher}</TableCell>
                        {!isMobile && (
                          <>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                          </>
                        )}
                        <TableCell sx={{ fontWeight: 'bold' }}>{t.salaryStatus}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 8 }}>
                              <CircularProgress />
                            </TableCell>
                          </TableRow>
                        ) : teachers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 8 }}>
                              <Typography color="text.secondary">{t.noTeachers}</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          teachers.map((teacher, index) => (
                            <MotionTableRow
                              key={teacher._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              hover
                            >
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                    {teacher.name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Box>
                                    <Typography fontWeight="medium">{teacher.name}</Typography>
                                    {isMobile && (
                                      <Typography variant="caption" color="text.secondary">
                                        {teacher.email}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </TableCell>
                              {!isMobile && (
                                <>
                                  <TableCell>{teacher.email}</TableCell>
                                  <TableCell>{teacher.subject}</TableCell>
                                </>
                              )}
                              <TableCell>
                                {teacher.salaryRecord ? (
                                  <Chip 
                                    label={teacher.salaryRecord.paid ? t.paid : t.unpaid} 
                                    color={teacher.salaryRecord.paid ? 'success' : 'error'} 
                                    size="small" 
                                    icon={teacher.salaryRecord.paid ? <CheckCircleIcon /> : <CancelIcon />}
                                  />
                                ) : (
                                  <Chip label={t.noRecord} color="warning" size="small" variant="outlined" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color={teacher.salaryRecord ? 'info' : 'primary'}
                                  onClick={() => {
                                    if (teacher.salaryRecord) {
                                      handleOpenDialog(teacher.salaryRecord);
                                    } else {
                                      setFormData({
                                        teacher: teacher._id,
                                        amount: '',
                                        month: filters.month,
                                        year: filters.year,
                                        bonus: '',
                                        deductions: '',
                                        note: '',
                                        paid: false,
                                      });
                                      setOpenDialog(true);
                                    }
                                  }}
                                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                                >
                                  {teacher.salaryRecord ? t.edit : t.addSalary}
                                </Button>
                              </TableCell>
                            </MotionTableRow>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Fade>
            )}
          </Box>
        </MotionCard>

        {/* Dialogs remain similar but with enhanced styling */}
        {/* Add/Edit Salary Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" fullScreen={isSmallMobile}>
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            {currentRecord ? t.edit : t.addSalary}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>{t.teacher}</InputLabel>
                    <Select name="teacher" value={formData.teacher} onChange={handleInputChange} label={t.teacher} required disabled={!!currentRecord}>
                      <MenuItem value="">{t.selectTeacher}</MenuItem>
                      {teachers.map((teacher) => (
                        <MenuItem key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="amount" label={t.amount} type="number" value={formData.amount} onChange={handleInputChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t.month}</InputLabel>
                    <Select name="month" value={formData.month} onChange={handleInputChange} label={t.month} required>
                      {months.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label[language]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t.year}</InputLabel>
                    <Select name="year" value={formData.year} onChange={handleInputChange} label={t.year} required>
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="bonus" label={t.bonus} type="number" value={formData.bonus} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="deductions" label={t.deductions} type="number" value={formData.deductions} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="note" label={t.note} value={formData.note} onChange={handleInputChange} fullWidth multiline rows={3} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>{t.status}</InputLabel>
                    <Select
                      name="paid"
                      value={String(formData.paid)}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paid: e.target.value === 'true' }))}
                      label={t.status}
                    >
                      <MenuItem value={'false'}>{t.unpaid}</MenuItem>
                      <MenuItem value={'true'}>{t.paid}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <DialogActions sx={{ mt: 2, pt: 2 }}>
                <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                  {t.cancel}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {t.save}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Add Dialog */}
        <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} fullWidth maxWidth="sm" fullScreen={isSmallMobile}>
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 'bold'
          }}>
            {t.addAllSalaries}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <form onSubmit={handleBulkSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="amount" label={t.amount} type="number" value={bulkFormData.amount} onChange={handleBulkInputChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="bonus" label={t.bonus} type="number" value={bulkFormData.bonus} onChange={handleBulkInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="deductions" label={t.deductions} type="number" value={bulkFormData.deductions} onChange={handleBulkInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t.month}</InputLabel>
                    <Select name="month" value={bulkFormData.month} onChange={handleBulkInputChange} label={t.month} required>
                      {months.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label[language]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t.year}</InputLabel>
                    <Select name="year" value={bulkFormData.year} onChange={handleBulkInputChange} label={t.year} required>
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField name="note" label={t.note} value={bulkFormData.note} onChange={handleBulkInputChange} fullWidth multiline rows={3} />
                </Grid>
              </Grid>
              <DialogActions sx={{ mt: 2, pt: 2 }}>
                <Button onClick={() => setOpenBulkDialog(false)} color="secondary" variant="outlined">
                  {t.cancel}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {t.save}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
            {t.confirmDelete}
          </DialogTitle>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
              {t.cancel}
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              {t.delete}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}