import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSICIONES_VALIDAS = [
  "1", "2", "4", "5",
  "Arquero", "Boya",
  "Defensa", "Centro", "Wing",
  "Marcador de boya",
];

/**
 * Divide un string corrupto como "4Marcador de boya" en ["4", "Marcador de boya"]
 * usando las posiciones válidas como tokens de separación.
 */
function splitCorruptedPosition(raw: string): string[] {
  const result: string[] = [];
  let remaining = raw;

  while (remaining.length > 0) {
    // Buscamos la posición válida que coincida al inicio del string restante
    let found = false;
    for (const pos of POSICIONES_VALIDAS) {
      if (remaining.startsWith(pos)) {
        result.push(pos);
        remaining = remaining.slice(pos.length);
        found = true;
        break;
      }
    }
    if (!found) {
      // No reconocemos este token, lo dejamos como está y cortamos
      result.push(remaining);
      break;
    }
  }

  return result;
}

async function fixPosiciones() {
  try {
    console.log('🔍 Buscando jugadores con posiciones corruptas...\n');

    const jugadores = await prisma.jugador.findMany({
      orderBy: { nombre: 'asc' },
    });

    let fixCount = 0;

    for (const jugador of jugadores) {
      const original = [...jugador.posiciones];
      const cleaned: string[] = [];

      for (const pos of jugador.posiciones) {
        // Si la posición ya es válida, la dejamos igual
        if (POSICIONES_VALIDAS.includes(pos)) {
          cleaned.push(pos);
        } else {
          // Intenta dividir concatenaciones
          const split = splitCorruptedPosition(pos);
          cleaned.push(...split);
        }
      }

      const originalStr = original.join(", ");
      const cleanedStr = cleaned.join(", ");

      if (originalStr !== cleanedStr) {
        console.log(`✏️  ${jugador.nombre}:`);
        console.log(`   Antes: [${originalStr}]`);
        console.log(`   Desp:  [${cleanedStr}]\n`);

        await prisma.jugador.update({
          where: { id: jugador.id },
          data: { posiciones: cleaned },
        });
        fixCount++;
      }
    }

    if (fixCount === 0) {
      console.log('✅ Todas las posiciones están correctas.');
    } else {
      console.log(`✅ ${fixCount} jugador(es) actualizados.`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixPosiciones();
