<template>
  <div class="tiptap-editor">
    <div class="tiptap-toolbar">
      <!-- Texto -->
      <div class="grupo">
        <button type="button" title="Negrita" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><b>N</b></button>
        <button type="button" title="Cursiva" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><i>C</i></button>
        <button type="button" title="Subrayado" :class="{ 'is-active': editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()"><u>S</u></button>
        <button type="button" title="Resaltar en amarillo" :class="{ 'is-active': editor?.isActive('highlight') }" @click="editor?.chain().focus().toggleHighlight().run()">🖍</button>
        <span class="grupo-etiqueta">Texto</span>
        <button
          v-for="c in coloresTexto"
          :key="c.valor"
          type="button"
          class="muestra"
          :style="{ background: c.valor }"
          :title="'Color de texto: ' + c.nombre"
          @click="editor?.chain().focus().setColor(c.valor).run()"
        ></button>
        <button type="button" title="Quitar el color del texto" @click="editor?.chain().focus().unsetColor().run()">✕</button>
      </div>

      <!-- Estructura -->
      <div class="grupo">
        <button type="button" title="Título de sección" :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
        <button type="button" title="Subtítulo" :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
        <button type="button" title="Lista de puntos" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()">• Lista</button>
        <button type="button" title="Lista numerada" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()">1. Lista</button>
        <button type="button" title="Cita" :class="{ 'is-active': editor?.isActive('blockquote') }" @click="editor?.chain().focus().toggleBlockquote().run()">❝</button>
      </div>

      <!-- Alineación -->
      <div class="grupo">
        <button type="button" title="Alinear a la izquierda" :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }" @click="editor?.chain().focus().setTextAlign('left').run()">⇤</button>
        <button type="button" title="Centrar" :class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }" @click="editor?.chain().focus().setTextAlign('center').run()">≡</button>
        <button type="button" title="Alinear a la derecha" :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }" @click="editor?.chain().focus().setTextAlign('right').run()">⇥</button>
      </div>

      <!-- Insertar -->
      <div class="grupo">
        <button type="button" title="Enlace" @click="addLink">🔗</button>
        <button type="button" title="Insertar imagen" @click="triggerImageUpload">🖼</button>
        <button type="button" title="Insertar una tabla de 3x3 con cabecera" @click="insertarTabla">▦ Tabla</button>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleImageFile" />
      </div>

      <!-- Herramientas de tabla: aparecen solo con el cursor dentro de una -->
      <div v-if="enTabla" class="grupo grupo-tabla">
        <span class="grupo-etiqueta">Tabla</span>
        <button type="button" title="Añadir columna a la derecha" @click="editor?.chain().focus().addColumnAfter().run()">+Col</button>
        <button type="button" title="Quitar la columna" @click="editor?.chain().focus().deleteColumn().run()">−Col</button>
        <button type="button" title="Añadir fila debajo" @click="editor?.chain().focus().addRowAfter().run()">+Fila</button>
        <button type="button" title="Quitar la fila" @click="editor?.chain().focus().deleteRow().run()">−Fila</button>
        <button type="button" title="Unir o separar las celdas seleccionadas" @click="editor?.chain().focus().mergeOrSplit().run()">Unir</button>
        <button type="button" title="Convertir la celda en cabecera" @click="editor?.chain().focus().toggleHeaderCell().run()">Cabecera</button>

        <span class="grupo-etiqueta">Color de celda</span>
        <button
          v-for="c in coloresCelda"
          :key="c.valor"
          type="button"
          class="muestra"
          :style="{ background: c.valor }"
          :title="c.nombre"
          @click="pintarCelda(c.valor)"
        ></button>
        <button type="button" title="Quitar el color de la celda" @click="pintarCelda(null)">✕</button>

        <button type="button" class="peligro" title="Borrar la tabla entera" @click="editor?.chain().focus().deleteTable().run()">Borrar tabla</button>
      </div>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { subirImagen } from '@/services/api';

const props = defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);

/**
 * TipTap no guarda por su cuenta el color de fondo de las celdas, y las tablas
 * del centro (horarios de examenes, calendarios) lo usan para distinguir
 * bloques. Se anade el atributo a mano para que sobreviva al guardar y al
 * volver a abrir la noticia.
 */
