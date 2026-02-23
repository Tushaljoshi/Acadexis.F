const TEACHER_ATTENDANCE_KEY = 'acadexis_teacher_attendance';
const STUDENT_ATTENDANCE_KEY = 'acadexis_student_attendance';

export const TEACHER_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
};

const getStored = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const setStored = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const attendanceStore = {
  getTeacherAttendance: (date) => {
    const all = getStored(TEACHER_ATTENDANCE_KEY);
    return all[date] || [];
  },

  saveTeacherAttendance: (date, records) => {
    const all = getStored(TEACHER_ATTENDANCE_KEY);
    all[date] = records;
    setStored(TEACHER_ATTENDANCE_KEY, all);
  },

  getStudentAttendance: (classId, sectionId, date) => {
    const all = getStored(STUDENT_ATTENDANCE_KEY);
    const key = `${classId}_${sectionId}_${date}`;
    return all[key] || [];
  },

  saveStudentAttendance: (classId, sectionId, date, records) => {
    const all = getStored(STUDENT_ATTENDANCE_KEY);
    const key = `${classId}_${sectionId}_${date}`;
    all[key] = records;
    setStored(STUDENT_ATTENDANCE_KEY, all);
  },
};
