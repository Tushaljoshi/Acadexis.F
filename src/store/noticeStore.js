const STORAGE_KEY = 'acadexis_notices';

const getStoredNotices = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredNotices = (notices) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
};

export const noticeStore = {
  getAll: () => {
    return getStoredNotices();
  },

  getByType: (type) => {
    const notices = getStoredNotices();
    return notices.filter((n) => n.type === type);
  },

  getById: (id) => {
    const notices = getStoredNotices();
    return notices.find((n) => n._id === id);
  },

  create: (data) => {
    const notices = getStoredNotices();
    const newNotice = {
      _id: `notice_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notices.push(newNotice);
    setStoredNotices(notices);
    return newNotice;
  },

  update: (id, data) => {
    const notices = getStoredNotices();
    const index = notices.findIndex((n) => n._id === id);
    if (index >= 0) {
      notices[index] = {
        ...notices[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      setStoredNotices(notices);
      return notices[index];
    }
    return null;
  },

  delete: (id) => {
    const notices = getStoredNotices().filter((n) => n._id !== id);
    setStoredNotices(notices);
    return true;
  },
};
