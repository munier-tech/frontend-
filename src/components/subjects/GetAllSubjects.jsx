import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiBookOpen, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useSubjectStore } from "../../store/subjectsStore";

const GetAllSubjects = () => {
  const {
    subjects,
    getAllSubjects,
    deleteSubject,
    updateSubject,
    isLoading,
    error,
    successMessage,
    clearMessages,
  } = useSubjectStore();

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    getAllSubjects();
  }, [getAllSubjects]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearMessages();
    }
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [successMessage, error, clearMessages]);

  const handleEditClick = (subject) => {
    if (!subject?._id) return;

    setEditId(subject._id);
    setEditData({
      name: subject.name || "",
      code: subject.code || "",
    });
  };

  const handleUpdate = async () => {
    if (!editData.name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      await updateSubject(editId, {
        name: editData.name,
        code: editData.code || "",
      });

      await getAllSubjects();

      setEditId(null);
      setEditData({ name: "", code: "" });
    } catch {
      toast.error("Failed to update subject");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this subject?")) {
      await deleteSubject(id);
      await getAllSubjects();
    }
  };

  // ✅ Safe subjects array
  const safeSubjects = (subjects || []).filter(
    (subject) => subject && subject._id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold flex items-center text-gray-800 mb-4">
        <FiBookOpen className="mr-2 text-indigo-600" />
        Maareynta Mawduucyada
      </h2>

      {isLoading ? (
        <div className="text-center text-gray-500 py-20">
          Loading subjects...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-[50rem] min-h-32 bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {safeSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No subjects found.
                  </td>
                </tr>
              ) : (
                safeSubjects.map((subject) => (
                  <tr
                    key={subject._id}
                    className="border-t hover:bg-gray-50"
                  >
                    {/* ✅ Editable Subject Name */}
                    <td className="px-4 py-2">
                      {editId === subject._id ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              name: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        subject.name
                      )}
                    </td>

                    {/* ✅ Editable Code */}
                    <td className="px-4 py-2">
                      {editId === subject._id ? (
                        <input
                          value={editData.code}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              code: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        subject.code || "-"
                      )}
                    </td>

                    {/* ✅ Actions */}
                    <td className="px-4 py-2 text-right">
                      {editId === subject._id ? (
                        <div className="space-x-2">
                          <button
                            onClick={handleUpdate}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FiSave className="inline" /> Save
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditData({ name: "", code: "" });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FiX className="inline" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEdit className="inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="inline" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetAllSubjects;
