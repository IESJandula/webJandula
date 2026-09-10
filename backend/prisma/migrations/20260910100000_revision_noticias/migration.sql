-- Cambios propuestos por el autor sobre una noticia que ya esta publicada.
--
-- Antes, editar una noticia publicada cambiaba al momento lo que se ve en la
-- web. Ahora esos cambios se guardan aparte y no llegan al publico hasta que
-- un administrador los aprueba; mientras tanto, en la web sigue la version
-- aprobada.
--
-- "revision" guarda un JSON con titulo, subtitulo, cuerpo, categoria, portada
-- y galeria. Las columnas admiten nulos, asi que las noticias existentes se
-- quedan como estan: sin cambios pendientes.
ALTER TABLE "Noticia" ADD COLUMN "revision" TEXT;
ALTER TABLE "Noticia" ADD COLUMN "revisionFecha" DATETIME;
ALTER TABLE "Noticia" ADD COLUMN "revisionMotivo" TEXT;
