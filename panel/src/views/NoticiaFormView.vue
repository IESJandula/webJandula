<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">{{ isEditing ? 'Editar noticia' : 'Proponer noticia' }}</h1>
      <router-link to="/" class="btn btn-secondary">← Volver</router-link>
    </div>

    <form class="card form-card" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Título *</label>
        <input v-model="form.titulo" class="form-control" placeholder="Título de la noticia" required />
      </div>

      <div class="form-group">
        <label>Subtítulo / Resumen</label>
        <input v-model="form.subtitulo" class="form-control" placeholder="Breve descripción (opcional)" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Categoría</label>
          <select v-model="form.categoria" class="form-control">
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Imagen de portada</label>
        <div class="upload-area" @click="triggerPortada" @dragover.prevent @drop.prevent="dropPortada">
          <img v-if="form.portada" :src="form.portada" class="portada-preview" alt="portada" />
          <div v-else class="upload-placeholder">
            <span>🖼</span>
            <p>Haz clic o arrastra una imagen</p>
          </div>
          <input ref="portadaInput" type="file" accept="image/*" style="display:none" @change="handlePortada" />
        </div>
        <button v-if="form.portada" type="button" class="btn btn-secondary" style="margin-top:8px" @click="form.portada = null">Eliminar portada</button>
      </div>

      <div class="form-group">
        <label>Contenido *</label>
        <RichEditor v-model="form.cuerpo" />
      </div>

      <div class="form-group">
        <label>Galería de imágenes adicionales</label>
        <div class="galeria-grid">
          <div v-for="(img, i) in form.galeria" :key="i" class="galeria-item">
            <img :src="img" alt="" />
            <button type="button" class="galeria-remove" @click="form.galeria.splice(i, 1)">×</button>
          </div>
          <button type="button" class="galeria-add" @click="triggerGaleria">+ Añadir</button>
          <input ref="galeriaInput" type="file" accept="image/*" multiple style="display:none" @change="handleGaleria" />
        </div>
      </div>

      <div class="form-actions">
        <router-link to="/" class="btn btn-secondary">Cancelar</router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Enviando...' : isEditing ? 'Guardar cambios' : 'Enviar para revisión' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RichEditor from '@/components/RichEditor.vue';
import { crearNoticia, editarNoticia, subirImagen, getMisNoticias } from '@/services/api';

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);

const categorias = ['Centro', 'Proyectos', 'Deportes', 'Cultura', 'Formación', 'Otras'];

const form = reactive({
  titulo: '',
  subtitulo: '',
  categoria: 'Centro',
  portada: null,
  cuerpo: '',
  galeria: [],
});

const submitting = ref(false);
const portadaInput = ref(null);
const galeriaInput = ref(null);

onMounted(async () => {
  if (isEditing.value) {
    const { data } = await getMisNoticias();
    const noticia = data.data.find((n) => String(n.id) === String(route.params.id));
    if (noticia) {
      form.titulo = noticia.titulo;
      form.subtitulo = noticia.subtitulo ?? '';
      form.categoria = noticia.categoria;
      form.portada = noticia.imagen?.[0]?.url ?? null;
      form.cuerpo = noticia.cuerpo;
      form.galeria = (noticia.galeria ?? []).map((g) => g.url ?? g);
    }
  }
});

function triggerPortada() { portadaInput.value?.click(); }
function triggerGaleria() { galeriaInput.value?.click(); }

async function handlePortada(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const { data } = await subirImagen(file);
  form.portada = data.url;
  e.target.value = '';
}

async function dropPortada(e) {
  const file = e.dataTransfer.files?.[0];
  if (!file) return;
  const { data } = await subirImagen(file);
  form.portada = data.url;
}

async function handleGaleria(e) {
  for (const file of e.target.files) {
    const { data } = await subirImagen(file);
    form.galeria.push(data.url);
  }
  e.target.value = '';
}

async function handleSubmit() {
  if (!form.cuerpo.trim() || form.cuerpo === '<p></p>') {
    alert('El contenido de la noticia es obligatorio');
    return;
  }
  submitting.value = true;
  try {
    const payload = { ...form };
    if (isEditing.value) {
      await editarNoticia(route.params.id, payload);
    } else {
      await crearNoticia(payload);
    }
    router.push('/');
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar la noticia');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.form-card { max-width: 780px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.upload-area {
  border: 2px dashed var(--seneca-borde);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--seneca-transition);
}
.upload-area:hover { border-color: var(--seneca-azul-medio); }
.upload-placeholder { text-align: center; color: var(--seneca-gris-medio); padding: 24px; }
.upload-placeholder span { font-size: 32px; }
.upload-placeholder p { margin: 8px 0 0; font-size: 13px; }
.portada-preview { width: 100%; max-height: 200px; object-fit: cover; }
.galeria-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.galeria-item { position: relative; }
.galeria-item img { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; }
.galeria-remove {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px;
  background: var(--seneca-peligro); color: white;
  border: none; border-radius: 50%; cursor: pointer;
  font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center;
}
.galeria-add {
  width: 80px; height: 60px;
  border: 2px dashed var(--seneca-borde);
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--seneca-gris-medio);
  transition: var(--seneca-transition);
}
.galeria-add:hover { border-color: var(--seneca-azul-medio); color: var(--seneca-azul-medio); }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
</style>
