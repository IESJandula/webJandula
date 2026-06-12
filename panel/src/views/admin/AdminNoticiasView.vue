<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Administración de noticias</h1>
    </div>

    <!-- Tabs de filtro -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: filtro === tab.value }"
        @click="cambiarFiltro(tab.value)"
      >
        {{ tab.label }}
        <span v-if="conteo[tab.value]" class="tab-badge">{{ conteo[tab.value] }}</span>
      </button>
    </div>

    <div v-if="loading" class="empty-state"><span class="spinner"></span></div>

    <div v-else-if="noticias.length === 0" class="empty-state">
      <p>No hay noticias {{ filtro !== 'todas' ? `en estado "${filtro}"` : '' }}</p>
    </div>

    <!-- Tabla -->
    <div v-else class="table-wrapper">
      <p v-if="filtro === 'publicada'" class="drag-hint">
        ↕ Arrastra las filas para cambiar el orden en la web pública
      </p>
      <table>
        <thead>
          <tr>
            <th v-if="filtro === 'publicada'" style="width:36px"></th>
            <th>Título</th>
            <th>Autor</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody ref="tbodyRef">
          <tr v-for="n in noticias" :key="n.id" :data-id="n.id">
            <td v-if="filtro === 'publicada'" class="drag-handle" title="Arrastrar para reordenar">⠿</td>
            <td>
              <strong>{{ n.titulo }}</strong>
              <p v-if="n.estado === 'rechazada' && n.motivoRechazo" class="motivo">✗ {{ n.motivoRechazo }}</p>
            </td>
            <td>{{ n.autor }}</td>
            <td>{{ n.categoria }}</td>
            <td>{{ formatFecha(n.fecha) }}</td>
            <td><span class="badge" :class="`badge-${n.estado}`">{{ n.estado }}</span></td>
            <td>
              <div class="actions">
                <button v-if="n.estado === 'pendiente'" class="btn btn-success" @click="aprobar(n)">✓ Aprobar</button>
                <button v-if="n.estado === 'pendiente'" class="btn btn-danger" @click="abrirRechazo(n)">✗ Rechazar</button>
                <button v-if="n.estado === 'publicada'" class="btn btn-warning" @click="despublicar(n)">Despublicar</button>
                <router-link :to="`/noticias/${n.id}/editar`" class="btn btn-secondary">Editar</router-link>
                <button class="btn btn-danger" @click="eliminar(n)">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de rechazo -->
    <div v-if="rechazoModal.visible" class="modal-overlay" @click.self="rechazoModal.visible = false">
      <div class="modal-card">
        <h3>Rechazar noticia</h3>
        <p style="font-size:14px; color: var(--seneca-gris-oscuro)">
          "{{ rechazoModal.noticia?.titulo }}"
        </p>
        <div class="form-group">
          <label>Motivo del rechazo</label>
          <textarea v-model="rechazoModal.motivo" class="form-control" rows="3" placeholder="Explica brevemente el motivo..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="rechazoModal.visible = false">Cancelar</button>
          <button class="btn btn-danger" @click="confirmarRechazo">Confirmar rechazo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import Sortable from 'sortablejs';
import {
  getAdminNoticias, aprobarNoticia, rechazarNoticia,
  despublicarNoticia, eliminarNoticia, reordenarNoticias,
} from '@/services/api';

const tabs = [
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Publicadas', value: 'publicada' },
  { label: 'Rechazadas', value: 'rechazada' },
  { label: 'Todas', value: 'todas' },
];

const filtro = ref('pendiente');
const todas = ref([]);
const loading = ref(true);
const tbodyRef = ref(null);
let sortable = null;

const noticias = computed(() =>
  filtro.value === 'todas' ? todas.value : todas.value.filter((n) => n.estado === filtro.value)
);

const conteo = computed(() => ({
  pendiente: todas.value.filter((n) => n.estado === 'pendiente').length,
  publicada: todas.value.filter((n) => n.estado === 'publicada').length,
  rechazada: todas.value.filter((n) => n.estado === 'rechazada').length,
  todas: todas.value.length,
}));

const rechazoModal = reactive({ visible: false, noticia: null, motivo: '' });

async function cargar() {
  loading.value = true;
  try {
    const { data } = await getAdminNoticias();
    todas.value = data.data;
  } finally {
    loading.value = false;
  }
}

onMounted(cargar);

// Drag & drop solo en tab publicadas
watch([filtro, noticias], async () => {
  await nextTick();
  if (sortable) { sortable.destroy(); sortable = null; }
  if (filtro.value === 'publicada' && tbodyRef.value) {
    sortable = Sortable.create(tbodyRef.value, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: async () => {
        const ids = [...tbodyRef.value.querySelectorAll('tr[data-id]')].map((tr) =>
          tr.getAttribute('data-id')
        );
        await reordenarNoticias(ids);
      },
    });
  }
}, { flush: 'post' });

function cambiarFiltro(val) { filtro.value = val; }

async function aprobar(n) {
  await aprobarNoticia(n.id);
  await cargar();
}

function abrirRechazo(n) {
  rechazoModal.noticia = n;
  rechazoModal.motivo = '';
  rechazoModal.visible = true;
}

async function confirmarRechazo() {
  await rechazarNoticia(rechazoModal.noticia.id, rechazoModal.motivo);
  rechazoModal.visible = false;
  await cargar();
}

async function despublicar(n) {
  if (!confirm(`¿Despublicar "${n.titulo}"? Pasará a pendiente.`)) return;
  await despublicarNoticia(n.id);
  await cargar();
}

async function eliminar(n) {
  if (!confirm(`¿Eliminar "${n.titulo}" permanentemente?`)) return;
  await eliminarNoticia(n.id);
  await cargar();
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.drag-hint { font-size: 13px; color: var(--seneca-gris-medio); margin-bottom: 10px; }
.drag-handle { cursor: grab; font-size: 18px; color: var(--seneca-gris-claro); text-align: center; user-select: none; }
.drag-handle:active { cursor: grabbing; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--seneca-peligro); color: white;
  border-radius: 10px; font-size: 11px; font-weight: 700;
  padding: 1px 7px; margin-left: 6px;
}
.tab.active .tab-badge { background: rgba(255,255,255,0.35); }
.motivo { font-size: 11px; color: var(--seneca-peligro); margin: 4px 0 0; font-style: italic; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 16px;
}
.modal-card {
  background: var(--seneca-blanco);
  border-radius: 12px;
  padding: 28px;
  max-width: 480px; width: 100%;
  box-shadow: var(--seneca-sombra-fuerte);
}
.modal-card h3 { margin: 0 0 8px; color: var(--seneca-azul-principal); }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
</style>
