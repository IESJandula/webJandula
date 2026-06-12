import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    name: 'noticias',
    component: () => import('@/views/NoticiasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/noticias/nueva',
    name: 'noticia-nueva',
    component: () => import('@/views/NoticiaFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/noticias/:id/editar',
    name: 'noticia-editar',
    component: () => import('@/views/NoticiaFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/noticias',
    name: 'admin-noticias',
    component: () => import('@/views/admin/AdminNoticiasView.vue'),
    meta: { requiresAuth: true, adminOnly: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (authStore.isLoading) await authStore.initializeAuth();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) return next('/login');
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next(authStore.isAdmin ? '/admin/noticias' : '/');
  }
  if (to.meta.adminOnly && !authStore.isAdmin) return next('/');
  next();
});

export default router;
