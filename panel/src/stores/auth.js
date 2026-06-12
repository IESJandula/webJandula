import { defineStore } from 'pinia';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { login } from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: { isAuthenticated: false, email: null, name: null, role: null, loading: true },
  }),

  getters: {
    isAuthenticated: (s) => s.user.isAuthenticated,
    userEmail: (s) => s.user.email,
    userName: (s) => s.user.name,
    userRole: (s) => s.user.role,
    isAdmin: (s) => s.user.role === 'admin',
    isLoading: (s) => s.user.loading,
  },

  actions: {
    async initializeAuth() {
      this.user.loading = true;

      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              const { data } = await login(token);
              this.user = {
                isAuthenticated: true,
                email: data.email,
                name: data.nombre,
                role: data.rol,
                loading: false,
              };
            } catch {
              this.clearUser();
            }
          } else {
            this.clearUser();
          }
          resolve();
        });
      });
    },

    clearUser() {
      this.user = { isAuthenticated: false, email: null, name: null, role: null, loading: false };
    },

    async logout() {
      await signOut(auth);
      this.clearUser();
    },
  },
});
