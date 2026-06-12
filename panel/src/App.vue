<template>
  <div class="page-container">
    <AppHeader v-if="showHeader" />
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const showHeader = computed(() => route.name !== 'login');

onMounted(() => authStore.initializeAuth());
</script>
