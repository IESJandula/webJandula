<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">📰</div>
      <h1 class="login-title">Panel de Noticias</h1>
      <p class="login-subtitle">IES Jándula – Acceso con cuenta del centro</p>

      <button class="btn btn-google" :disabled="loading" @click="handleLogin">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {{ loading ? 'Entrando...' : 'Acceder con Google (@g.educaand.es)' }}
      </button>

      <p v-if="error" class="login-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebaseConfig';
import { useAuthStore } from '@/stores/auth';
import { login } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    const { data } = await login(token);

    authStore.user = {
      isAuthenticated: true,
      email: data.email,
      name: data.nombre,
      role: data.rol,
      loading: false,
    };

    router.push(data.rol === 'admin' ? '/admin/noticias' : '/');
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo iniciar sesión. Usa tu cuenta del centro.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--seneca-azul-principal) 0%, var(--seneca-azul-medio) 100%);
  padding: 16px;
}
.login-card {
  background: var(--seneca-blanco);
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: var(--seneca-sombra-fuerte);
  max-width: 400px;
  width: 100%;
}
.login-logo { font-size: 48px; margin-bottom: 12px; }
.login-title { font-size: 24px; font-weight: 700; color: var(--seneca-azul-principal); margin: 0 0 8px; }
.login-subtitle { font-size: 14px; color: var(--seneca-gris-medio); margin: 0 0 32px; }
.btn-google {
  width: 100%;
  padding: 12px 20px;
  background: var(--seneca-blanco);
  color: var(--seneca-gris-muy-oscuro);
  border: 2px solid var(--seneca-borde);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: var(--seneca-transition);
}
.btn-google:hover:not(:disabled) { border-color: var(--seneca-azul-principal); box-shadow: var(--seneca-sombra-suave); }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
.login-error {
  margin-top: 16px;
  padding: 10px 14px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  font-size: 13px;
}
</style>
