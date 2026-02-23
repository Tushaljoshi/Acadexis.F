const STORAGE_KEY = 'acadexis_timetable';

const dummyClasses = [
  { _id: 'cls_1', name: '1st', sections: [{ _id: 'sec_1a', name: 'A' }, { _id: 'sec_1b', name: 'B' }] },
  { _id: 'cls_2', name: '2nd', sections: [{ _id: 'sec_2a', name: 'A' }, { _id: 'sec_2b', name: 'B' }] },
  { _id: 'cls_3', name: '3rd', sections: [{ _id: 'sec_3a', name: 'A' }, { _id: 'sec_3b', name: 'B' }] },
  { _id: 'cls_4', name: '4th', sections: [{ _id: 'sec_4a', name: 'A' }, { _id: 'sec_4b', name: 'B' }] },
  { _id: 'cls_5', name: '5th', sections: [{ _id: 'sec_5a', name: 'A' }, { _id: 'sec_5b', name: 'B' }] },
  { _id: 'cls_6', name: '6th', sections: [{ _id: 'sec_6a', name: 'A' }, { _id: 'sec_6b', name: 'B' }] },
  { _id: 'cls_7', name: '7th', sections: [{ _id: 'sec_7a', name: 'A' }, { _id: 'sec_7b', name: 'B' }] },
  { _id: 'cls_8', name: '8th', sections: [{ _id: 'sec_8a', name: 'A' }, { _id: 'sec_8b', name: 'B' }] },
  { _id: 'cls_9', name: '9th', sections: [{ _id: 'sec_9a', name: 'A' }, { _id: 'sec_9b', name: 'B' }] },
  { _id: 'cls_10', name: '10th', sections: [{ _id: 'sec_10a', name: 'A' }, { _id: 'sec_10b', name: 'B' }] },
  { _id: 'cls_11', name: '11th', sections: [{ _id: 'sec_11a', name: 'A' }, { _id: 'sec_11b', name: 'B' }] },
  { _id: 'cls_12', name: '12th', sections: [{ _id: 'sec_12a', name: 'A' }, { _id: 'sec_12b', name: 'B' }] },
];

const dummySubjects = [
  { _id: 'sub_math', name: 'Mathematics' },
  { _id: 'sub_sci', name: 'Science' },
  { _id: 'sub_eng', name: 'English' },
  { _id: 'sub_hindi', name: 'Hindi' },
  { _id: 'sub_phy', name: 'Physics' },
  { _id: 'sub_chem', name: 'Chemistry' },
  { _id: 'sub_bio', name: 'Biology' },
  { _id: 'sub_hist', name: 'History' },
  { _id: 'sub_geo', name: 'Geography' },
  { _id: 'sub_comp', name: 'Computer Science' },
  { _id: 'sub_pe', name: 'Physical Education' },
];

const dummyTeachers = [
  { _id: 'dummy_teacher_1', name: 'Mr. John Smith', email: 'teacher1@acadexis.com' },
  { _id: 'dummy_teacher_2', name: 'Ms. Sarah Johnson', email: 'teacher2@acadexis.com' },
  { _id: 'dummy_teacher_3', name: 'Mr. David Williams', email: 'teacher3@acadexis.com' },
  { _id: 'dummy_teacher_4', name: 'Ms. Emily Brown', email: 'teacher4@acadexis.com' },
  { _id: 'dummy_teacher_5', name: 'Mr. Michael Davis', email: 'teacher5@acadexis.com' },
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00'];

const getStoredTimetable = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredTimetable = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const timetableStore = {
  getClasses: () => dummyClasses,
  getSubjects: () => dummySubjects,
  getTeachers: () => dummyTeachers,

  getTimetableByClass: (classId, sectionId) => {
    const entries = getStoredTimetable();
    return entries.filter(
      (e) => e.classId === classId && e.sectionId === sectionId
    );
  },

  getTimetableByTeacher: (teacherId) => {
    const entries = getStoredTimetable();
    return entries.filter((e) => e.teacherId === teacherId);
  },

  getEntry: (classId, sectionId, day, time) => {
    const entries = getStoredTimetable();
    return entries.find(
      (e) =>
        e.classId === classId &&
        e.sectionId === sectionId &&
        e.day === day &&
        e.time === time
    );
  },

  saveEntry: (entry) => {
    const entries = getStoredTimetable();
    const existingIndex = entries.findIndex(
      (e) =>
        e.classId === entry.classId &&
        e.sectionId === entry.sectionId &&
        e.day === entry.day &&
        e.time === entry.time
    );

    const newEntry = {
      ...entry,
      id: entry.id || `tt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    setStoredTimetable(entries);
    return newEntry;
  },

  deleteEntry: (classId, sectionId, day, time) => {
    const entries = getStoredTimetable().filter(
      (e) =>
        !(e.classId === classId && e.sectionId === sectionId && e.day === day && e.time === time)
    );
    setStoredTimetable(entries);
  },

  saveBulk: (entries) => {
    const existing = getStoredTimetable();
    const classSectionKeys = new Set();
    if (entries.length > 0) {
      classSectionKeys.add(`${entries[0].classId}_${entries[0].sectionId}`);
    }

    const filtered = existing.filter((e) => {
      const key = `${e.classId}_${e.sectionId}`;
      return !classSectionKeys.has(key);
    });

    const newEntries = entries.map((e) => ({
      ...e,
      id: e.id || `tt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    }));

    setStoredTimetable([...filtered, ...newEntries]);
    return newEntries;
  },
};
