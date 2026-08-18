<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Administración de noticias</h1>
      <router-link to="/noticias/nueva" class="btn btn-primary">+ Nueva noticia</router-link>
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
        📌 Ancla una noticia para que se quede al principio de la web pública hasta que la desancles.
        <template v-if="numFijadas > 1">
          ↕ Arrastra las ancladas para ordenarlas entre sí.
        </template>
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
          <tr v-for="n in noticias" :key="n.id" :data-id="n.id" :class="{ 'fila-anclada': n.fijada }">
            <td v-if="filtro === 'publicada'" class="drag-handle" :title="n.fijada ? 'Arrastrar para ordenar entre las ancladas' : 'Solo se pueden ordenar las noticias ancladas'">
              <span v-if="n.fijada">⠿</span>
            </td>
            <td>
              <span v-if="n.fijada" class="badge badge-anclada" title="Anclada al principio de la web pública">📌 Anclada</span>
              <button class="titulo-enlace" title="Ver la noticia completa" @click="verNoticia(n)">
                {{ n.titulo }}
              </button>
              <p v-if="n.estado === 'rechazada' && n.motivoRechazo" class="motivo">✗ {{ n.motivoRechazo }}</p>
            </td>
            <td>{{ n.autor }}</td>
            <td>{{ n.categoria }}</td>
            <td>{{ formatFecha(n.fecha) }}</td>
            <td><span class="badge" :class="`badge-${n.estado}`">{{ n.estado }}</span></td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary" title="Leer la noticia antes de decidir" @click="verNoticia(n)">👁 Ver</button>
                <button v-if="n.estado === 'pendiente'" class="btn btn-success" @click="aprobar(n)">✓ Aprobar</button>
                <button v-if="n.estado === 'pendiente'" class="btn btn-danger" @click="abrirRechazo(n)">✗ Rechazar</button>
                <button
                  v-if="n.estado === 'publicada' && !n.fijada"
                  class="btn btn-secondary"
                  title="Fijar al principio de la web pública"
                  @click="anclar(n)"
                >📌 Anclar</button>
                <button
                  v-if="n.estado === 'publicada' && n.fijada"
                  class="btn btn-anclada"
                  title="Dejar de fijarla: volverá a ordenarse por fecha"
                  @click="desanclar(n)"
                >Desanclar</button>
                <button v-if="n.estado === 'publicada'" class="btn btn-warning" @click="despublicar(n)">Despublicar</button>
                <router-link :to="`/noticias/${n.id}/editar`" class="btn btn-secondary">Editar</router-link>
                <button class="btn btn-danger" @click="eliminar(n)">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Visor de la noticia. Los datos ya vienen en el listado del panel
         (titulo, cuerpo, imagenes), asi que no hace falta pedir nada mas.
         Sirve para leer una noticia pendiente ANTES de aprobarla. -->
    <div v-if="visor.visible" class="modal-overlay" @click.self="cerrarVisor">
      <div class="visor-card">
        <header class="visor-cabecera">
          <div class="visor-meta">
            <span class="badge" :class="`badge-${visor.noticia.estado}`">{{ visor.noticia.estado }}</span>
            <span>{{ visor.noticia.categoria }}</span>
            <span>·</span>
            <span>{{ formatFecha(visor.noticia.fecha) }}</span>
            <span>·</span>
            <span>{{ visor.noticia.autor }}</span>
          </div>
          <button class="visor-cerrar" aria-label="Cerrar" @click="cerrarVisor">✕</button>
        </header>

        <div class="visor-cuerpo">
          <h2 class="visor-titulo">{{ visor.noticia.titulo }}</h2>
          <p v-if="visor.noticia.subtitulo" class="visor-entradilla">{{ visor.noticia.subtitulo }}</p>

          <img
            v-if="portadaVisor"
            :src="portadaVisor"
            :alt="`Portada de ${visor.noticia.titulo}`"
            class="visor-portada"
          />

          <!-- El cuerpo es HTML del editor o de la importacion. Solo lo ve el
               profesorado autenticado del centro, no visitantes. -->
          <div class="visor-texto" v-html="visor.noticia.cuerpo"></div>

          <div v-if="galeriaVisor.length" class="visor-galeria">
            <img v-for="(g, i) in galeriaVisor" :key="i" :src="g" :alt="`Imagen ${i + 1} de la galería`" />
          </div>
        </div>

        <footer class="visor-pie">
          <div class="actions">
            <button v-if="visor.noticia.estado === 'pendiente'" class="btn btn-success" @click="aprobarDesdeVisor">✓ Aprobar</button>
            <button v-if="visor.noticia.estado === 'pendiente'" class="btn btn-danger" @click="rechazarDesdeVisor">✗ Rechazar</button>
            <router-link :to="`/noticias/${visor.noticia.id}/editar`" class="btn btn-secondary">Editar</router-link>
          </div>
          <button class="btn btn-secondary" @click="cerrarVisor">Cerrar</button>
        </footer>
      </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import Sortable from 'sortablejs';
