import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Verificar que el token de Vercel Blob esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN no está configurado");
      return NextResponse.json(
        { error: "Error de configuración del servidor (falta BLOB_READ_WRITE_TOKEN)" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const partidoId = formData.get("partidoId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    // Validación más permisiva del tipo de archivo
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo no puede superar los 10MB" },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `planillas/${partidoId || "general"}/${Date.now()}_${safeName}`;

    const blob = await put(fileName, file, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: safeName,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error?.message || "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
