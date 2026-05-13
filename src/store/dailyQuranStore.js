import { create } from "zustand";
import axios from "../config/axios";

export const useDailyQuranStore = create((set, get) => ({
  // State
  dailyQuranRecords: [],
  todaySessions: [],
  classSessionsByDate: [],
  classStudents: [],
  loading: false,
  error: null,

  // ✅ Test connection
  testConnection: async () => {
    try {
      const res = await axios.get("/dailyQuran/test");
      console.log("Daily Quran Test:", res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Daily Quran Connection Error:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Create daily Quran session
  createDailyQuran: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/dailyQuran/create", data);
      set((state) => ({
        dailyQuranRecords: [...state.dailyQuranRecords, res.data.data],
        loading: false,
      }));
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharka maalinlaha lama dharin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Create bulk sessions WITH DATE SUPPORT
  createBulkDailyQuran: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/dailyQuran/create/bulk", data);
      set((state) => ({
        dailyQuranRecords: [...state.dailyQuranRecords, ...res.data.data],
        loading: false,
      }));
      return { 
        success: true, 
        data: res.data.data, 
        message: res.data.message,
        errors: res.data.errors 
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharrada maalinlaha lama dhaddhin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Get today's sessions for a class
  getTodaySessions: async (classId) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/dailyQuran/today/${classId}`);
      set({ 
        todaySessions: res.data.data || [],
        loading: false 
      });
      return { success: true, data: res.data.data || [] };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharrada maanta lama soo saarin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ NEW FUNCTION: Get class sessions for a specific date
  getClassSessionsByDate: async (classId, date) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/dailyQuran/class/${classId}/date/${date}`);
      console.log("Class sessions by date response:", res.data);
      
      // Handle different response structures
      let sessions = [];
      if (res.data.data && res.data.data.sessions) {
        sessions = res.data.data.sessions; // If response has nested sessions
      } else if (res.data.data) {
        sessions = res.data.data; // If response has direct data array
      }
      
      set({ 
        classSessionsByDate: sessions,
        todaySessions: sessions, // Also set to todaySessions for compatibility
        loading: false 
      });
      
      return { 
        success: true, 
        data: sessions,
        classData: res.data.data,
        statistics: res.data.data?.statistics || res.data.statistics
      };
    } catch (error) {
      console.error("Error fetching class sessions by date:", error);
      
      // If 404, return empty array (no sessions for this date)
      if (error.response?.status === 404) {
        set({ 
          classSessionsByDate: [],
          todaySessions: [],
          loading: false 
        });
        return { success: true, data: [], message: "Ma jiro casharro taariikhdan" };
      }
      
      const errorMsg = error.response?.data?.message || "Casharrada taariikhdan lama soo saarin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Fetch students for a class
  fetchClassStudents: async (classId) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/classes/${classId}/students`);
      set({ 
        classStudents: res.data.students || [],
        loading: false 
      });
      return { success: true, students: res.data.students || [] };
    } catch (error) {
      const errorMsg = "Ardayda fasalka lama soo saarin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Update daily Quran session WITH DATE SUPPORT
  updateDailyQuran: async (id, updatedData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put(`/dailyQuran/update/${id}`, updatedData);
      set((state) => ({
        dailyQuranRecords: state.dailyQuranRecords.map((item) =>
          item._id === id ? res.data.data : item
        ),
        // Also update in sessions arrays
        todaySessions: state.todaySessions.map((item) =>
          item._id === id ? res.data.data : item
        ),
        classSessionsByDate: state.classSessionsByDate.map((item) =>
          item._id === id ? res.data.data : item
        ),
        loading: false,
      }));
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharka maalinlaha lama cusboonaysiin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Delete daily Quran session
  deleteDailyQuran: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/dailyQuran/delete/${id}`);
      set((state) => ({
        dailyQuranRecords: state.dailyQuranRecords.filter((item) => item._id !== id),
        todaySessions: state.todaySessions.filter((item) => item._id !== id),
        classSessionsByDate: state.classSessionsByDate.filter((item) => item._id !== id),
        loading: false,
      }));
      return { success: true, message: "Casharka maalinlaha waa la tirtiray" };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharka maalinlaha lama tirtir";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Get all sessions for a class (with optional date range)
  getClassSessions: async (classId, date = null) => {
    try {
      set({ loading: true, error: null });
      let url = `/dailyQuran/class/${classId}`;
      if (date) {
        url += `?date=${date}`;
      }
      const res = await axios.get(url);
      set({ loading: false });
      return { success: true, data: res.data.data || [] };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharrada lama soo saarin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Get student sessions with date range
  getStudentSessions: async (studentId, startDate = null, endDate = null) => {
    try {
      set({ loading: true, error: null });
      let url = `/dailyQuran/student/${studentId}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await axios.get(url);
      set({ loading: false });
      return { 
        success: true, 
        data: res.data.data,
        statistics: res.data.statistics 
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Casharrada ardayga lama soo saarin";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ✅ Clear error
  clearError: () => set({ error: null }),

  // ✅ Clear students
  clearClassStudents: () => set({ classStudents: [] }),

  // ✅ Clear today sessions
  clearTodaySessions: () => set({ todaySessions: [] }),

  // ✅ NEW: Clear date sessions
  clearDateSessions: () => set({ classSessionsByDate: [] }),

  // ✅ NEW: Reset records for new date
  resetForNewDate: () => set({ 
    todaySessions: [],
    classSessionsByDate: [],
    classStudents: [] // Optional: clear students too
  }),
}));