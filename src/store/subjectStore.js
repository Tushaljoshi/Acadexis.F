const STORAGE_KEY = 'acadexis_subjects';

const getStoredSubjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredSubjects = (subjects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
};

// Initialize with dummy data if empty
const initializeSubjects = () => {
  const stored = getStoredSubjects();
  if (stored.length === 0) {
    const dummySubjects = [
      { _id: 'sub_math', name: 'Mathematics', code: 'MATH', description: 'Mathematics subject' },
      { _id: 'sub_sci', name: 'Science', code: 'SCI', description: 'Science subject' },
      { _id: 'sub_eng', name: 'English', code: 'ENG', description: 'English language' },
      { _id: 'sub_hindi', name: 'Hindi', code: 'HIN', description: 'Hindi language' },
      { _id: 'sub_phy', name: 'Physics', code: 'PHY', description: 'Physics subject' },
      { _id: 'sub_chem', name: 'Chemistry', code: 'CHEM', description: 'Chemistry subject' },
      { _id: 'sub_bio', name: 'Biology', code: 'BIO', description: 'Biology subject' },
      { _id: 'sub_hist', name: 'History', code: 'HIST', description: 'History subject' },
      { _id: 'sub_geo', name: 'Geography', code: 'GEO', description: 'Geography subject' },
      { _id: 'sub_comp', name: 'Computer Science', code: 'CS', description: 'Computer Science' },
      { _id: 'sub_pe', name: 'Physical Education', code: 'PE', description: 'Physical Education' },
    ];
    setStoredSubjects(dummySubjects);
    return dummySubjects;
  }
  return stored;
};

export const subjectStore = {
  getAll: () => {
    return getStoredSubjects();
  },

  create: (data) => {
    const subjects = getStoredSubjects();
    const newSubject = {
      _id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
    };
    subjects.push(newSubject);
    setStoredSubjects(subjects);
    return newSubject;
  },

  update: (id, data) => {
    const subjects = getStoredSubjects();
    const index = subjects.findIndex((s) => s._id === id);
    if (index >= 0) {
      subjects[index] = {
        ...subjects[index],
        ...data,
      };
      setStoredSubjects(subjects);
      return subjects[index];
    }
    return null;
  },

  delete: (id) => {
    const subjects = getStoredSubjects().filter((s) => s._id !== id);
    setStoredSubjects(subjects);
    return true;
  },

  getById: (id) => {
    const subjects = getStoredSubjects();
    return subjects.find((s) => s._id === id);
  },
};

// Initialize on first load
initializeSubjects();
