const API = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:1337';

export type NoticiaCard = {
    id: string;
    title: string;
    summary: string;
    date: string;
    image: string;
    category: string;
    link: string;
};

export type NoticiaDetail = NoticiaCard & {
    body: string;
    author: string;
    poster: string | null;
    gallery: string[];
};

type UnknownRecord = Record<string, unknown>;

function extractTextFromNode(node: unknown): string {
    if (typeof node === 'string') return node;
    if (!node || typeof node !== 'object') return '';

    const n = node as UnknownRecord;
    const ownText = typeof n.text === 'string' ? n.text : '';

    if (!Array.isArray(n.children)) return ownText;
    const childrenText = n.children.map(extractTextFromNode).join('');
    return `${ownText}${childrenText}`;
}

function markdownToHtml(markdown: string): string {
    const normalized = markdown
        .replace(/\r\n/g, '\n')
        // Normalize inline markdown-like quote/list markers that come in one line.
        .replace(/\s+>\s*/g, '\n> ')
        .replace(/\s+-\s+/g, '\n- ')
        .trim();
    if (!normalized) return '';

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    // Preserve a small whitelist of inline HTML tags used by editorial content.
    const preserveInlineHtml = (value: string): string =>
        value
            .replace(/&lt;u&gt;/gi, '<u>')
            .replace(/&lt;\/u&gt;/gi, '</u>')
            .replace(/&lt;br\s*\/?&gt;/gi, '<br>');

    const inline = (value: string) =>
        preserveInlineHtml(
            escapeHtml(value)
            .replace(/!\[(.*?)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async" class="rounded-xl my-4" />')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        );

    const blocks = normalized.split(/\n\s*\n/).filter(Boolean);

    return blocks
        .map((block) => {
            const lines = block.split('\n').map((line) => line.trimEnd());

            // Heading (#, ##, ###)
            if (/^#{1,3}\s+/.test(lines[0])) {
                const level = Math.min((lines[0].match(/^#+/)?.[0].length ?? 1), 3);
                const content = lines[0].replace(/^#{1,3}\s+/, '');
                return `<h${level}>${inline(content)}</h${level}>`;
            }

            // Unordered list
            if (lines.every((line) => /^[-*]\s+/.test(line))) {
                const items = lines
                    .map((line) => line.replace(/^[-*]\s+/, ''))
                    .map((item) => `<li>${inline(item)}</li>`)
                    .join('');
                return `<ul>${items}</ul>`;
            }

            // Ordered list
            if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
                const items = lines
                    .map((line) => line.replace(/^\d+[.)]\s+/, ''))
                    .map((item) => `<li>${inline(item)}</li>`)
                    .join('');
                return `<ol>${items}</ol>`;
            }

            // Quote block
            if (lines.every((line) => /^>\s?/.test(line))) {
                const quote = lines
                    .map((line) => line.replace(/^>\s?/, ''))
                    .map((line) => inline(line))
                    .join('<br>');
                return `<blockquote><p>${quote}</p></blockquote>`;
            }

            // Regular paragraph
            const paragraph = lines.map((line) => inline(line)).join('<br>');
            return `<p>${paragraph}</p>`;
        })
        .join('');
}

function richTextToHtml(value: unknown): string {
    if (typeof value === 'string') {
        const asHtml = value.trim();

        // Only bypass markdown conversion if the payload is already structured HTML.
        // Inline tags (like <u>) should still go through markdown parsing.
        const isStructuredHtml = /<(p|h[1-6]|ul|ol|li|blockquote|article|section|div|figure|img|a|br)\b/i.test(asHtml);
        if (isStructuredHtml) return asHtml;

        // Otherwise treat as markdown/plain text from Strapi rich text.
        return markdownToHtml(asHtml);
    }

    // Strapi rich text blocks fallback: convert blocks to simple paragraphs.
    if (Array.isArray(value)) {
        const paragraphs = value
            .map((block) => extractTextFromNode(block).trim())
            .filter(Boolean)
            .map((text) => `<p>${text}</p>`);

        return paragraphs.join('');
    }

    return '';
}

function getImageUrl(item: UnknownRecord): string {
    const imagen = item.imagen as unknown;

    // Strapi v5 can return media as a direct array/object
    if (Array.isArray(imagen) && imagen.length > 0) {
        const first = imagen[0] as UnknownRecord;
        const url = first?.url as string | undefined;
        if (url) return url.startsWith('http') ? url : `${API}${url}`;
    }

    if (imagen && typeof imagen === 'object' && !Array.isArray(imagen)) {
        const imgObj = imagen as UnknownRecord;
        const directUrl = imgObj.url as string | undefined;
        if (directUrl) return directUrl.startsWith('http') ? directUrl : `${API}${directUrl}`;
    }

    // Strapi v4 style fallback
    const v4 = item.imagen as { data?: Array<{ attributes?: { url?: string } }> } | undefined;
    const v4Url = v4?.data?.[0]?.attributes?.url;
    if (v4Url) return v4Url.startsWith('http') ? v4Url : `${API}${v4Url}`;

    return '/images/bg-hero.webp';
}

function getGalleryUrls(item: UnknownRecord): string[] {
    const gallery = item.galeria as unknown;

    // Strapi v5 direct media array
    if (Array.isArray(gallery)) {
        return gallery
            .map((media) => {
                const entry = media as UnknownRecord;
                const url = entry?.url as string | undefined;
                return url ? (url.startsWith('http') ? url : `${API}${url}`) : null;
            })
            .filter((url): url is string => Boolean(url));
    }

    // Strapi v5 single object fallback
    if (gallery && typeof gallery === 'object') {
        const g = gallery as UnknownRecord;
        const directUrl = g.url as string | undefined;
        if (directUrl) return [directUrl.startsWith('http') ? directUrl : `${API}${directUrl}`];
    }

    // Strapi v4 fallback
    const v4 = item.galeria as { data?: Array<{ attributes?: { url?: string } }> } | undefined;
    if (Array.isArray(v4?.data)) {
        return v4.data
            .map((m) => m?.attributes?.url)
            .filter((url): url is string => Boolean(url))
            .map((url) => (url.startsWith('http') ? url : `${API}${url}`));
    }

    return [];
}

function getPosterUrl(item: UnknownRecord): string | null {
    const candidate = item.cartel as unknown;

    if (Array.isArray(candidate) && candidate.length > 0) {
        const first = candidate[0] as UnknownRecord;
        const url = first?.url as string | undefined;
        if (url) return url.startsWith('http') ? url : `${API}${url}`;
    }

    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        const obj = candidate as UnknownRecord;
        const url = obj.url as string | undefined;
        if (url) return url.startsWith('http') ? url : `${API}${url}`;

        const v4Data = obj.data as Array<{ attributes?: { url?: string } }> | undefined;
        const v4Url = v4Data?.[0]?.attributes?.url;
        if (v4Url) return v4Url.startsWith('http') ? v4Url : `${API}${v4Url}`;
    }

    return null;
}

function getItemId(item: UnknownRecord): string {
    const documentId = item.documentId as string | undefined;
    if (documentId) return documentId;

    const id = item.id as string | number | undefined;
    if (id !== undefined && id !== null) return String(id);

    return 'sin-id';
}

function mapToCard(item: UnknownRecord): NoticiaCard {
    const id = getItemId(item);

    return {
        id,
        title: (item.titulo as string) ?? 'Sin titulo',
        summary:
            ((item.subtitulo as string) ??
                (item.cuerpo as string) ??
                'Consulta la noticia completa para conocer todos los detalles.')
                .toString()
                .slice(0, 180),
        date: (item.fecha as string) ?? new Date().toISOString().slice(0, 10),
        image: getImageUrl(item),
        category: (item.categoria as string) ?? 'Centro',
        link: `/noticias/${id}`,
    };
}

function mapToDetail(item: UnknownRecord): NoticiaDetail {
    const card = mapToCard(item);
    const bodyHtml =
        richTextToHtml(item.cuerpo) ||
        `<p>${(item.subtitulo as string) ?? 'Contenido no disponible para esta noticia.'}</p>`;
    const gallery = getGalleryUrls(item);
    const poster = getPosterUrl(item);

    return {
        ...card,
        body: bodyHtml,
        author: (item.autor as string) ?? 'IES Jandula',
        poster,
        gallery,
    };
}

export async function getNoticias(limit = 5): Promise<NoticiaCard[]> {
    try {
        const query = new URLSearchParams({
            'sort[0]': 'fecha:desc',
            'pagination[limit]': String(limit),
            'populate': '*',
        });

        const res = await fetch(`${API}/api/noticias?${query.toString()}`);
        if (!res.ok) return [];

        const json = (await res.json()) as {
            data?: Array<UnknownRecord>;
        };

        const data = Array.isArray(json?.data) ? json.data : [];
        return data.map(mapToCard);
    } catch {
        return [];
    }
}

export async function getNoticiasIds(limit = 200): Promise<string[]> {
    try {
        const query = new URLSearchParams({
            'sort[0]': 'fecha:desc',
            'pagination[limit]': String(limit),
            'fields[0]': 'id',
            'fields[1]': 'documentId',
        });

        const res = await fetch(`${API}/api/noticias?${query.toString()}`);
        if (!res.ok) return [];

        const json = (await res.json()) as {
            data?: Array<UnknownRecord>;
        };

        const data = Array.isArray(json?.data) ? json.data : [];
        return data.map(getItemId);
    } catch {
        return [];
    }
}

export async function getNoticiaById(id: string): Promise<NoticiaDetail | null> {
    try {
        const queryByDocument = new URLSearchParams({
            'filters[documentId][$eq]': id,
            'populate': '*',
        });

        const byDocument = await fetch(`${API}/api/noticias?${queryByDocument.toString()}`);
        if (byDocument.ok) {
            const json = (await byDocument.json()) as { data?: Array<UnknownRecord> };
            const item = Array.isArray(json?.data) ? json.data[0] : undefined;
            if (item) return mapToDetail(item);
        }

        const queryById = new URLSearchParams({
            'filters[id][$eq]': id,
            'populate': '*',
        });

        const byId = await fetch(`${API}/api/noticias?${queryById.toString()}`);
        if (!byId.ok) return null;

        const json = (await byId.json()) as { data?: Array<UnknownRecord> };
        const item = Array.isArray(json?.data) ? json.data[0] : undefined;

        return item ? mapToDetail(item) : null;
    } catch {
        return null;
    }
}
