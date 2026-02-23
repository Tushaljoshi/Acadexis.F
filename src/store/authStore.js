import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await authService.login(credentials);
          const { user, token } = response;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          toast.success('Login successful!');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.success('Logged out successfully');
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token) => {
        set({ token });
        localStorage.setItem('token', token);
      },

      updateProfile: async (data) => {
        try {
          const response = await authService.updateProfile(data);
          set({ user: response.user });
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        
        const userPermissions = user.permissions || [];
        return userPermissions.includes(permission) || userPermissions.includes('*');
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
