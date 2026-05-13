// src/pages/students/CreateMultipleStudents.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiMinus, FiUpload, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import useStudentsStore from '../../store/studentsStore';
import useClassesStore from '../../store/classesStore';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const emptyStudent = () => ({
  fullname: '',
  age: '',
  gender: 'male',
  motherNumber: '',
  fatherNumber: '',
  fee: { total: '', paid: '' }
});

const CreateMultipleStudents = () => {
  const navigate = useNavigate();
  const { classes, fetchClasses } = useClassesStore();
  const { createMultipleStudents, creatingMultiple } = useStudentsStore();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([emptyStudent()]);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'excel'

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const addRow = () => setStudents(prev => [...prev, emptyStudent()]);
  const removeRow = (index) => setStudents(prev => prev.filter((_, i) => i !== index));

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setStudents(prev => prev.map((s, i) => {
      if (i !== index) return s;
      if (name.includes('fee.')) {
        const key = name.split('.')[1];
        return { ...s, fee: { ...s.fee, [key]: value } };
      }
      return { ...s, [name]: value };
    }));
  };

  const handleExcelSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check for Excel file types
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet'
      ];
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(file.type) || 
                         ['xls', 'xlsx', 'ods'].includes(fileExtension);

      if (!isValidType) {
        toast.error('Fadlan dooro faylka Excel (xls, xlsx)');
        return;
      }
      setExcelFile(file);
      toast.success('Faylka Excel waa la soo geliyay!');
    }
  };

  const validateManualStudents = () => {
    if (!selectedClassId) {
      return { ok: false, message: 'Fadlan dooro fasalka' };
    }

    for (const s of students) {
      if (!s.fullname || !s.motherNumber || !s.fatherNumber) {
        return { ok: false, message: 'Fadlan buuxi magaca iyo lambarrada waalidka ee arday kasta' };
      }
      if (s.age !== '' && Number(s.age) < 0) return { ok: false, message: `Da'da ${s.fullname} waa khalad` };
    }
    return { ok: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (uploadMode === 'manual') {
        const v = validateManualStudents();
        if (!v.ok) return toast.error(v.message);
        
        const payload = {
          students: students.map(s => ({
            fullname: s.fullname,
            age: s.age === '' ? undefined : Number(s.age),
            gender: s.gender,
            classId: selectedClassId,
            motherNumber: s.motherNumber,
            fatherNumber: s.fatherNumber,
            fee: {
              total: s.fee.total === '' ? undefined : Number(s.fee.total),
              paid: s.fee.paid === '' ? undefined : Number(s.fee.paid)
            }
          })),
          classId: selectedClassId
        };
        
        console.log('Manual payload:', payload);
        // CORRECTED: Pass two parameters - studentsData and null for formData
        const res = await createMultipleStudents(payload, null);
        if (res.success) {
          toast.success(`${students.length} arday ayaa loo guuleystay in lagu daro fasalka`);
          navigate('/getAllStudents');
        }
      } else {
        // Excel mode
        if (!excelFile) return toast.error('Fadlan dooro faylka Excel aad ku upload gareyso');
        if (!selectedClassId) return toast.error('Fadlan dooro fasalka');
        
        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('classId', selectedClassId);
        
        // Debug: Log FormData contents
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ', pair[1]);
        }
        
        // CORRECTED: Pass two parameters - null for studentsData and formData
        const res = await createMultipleStudents(null, formData);
        if (res.success) {
          toast.success('Ardayada Excel-ka ayaa loo guuleystay in lagu daro fasalka');
          navigate('/getAllStudents');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Qalad ayaa dhacay');
    }
  };

  // Function to download empty Excel template
  const downloadTemplate = () => {
    const templateData = [
      ['Student Name', 'Age', 'motherNumber', 'fatherNumber'],
      ['Cabdulaahi daahir cali', '15', '0637066503', '0612345678'],
      ['Cabdicasiis cabdulaahi cusmaan', '16', '06367113337', '0612345679'],
      ['Cabdicasiis daahir cali', '14', '0636105875', '0612345680'],
      ['', '', '', ''],
      ['NOTES:', '', '', ''],
      ['- Buuxi magacyada ardayda', '', '', ''],
      ['- Da\'da iyo lambarrada waalidka', '', '', ''],
      ['- Ha ku darin heading-ka Excel', '', '', '']
    ];

    let csvContent = "data:text/csv;charset=utf-8,\ufeff"; // BOM for UTF-8
    templateData.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_ardayda.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template-ka Excel waa la soo dejisay!');
  };

  return (
    <motion.div className="container mx-auto px-4 py-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="mb-6" variants={itemVariants}>
        <motion.button onClick={() => navigate('/getAllStudents')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <FiArrowLeft /> Ku noqo Ardayda
        </motion.button>
      </motion.div>

      <motion.div className="bg-white rounded-lg shadow overflow-hidden" variants={itemVariants} whileHover={{ boxShadow: "0 10px 25px -3px rgba(0,0,0,0.08)" }}>
        <div className="px-6 py-4 border-b bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800">Ku dar Ardayo Badan (Multiple Students)</h1>
          <p className="text-sm text-gray-600 mt-1">Dooro habka: gacanta (manual) ama upload Excel (xls, xlsx).</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Class Selection - Top Level */}
          <motion.div className="border p-4 rounded-md bg-blue-50" variants={itemVariants}>
            <label className="block mb-2 font-semibold text-blue-900">Dooro Fasalka (Ardayda oo dhan waxay noqon doonaan fasalkan)</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)} 
              className="p-2 border rounded w-full md:w-1/2"
              required
            >
              <option value="">Dooro Fasalka</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-blue-700 mt-2">Ardayda oo dhan waxaa lagu darayaa fasalka aad dooratay.</p>
          </motion.div>

          {/* Upload Mode Selection */}
          <motion.div className="flex items-center gap-6 p-4 border rounded-md" variants={itemVariants}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMode" 
                value="manual"
                checked={uploadMode === 'manual'} 
                onChange={() => setUploadMode('manual')} 
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="font-medium">Gacanta ku dar (Manual)</span>
                <p className="text-xs text-gray-600">Ku dar ardayda mid mid gacanta</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMode" 
                value="excel"
                checked={uploadMode === 'excel'} 
                onChange={() => setUploadMode('excel')} 
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <span className="font-medium">Upload Excel</span>
                <p className="text-xs text-gray-600">Ku dar ardayda faylka Excel</p>
              </div>
            </label>
          </motion.div>

          {uploadMode === 'manual' ? (
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Ardayda Gacanta Lagu Darayo</h3>
                <button 
                  type="button" 
                  onClick={addRow}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <FiPlus />
                  Ku dar Arday
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                {students.map((s, idx) => (
                  <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-blue-800">Arday {idx + 1}</h4>
                      <div className="flex items-center gap-2">
                        {students.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeRow(idx)} 
                            className="p-2 rounded text-red-600 hover:bg-red-50"
                          >
                            <FiMinus />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Dhan *</label>
                        <input 
                          name="fullname" 
                          value={s.fullname} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="Magaca ardayga" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Da'da</label>
                        <input 
                          name="age" 
                          type="number" 
                          min="0" 
                          value={s.age} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="Da'da ardayga" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jinsiga</label>
                        <select 
                          name="gender" 
                          value={s.gender} 
                          onChange={(e) => handleChange(idx, e)} 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="male">Lab</option>
                          <option value="female">Dheddig</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Hooyo *</label>
                        <input 
                          name="motherNumber" 
                          value={s.motherNumber} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="0612345678" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Aabo *</label>
                        <input 
                          name="fatherNumber" 
                          value={s.fatherNumber} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="0612345679" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wadarta Lacagta</label>
                        <input 
                          name="fee.total" 
                          value={s.fee.total} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="Wadarta lacagta" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lacagta La Bixiyay</label>
                        <input 
                          name="fee.paid" 
                          value={s.fee.paid} 
                          onChange={(e) => handleChange(idx, e)} 
                          placeholder="Lacagta la bixiyay" 
                          className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Upload Faylka Excel</h3>
                    <p className="text-sm text-gray-600">Soo dejiso template-ka, buuxi, kadib upload samee</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <FiFile />
                    Soo Deji Template
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click here</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">Excel files only (XLS, XLSX)</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".xls,.xlsx,.ods,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                        onChange={handleExcelSelect} 
                        className="hidden" 
                      />
                    </label>
                    
                    <div className="flex-1">
                      {excelFile ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                          <p className="font-medium text-green-800">Faylka waa la soo geliyay!</p>
                          <p className="text-sm text-green-700">{excelFile.name}</p>
                          <p className="text-xs text-green-600">{(excelFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-yellow-800">Ma jiro wax fayl ah la soo geliyay</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Tilmaamaha:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Soo dejiso template-ka kor</li>
                      <li>• Buuxi xogta ardayda Excel-ka</li>
                      <li>• Ardayda oo dhan waxay gashaan fasalka aad kor ku dooratay</li>
                      <li>• Faylku waa inuu yahay Excel (xls, xlsx)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div className="flex justify-end gap-3 pt-6 border-t" variants={itemVariants}>
            <button 
              type="button" 
              onClick={() => navigate('/getAllStudents')} 
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Bax
            </button>
            <button 
              type="submit" 
              disabled={creatingMultiple || !selectedClassId} 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiSave />
              {creatingMultiple ? 'Kaydinayaa...' : `Kaydi ${uploadMode === 'manual' ? students.length + ' Arday' : 'Excel'}`}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateMultipleStudents;