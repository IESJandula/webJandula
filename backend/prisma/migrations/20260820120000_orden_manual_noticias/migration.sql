-- El orden manual pasa a aplicarse a TODAS las noticias publicadas, no solo a
-- las ancladas: en el panel se arrastra cualquier fila.
--
-- Hasta ahora las no ancladas tenian "orden" = 0 y se colocaban por fecha. Si
-- se dejan asi, todas empatan a 0 y el arrastre no tendria de donde partir:
-- hay que convertir ese orden implicito (ancladas primero, luego por fecha
-- descendente) en numeros explicitos.
CREATE TEMP TABLE "orden_inicial" AS
SELECT
  "id",
  ROW_NUMBER() OVER (
    ORDER BY "fijada" DESC, "orden" ASC, "fecha" DESC, "id" DESC
  ) - 1 AS "pos"
FROM "Noticia"
WHERE "estado" = 'publicada';

UPDATE "Noticia"
SET "orden" = (
  SELECT "pos" FROM "orden_inicial" WHERE "orden_inicial"."id" = "Noticia"."id"
)
WHERE "id" IN (SELECT "id" FROM "orden_inicial");

DROP TABLE "orden_inicial";
