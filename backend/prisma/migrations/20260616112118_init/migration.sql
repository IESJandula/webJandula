-- CreateTable
CREATE TABLE "Noticia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "cuerpo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Centro',
    "portada" TEXT,
    "galeria" TEXT NOT NULL DEFAULT '[]',
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autor" TEXT NOT NULL,
    "autorEmail" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "motivoRechazo" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
