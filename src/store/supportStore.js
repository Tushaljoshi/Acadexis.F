const STORAGE_KEY = 'acadexis_support';

const getStoredQueries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredQueries = (queries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
};

export const supportStore = {
  getAll: () => {
    return getStoredQueries();
  },

  getByUser: (userId) => {
    const queries = getStoredQueries();
    return queries.filter((q) => q.userId === userId);
  },

  getById: (id) => {
    const queries = getStoredQueries();
    return queries.find((q) => q._id === id);
  },

  create: (data) => {
    const queries = getStoredQueries();
    const newQuery = {
      _id: `support_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };
    queries.push(newQuery);
    setStoredQueries(queries);
    return newQuery;
  },

  addResponse: (queryId, responseData) => {
    const queries = getStoredQueries();
    const index = queries.findIndex((q) => q._id === queryId);
    if (index >= 0) {
      const response = {
        id: `resp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        ...responseData,
        createdAt: new Date().toISOString(),
      };
      if (!queries[index].responses) {
        queries[index].responses = [];
      }
      queries[index].responses.push(response);
      queries[index].status = 'responded';
      queries[index].updatedAt = new Date().toISOString();
      setStoredQueries(queries);
      return response;
    }
    return null;
  },

  updateStatus: (id, status) => {
    const queries = getStoredQueries();
    const index = queries.findIndex((q) => q._id === id);
    if (index >= 0) {
      queries[index].status = status;
      queries[index].updatedAt = new Date().toISOString();
      setStoredQueries(queries);
      return queries[index];
    }
    return null;
  },

  delete: (id) => {
    const queries = getStoredQueries().filter((q) => q._id !== id);
    setStoredQueries(queries);
    return true;
  },
};
