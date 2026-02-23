const STORAGE_KEY = 'acadexis_classes';

const getStoredClasses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredClasses = (classes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
};

// Initialize with dummy data if empty
const initializeClasses = () => {
  const stored = getStoredClasses();
  if (stored.length === 0) {
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
    setStoredClasses(dummyClasses);
    return dummyClasses;
  }
  return stored;
};

export const classStore = {
  getAll: () => {
    return getStoredClasses();
  },

  create: (className) => {
    const classes = getStoredClasses();
    const newClass = {
      _id: `cls_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: className,
      sections: [],
    };
    classes.push(newClass);
    setStoredClasses(classes);
    return newClass;
  },

  addSection: (classId, sectionName) => {
    const classes = getStoredClasses();
    const classIndex = classes.findIndex((c) => c._id === classId);
    if (classIndex >= 0) {
      const newSection = {
        _id: `sec_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: sectionName,
      };
      if (!classes[classIndex].sections) {
        classes[classIndex].sections = [];
      }
      classes[classIndex].sections.push(newSection);
      setStoredClasses(classes);
      return newSection;
    }
    return null;
  },

  delete: (classId) => {
    const classes = getStoredClasses().filter((c) => c._id !== classId);
    setStoredClasses(classes);
    return true;
  },

  getById: (classId) => {
    const classes = getStoredClasses();
    return classes.find((c) => c._id === classId);
  },
};

// Initialize on first load
initializeClasses();
