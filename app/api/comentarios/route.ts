import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partidoId = searchParams.get("partidoId");

    if (!partidoId) {
      return NextResponse.json(
        { error: "Se requiere partidoId" },
        { status: 400 }
      );
    }

    // TODO: Reemplazar con Prisma cuando la DB esté configurada
    // const comentarios = await prisma.comentario.findMany({...})
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Reemplazar con Prisma cuando la DB esté configurada
    // const comentario = await prisma.comentario.create({...})
    return NextResponse.json({ id: Date.now().toString(), ...body });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}
