<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-brand">
        <span class="header-logo">📰</span>
        <span class="header-title">Panel Noticias – IES Jándula</span>
      </div>

      <nav class="header-nav">
        <router-link to="/" class="nav-link">Mis noticias</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/noticias" class="nav-link">
          Administración
        </router-link>
      </nav>

      <div class="header-user">
        <span class="user-name">{{ authStore.userName }}</span>
        <span class="badge" :class="authStore.isAdmin ? 'badge-publicada' : 'badge-pendiente'">
          {{ authStore.isAdmin ? 'Admin' : 'Profesor' }}
        </span>
        <button class="btn btn-secondary btn-sm" @click="authStore.logout()">Salir</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<style scoped>
.header {
  background: var(--seneca-azul-principal);
  color: var(--seneca-blanco);
  box-shadow: var(--seneca-sombra-media);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.header-brand { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.header-logo { font-size: 20px; }
.header-title { font-size: 15px; font-weight: 700; }
.header-nav { display: flex; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 12px;
  border-radius: 6px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: var(--seneca-transition);
}
.nav-link:hover, .nav-link.router-link-active {
  background: rgba(255,255,255,0.15);
  color: var(--seneca-blanco);
}
.header-user { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.user-name { font-size: 13px; font-weight: 500; }
.btn-sm { padding: 5px 10px; font-size: 12px; }
</style>