import {
  getAdminNoticias, aprobarNoticia, rechazarNoticia,
  despublicarNoticia, eliminarNoticia, reordenarNoticias,
  anclarNoticia, desanclarNoticia, urlImagen,
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

const numFijadas = computed(() => noticias.value.filter((n) => n.fijada).length);

const rechazoModal = reactive({ visible: false, noticia: null, motivo: '' });

// Visor de la noticia
const visor = reactive({ visible: false, noticia: {} });

const portadaVisor = computed(() => urlImagen(visor.noticia?.imagen?.[0]?.url));
const galeriaVisor = computed(() =>
  (visor.noticia?.galeria ?? []).map((g) => urlImagen(g.url ?? g)).filter(Boolean)
);

function verNoticia(n) {
  visor.noticia = n;
  visor.visible = true;
  // Evita que la pagina de detras siga desplazandose con la rueda.
  document.body.style.overflow = 'hidden';
}

function cerrarVisor() {
  visor.visible = false;
  document.body.style.overflow = '';
}

async function aprobarDesdeVisor() {
  const n = visor.noticia;
  cerrarVisor();
  await aprobar(n);
}

function rechazarDesdeVisor() {
  const n = visor.noticia;
  cerrarVisor();
  abrirRechazo(n);
}

// Cerrar con la tecla Escape, como cualquier ventana modal.
function alPulsarTecla(e) {
  if (e.key === 'Escape' && visor.visible) cerrarVisor();
}

async function cargar() {
  loading.value = true;
  try {
    const { data } = await getAdminNoticias();
    todas.value = data.data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  cargar();
  window.addEventListener('keydown', alPulsarTecla);
});

onUnmounted(() => {
  window.removeEventListener('keydown', alPulsarTecla);
  // Si se sale de la pagina con el visor abierto, devolver el scroll.
  document.body.style.overflow = '';
});

// Drag & drop solo en tab publicadas
watch([filtro, noticias], async () => {
  await nextTick();
  if (sortable) { sortable.destroy(); sortable = null; }
  if (filtro.value === 'publicada' && tbodyRef.value) {
    sortable = Sortable.create(tbodyRef.value, {
      handle: '.drag-handle',
      // Solo las ancladas se reordenan a mano: el resto va por fecha.
      draggable: 'tr.fila-anclada',
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

async function anclar(n) {
  await anclarNoticia(n.id);
  await cargar();
}

async function desanclar(n) {
  await desanclarNoticia(n.id);
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

/* Titulo de la tabla como enlace: invita a abrir el visor */
.titulo-enlace {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: var(--seneca-azul, #14507a);
  text-align: left;
  cursor: pointer;
}
.titulo-enlace:hover { text-decoration: underline; }

/* Visor de la noticia */
.visor-card {
  background: #fff;
  border-radius: 12px;
  width: min(760px, 94vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(15, 40, 70, 0.25);
}
.visor-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #e6ebf0;
  background: #f7f9fb;
}
.visor-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5b6b7b;
}
.visor-cerrar {
  background: none;
  border: 0;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #5b6b7b;
  padding: 4px 8px;
  border-radius: 6px;
}
.visor-cerrar:hover { background: #e6ebf0; }
.visor-cuerpo {
  padding: 24px 28px;
  overflow-y: auto;
}
.visor-titulo {
  margin: 0 0 10px;
  font-size: 26px;
  line-height: 1.2;
  color: #0f2d45;
}
.visor-entradilla {
  margin: 0 0 18px;
  font-size: 16px;
  color: #5b6b7b;
}
.visor-portada {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 20px;
  background: #eef2f5;
}
.visor-texto {
  font-size: 15px;
  line-height: 1.7;
  color: #33414f;
  max-width: 62ch;
}
.visor-texto :deep(p) { margin: 0 0 1em; }
.visor-texto :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}
.visor-texto :deep(a) { color: #1d4ed8; }
.visor-texto :deep(h1),
.visor-texto :deep(h2),
.visor-texto :deep(h3) { color: #0f2d45; line-height: 1.25; margin: 1.4em 0 0.5em; }
.visor-galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 20px;
}
.visor-galeria img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  background: #eef2f5;
}
.visor-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid #e6ebf0;
  background: #f7f9fb;
}

/* Noticias ancladas */
.fila-anclada { background: #fffbeb; }
.badge-anclada {
  display: inline-block; background: #fbbf24; color: #451a03;
  border-radius: 10px; font-size: 10px; font-weight: 700;
  padding: 2px 7px; margin-right: 6px; vertical-align: middle;
}
.btn-anclada { background: #fbbf24; color: #451a03; }
.btn-anclada:hover { background: #f59e0b; }

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
