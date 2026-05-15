"use client";

import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

interface PlanillaViewerProps {
  planillaUrl?: string | null;
}

export default function PlanillaViewer({ planillaUrl }: PlanillaViewerProps) {
  if (!planillaUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-8 text-center"
      >
        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No hay planilla disponible para este partido</p>
      </motion.div>
    );
  }

  const isImage = planillaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = planillaUrl.match(/\.pdf$/i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {isImage ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src={planillaUrl}
            alt="Planilla del partido"
            className="w-full h-auto"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-primary" />
          <p className="mb-4">Planilla del partido disponible</p>
          <a
            href={planillaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            {isPdf ? "Descargar PDF" : "Ver archivo"}
          </a>
        </div>
      )}
    </motion.div>
  );
}
