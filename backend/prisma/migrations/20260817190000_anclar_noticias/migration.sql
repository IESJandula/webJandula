-- Anclar noticias: las marcadas como fijadas aparecen al principio de la web
-- pública hasta que un administrador las desancla.
ALTER TABLE "Noticia" ADD COLUMN "fijada" BOOLEAN NOT NULL DEFAULT false;

-- El campo "orden" pasa a significar "orden entre las noticias ancladas".
-- Se normaliza a 0 porque los valores heredados del reordenamiento anterior
-- harían que noticias NO ancladas se colocasen por orden en lugar de por fecha.
UPDATE "Noticia" SET "orden" = 0;
