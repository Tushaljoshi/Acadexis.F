import { timetableStore } from './timetableStore';

const STORAGE_KEY = 'acadexis_teachers';

const getStoredTeachers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredTeachers = (teachers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
};

// Initialize with dummy data from timetable teachers if empty
const initializeTeachers = () => {
  const stored = getStoredTeachers();
  if (stored.length === 0) {
    const baseTeachers = timetableStore.getTeachers
      ? timetableStore.getTeachers()
      : [];

    const dummyTeachers = baseTeachers.map((t) => ({
      _id: t._id,
      name: t.name,
      email: t.email,
      phone: '',
      status: 'active',
    }));

    setStoredTeachers(dummyTeachers);
    return dummyTeachers;
  }
  return stored;
};

export const teacherStore = {
  getAll: () => {
    return getStoredTeachers();
  },

  getById: (id) => {
    const teachers = getStoredTeachers();
    return teachers.find((t) => t._id === id);
  },

  create: (data) => {
    const teachers = getStoredTeachers();
    const newTeacher = {
      _id: data._id || `teacher_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: data.status || 'active',
      ...data,
    };
    teachers.push(newTeacher);
    setStoredTeachers(teachers);
    return newTeacher;
  },

  update: (id, data) => {
    const teachers = getStoredTeachers();
    const index = teachers.findIndex((t) => t._id === id);
    if (index >= 0) {
      teachers[index] = {
        ...teachers[index],
        ...data,
      };
      setStoredTeachers(teachers);
      return teachers[index];
    }
    return null;
  },

  delete: (id) => {
    const teachers = getStoredTeachers().filter((t) => t._id !== id);
    setStoredTeachers(teachers);
    return true;
  },
};

// Initialize on first load
initializeTeachers();

