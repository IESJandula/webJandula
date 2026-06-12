<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Mis noticias</h1>
      <router-link to="/noticias/nueva" class="btn btn-primary">+ Nueva noticia</router-link>
    </div>

    <div v-if="loading" class="empty-state"><span class="spinner"></span></div>

    <div v-else-if="noticias.length === 0" class="empty-state">
      <p>Aún no has propuesto ninguna noticia.</p>
      <router-link to="/noticias/nueva" class="btn btn-primary" style="margin-top:16px">
        Proponer mi primera noticia
      </router-link>
    </div>

    <div v-else class="noticias-grid">
      <div v-for="n in noticias" :key="n.id" class="card noticia-card">
        <div class="noticia-card-top">
          <img v-if="n.imagen?.[0]?.url" :src="n.imagen[0].url" class="noticia-thumb" alt="" />
          <div class="noticia-info">
            <span class="badge" :class="`badge-${n.estado}`">{{ n.estado }}</span>
            <h3 class="noticia-titulo">{{ n.titulo }}</h3>
            <p class="noticia-meta">{{ n.categoria }} · {{ formatFecha(n.fecha) }}</p>
            <p v-if="n.estado === 'rechazada' && n.motivoRechazo" class="motivo-rechazo">
              ✗ {{ n.motivoRechazo }}
            </p>
          </div>
        </div>
        <div class="actions" style="margin-top:12px">
          <router-link
            v-if="n.estado !== 'publicada'"
            :to="`/noticias/${n.id}/editar`"
            class="btn btn-secondary"
          >Editar</router-link>
          <span v-else class="text-muted">Publicada — edición bloqueada</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMisNoticias } from '@/services/api';

const noticias = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await getMisNoticias();
    noticias.value = data.data;
  } finally {
    loading.value = false;
  }
});

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
</script>

<style scoped>
.noticias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.noticia-card-top { display: flex; gap: 14px; }
.noticia-thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.noticia-info { flex: 1; min-width: 0; }
.noticia-titulo { font-size: 15px; font-weight: 600; margin: 6px 0 4px; color: var(--seneca-azul-principal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.noticia-meta { font-size: 12px; color: var(--seneca-gris-medio); margin: 0; }
.motivo-rechazo { font-size: 12px; color: var(--seneca-peligro); margin: 6px 0 0; font-style: italic; }
.text-muted { font-size: 13px; color: var(--seneca-gris-medio); }
</style>
