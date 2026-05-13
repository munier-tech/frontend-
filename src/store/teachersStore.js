import { create } from "zustand";
import axios from "../config/axios";
import toast from "react-hot-toast";

const useTeachersStore = create((set, get) => ({
  // ===========================
  // STATE
  // ===========================
  teachers: [],
  selectedTeacher: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  // ===========================
  // FETCH ALL TEACHERS
  // ===========================
  fetchTeachers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/teachers/get", {
        withCredentials: true,
      });

      set({
        teachers: response.data.teachers || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error(error.response?.data?.message || "fadlan khadka iska hubi");
      set({ loading: false });
    }
  },

  // ===========================
  // FETCH TEACHER BY ID
  // ===========================
  fetchTeacherById: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/teachers/getId/${id}`, {
        withCredentials: true,
      });

      set({
        selectedTeacher: response.data.teacher,
        loading: false,
      });

      return { success: true, teacher: response.data.teacher };
    } catch (error) {
      toast.error(error.response?.data?.message || "fadlan khadka iska hubi");
      set({ loading: false });
      return { success: false };
    }
  },

  // ===========================
  // CREATE TEACHER (FILE UPLOAD)
  // ===========================
  createTeacher: async (teacherData) => {
    set({ creating: true });
    try {
      const response = await axios.post("/teachers/create", teacherData, {
        withCredentials: true,
      }); // Do NOT set Content-Type manually

      set((state) => ({
        teachers: [...state.teachers, response.data.teacher],
        creating: false,
      }));

      toast.success("macalinka si guul leh ayaa loo abuuray");
      return { success: true, teacher: response.data.teacher };
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast.error(error.response?.data?.message || "fadlan khadka iska hubi");
      set({ creating: false });
      return { success: false };
    }
  },

  // ===========================
  // UPDATE TEACHER (FILE UPLOAD)
  // ===========================
  updateTeacher: async (id, teacherData) => {
    set({ updating: true });
    try {
      const response = await axios.put(`/teachers/update/${id}`, teacherData, {
        withCredentials: true,
      });

      const updatedTeacher = response.data.teacher;

      set((state) => ({
        teachers: state.teachers.map((t) =>
          t._id === id ? updatedTeacher : t
        ),
        selectedTeacher:
          state.selectedTeacher?._id === id
            ? updatedTeacher
            : state.selectedTeacher,
        updating: false,
      }));

      toast.success("macalinka si guul leh ayaa loo cusboonaysiiyay");
      return { success: true, teacher: updatedTeacher };
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error(error.response?.data?.message || "fadlan khadka iska hubi");
      set({ updating: false });
      return { success: false };
    }
  },

  // ===========================
  // DELETE TEACHER
  // ===========================
  deleteTeacher: async (id) => {
    set({ deleting: true });
    try {
      await axios.delete(`/teachers/delete/${id}`, { withCredentials: true });

      set((state) => ({
        teachers: state.teachers.filter((t) => t._id !== id),
        selectedTeacher:
          state.selectedTeacher?._id === id ? null : state.selectedTeacher,
        deleting: false,
      }));

      toast.success("Teacher deleted successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "fadlan khadka iska hubi");
      set({ deleting: false });
      return { success: false };
    }
  },

  // ===========================
  // UTILITIES
  // ===========================
  clearSelectedTeacher: () => set({ selectedTeacher: null }),

  searchTeachers: (query) => {
    const { teachers } = get();
    return teachers.filter(
      (teacher) =>
        teacher.name?.toLowerCase().includes(query.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(query.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(query.toLowerCase()) ||
        teacher.number?.includes(query)
    );
  },

  getTeachersBySubject: (subject) => {
    const { teachers } = get();
    return teachers.filter((t) => t.subject === subject);
  },

  getTotalTeachers: () => {
    const { teachers } = get();
    return teachers.length;
  },

  getTeachersStatistics: () => {
    const { teachers } = get();
    const subjects = [...new Set(teachers.map((t) => t.subject).filter(Boolean))];

    return {
      total: teachers.length,
      subjects: subjects.length,
      active: teachers.filter((t) => t.isActive !== false).length,
      inactive: teachers.filter((t) => t.isActive === false).length,
    };
  },
}));

export default useTeachersStore;
