import React, { useState, useRef } from 'react';
import { GraduationCap, Upload, X, User, FileText, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useTeachersStore from '../../store/teachersStore';
import { motion } from 'framer-motion';

const CreateTeachers = ({ onClose }) => {
  const { createTeacher } = useTeachersStore();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    subject: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileInputRef = useRef(null);
  const certInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfilePicture(reader.result); // Base64 string
        setPreviewImage(reader.result);
      } else {
        setCertificate(reader.result); // Base64 string
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.number || !formData.email || !formData.subject) {
      toast.error('Fadlan buuxi goobaha loo baahan yahay');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send JSON instead of FormData
      const teacherPayload = {
        ...formData,
        profilePicture, // Base64 string or null
        certificate     // Base64 string or null
      };

      await createTeacher(teacherPayload);
      toast.success('Macallinka si guul leh ayaa loo abuuray');
      onClose?.();
    } catch (error) {
      console.error('Khalad markii la abuurnayay macallinka:', error);
      toast.error(error.response?.data?.message || 'Khalad ayaa dhacay markii la abuurayay macallinka');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (type) => {
    if (type === 'profile') {
      setProfilePicture(null);
      setPreviewImage(null);
      if (profileInputRef.current) profileInputRef.current.value = '';
    } else {
      setCertificate(null);
      if (certInputRef.current) certInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25 }}
      className="max-w-4xl mx-auto mt-10 mb-20 bg-white rounded-xl shadow-2xl overflow-y-auto"
      style={{ minHeight: '80vh' }}
    >
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white z-10 p-6 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Ku Dar Macallin Cusub</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white hover:bg-opacity-20" title="Xir">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Magaca Buuxa</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Number */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lambarka Macallinka</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Iimaylka</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Maadada</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* FILE UPLOADS */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Sawirka Macallinka</label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {previewImage ? (
                  <div className="relative">
                    <img src={previewImage} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                    <button type="button" onClick={() => removeFile('profile')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <input type="file" ref={profileInputRef} accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="hidden" id="profilePicture" />
                <label htmlFor="profilePicture" className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" /> {profilePicture ? 'Beddel Sawir' : 'Soo rar Sawir'}
                </label>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG (Ugu badnaan 5MB)</p>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Shahaadada (PDF/Sawir)</label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {certificate ? (
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                      <FileText className="w-10 h-10 text-blue-400" />
                    </div>
                    <button type="button" onClick={() => removeFile('certificate')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <input type="file" ref={certInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'certificate')} className="hidden" id="certificate" />
                <label htmlFor="certificate" className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" /> {certificate ? 'Beddel Shahaado' : 'Soo rar Shahaado'}
                </label>
                <p className="mt-2 text-xs text-gray-500">PDF, JPG (Ugu badnaan 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700">Jooji</button>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center" disabled={isSubmitting}>
            {isSubmitting ? 'Diiwaan gelin...' : <><Save className="w-4 h-4 mr-2" />Keydi Macallinka</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateTeachers;
