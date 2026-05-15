import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const comentarios = await prisma.comentario.findMany({
      where: { partidoId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comentarios);
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
    const comentario = await prisma.comentario.create({
      data: {
        partidoId: body.partidoId,
        autorNombre: body.autorNombre,
        texto: body.texto,
        minuto: body.minuto || 0,
      },
    });
    return NextResponse.json(comentario);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}
