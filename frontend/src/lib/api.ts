const API = import.meta.env.PUBLIC_API_URL;

export async function getNoticias() {
    const res = await fetch(`${API}/api/noticias?populate=*`);
    if (!res.ok) throw new Error("Error al cargar noticias");
    return res.json();
}