const celdaConColor = (base) => base.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => el.style.backgroundColor || null,
        renderHTML: (attrs) =>
          attrs.backgroundColor ? { style: 'background-color: ' + attrs.backgroundColor } : {},
      },
    };
  },
});

// Con fondos oscuros hace falta texto claro, como en los horarios que venia
// publicando el centro. Sin esto la celda azul quedaba ilegible.
const coloresTexto = [
  { nombre: 'Negro', valor: '#0f172a' },
  { nombre: 'Gris', valor: '#64748b' },
  { nombre: 'Blanco', valor: '#ffffff' },
  { nombre: 'Azul', valor: '#1d4ed8' },
  { nombre: 'Rojo', valor: '#b91c1c' },
];

const coloresCelda = [
  { nombre: 'Gris', valor: '#e2e8f0' },
  { nombre: 'Azul', valor: '#dbeafe' },
  { nombre: 'Verde', valor: '#dcfce7' },
  { nombre: 'Amarillo', valor: '#fef9c3' },
  { nombre: 'Rojo', valor: '#fee2e2' },
  { nombre: 'Azul del centro', valor: '#1e3a8a' },
];

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    Link.configure({ openOnClick: false }),
    Underline,
    Highlight,
    // TextStyle es el soporte que necesita Color para guardarse en el HTML.
    TextStyle,
    Color,
    // La alineacion se aplica a parrafos, titulares y celdas de tabla.
    TextAlign.configure({ types: ['heading', 'paragraph', 'tableCell', 'tableHeader'] }),
    Table.configure({ resizable: true }),
    TableRow,
    celdaConColor(TableHeader),
    celdaConColor(TableCell),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML());
  },
});

const enTabla = computed(() => editor.value?.isActive('table') ?? false);

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false);
  }
});

onBeforeUnmount(() => editor.value?.destroy());

function insertarTabla() {
  editor.value?.chain().focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}

function pintarCelda(color) {
  const tipo = editor.value?.isActive('tableHeader') ? 'tableHeader' : 'tableCell';
  editor.value?.chain().focus().updateAttributes(tipo, { backgroundColor: color }).run();
}

function addLink() {
  const url = prompt('URL del enlace:');
  if (url) editor.value?.chain().focus().setLink({ href: url }).run();
}

function triggerImageUpload() {
  fileInput.value?.click();
}

async function handleImageFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const { data } = await subirImagen(file);
    editor.value?.chain().focus().setImage({ src: data.url }).run();
  } catch {
    alert('No se pudo subir la imagen. Inténtalo de nuevo.');
  }
  e.target.value = '';
}
</script>

<style scoped>
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.grupo {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  padding-right: 10px;
  border-right: 1px solid #dde3e9;
}

.grupo:last-child {
  border-right: 0;
}

/* Las herramientas de tabla ocupan su propia fila: son muchas y si van
   mezcladas con el resto la barra se vuelve ilegible. */
.grupo-tabla {
  flex-basis: 100%;
  border-right: 0;
  border-top: 1px solid #dde3e9;
  padding-top: 8px;
  margin-top: 2px;
}

.grupo-etiqueta {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7b8b;
  margin: 0 2px 0 6px;
}

.muestra {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #c8d2dc;
  border-radius: 4px;
  cursor: pointer;
}

.peligro {
  color: #b91c1c;
  margin-left: auto;
}

/* Aspecto de las tablas DENTRO del editor, para que se parezca a lo que
   se vera publicado. */
.tiptap-editor :deep(.ProseMirror table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  table-layout: fixed;
  overflow: hidden;
}

.tiptap-editor :deep(.ProseMirror td),
.tiptap-editor :deep(.ProseMirror th) {
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
  vertical-align: top;
  position: relative;
}

.tiptap-editor :deep(.ProseMirror th) {
  background: #f1f5f9;
  font-weight: 600;
}

.tiptap-editor :deep(.ProseMirror .selectedCell::after) {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(37, 99, 235, 0.16);
  pointer-events: none;
}

.tiptap-editor :deep(.ProseMirror .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2563eb;
  pointer-events: none;
}
</style>
