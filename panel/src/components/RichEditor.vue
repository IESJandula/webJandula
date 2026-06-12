<template>
  <div class="tiptap-editor">
    <div class="tiptap-toolbar">
      <button type="button" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><b>N</b></button>
      <button type="button" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><i>C</i></button>
      <button type="button" :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <button type="button" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()">• Lista</button>
      <button type="button" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()">1. Lista</button>
      <button type="button" @click="addLink">🔗 Enlace</button>
      <button type="button" @click="triggerImageUpload">🖼 Imagen</button>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleImageFile" />
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { subirImagen } from '@/services/api';

const props = defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    Link.configure({ openOnClick: false }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false);
  }
});

onBeforeUnmount(() => editor.value?.destroy());

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
    alert('Error al subir la imagen');
  }
  e.target.value = '';
}
</script>
