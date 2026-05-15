import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GEBA_PARTIDO_ID = 'db9edaed-e711-413b-8570-ae12e133bc05';

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...');
    console.log(`💾 Conservando partido GEBA (ID: ${GEBA_PARTIDO_ID})`);

    // 1. Borrar todos los PartidoJugador (stats) de partidos que NO sean GEBA
    const deletedStats = await prisma.partidoJugador.deleteMany({
      where: {
        partidoId: { not: GEBA_PARTIDO_ID },
      },
    });
    console.log(`✅ Borrados ${deletedStats.count} registros de estadísticas`);

    // 2. Borrar todos los Comentarios de partidos que NO sean GEBA
    const deletedComments = await prisma.comentario.deleteMany({
      where: {
        partidoId: { not: GEBA_PARTIDO_ID },
      },
    });
    console.log(`✅ Borrados ${deletedComments.count} comentarios`);

    // 3. Borrar todos los Partidos excepto GEBA
    const deletedPartidos = await prisma.partido.deleteMany({
      where: {
        id: { not: GEBA_PARTIDO_ID },
      },
    });
    console.log(`✅ Borrados ${deletedPartidos.count} partidos`);

    // 4. Borrar todos los Jugadores que no tengan stats en el partido de GEBA
    // Primero obtenemos los IDs de jugadores que están en el partido GEBA
    const jugadoresEnGeba = await prisma.partidoJugador.findMany({
      where: { partidoId: GEBA_PARTIDO_ID },
      select: { jugadorId: true },
    });
    const jugadoresIds = jugadoresEnGeba.map((j) => j.jugadorId);

    const deletedJugadores = await prisma.jugador.deleteMany({
      where: {
        id: { notIn: jugadoresIds },
      },
    });
    console.log(`✅ Borrados ${deletedJugadores.count} jugadores`);

    console.log('🎉 Limpieza completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
