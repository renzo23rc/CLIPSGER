"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Users, Calendar, Trophy, Trash2, MessageSquare, Edit, Save, X } from "lucide-react";
import {
  createPartido,
  createJugador,
  createPartidoJugador,
  getPartidos,
  getJugadores,
  updatePartido,
  deletePartido,
  updateJugador,
  deleteJugador,
  getPartidoJugadorStats,
  getComentarios,
  deleteComentario,
} from "@/lib/actions";

interface Partido {
  id: string;
  rival: string;
  fecha: string | Date;
  torneo: string;
  resultado: string | null;
  youtubeUrl: string | null;
  planillaUrl: string | null;
  createdAt: string | Date;
}

interface Jugador {
  id: string;
  nombre: string;
  posiciones: string[];
}

interface Comentario {
  id: string;
  partidoId: string;
  autorNombre: string;
  texto: string;
  minuto: number;
  createdAt: string;
  partido: {
    rival: string;
    fecha: string;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState("partidos");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ger2026") {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="text-center mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground mt-1">Waterpolo GER</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ingresar
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const sections = [
    { id: "partidos", label: "Gestionar Partidos", icon: Calendar },
    { id: "jugadores", label: "Gestionar Jugadores", icon: Users },
    { id: "stats", label: "Cargar Stats", icon: Trophy },
    { id: "comentarios", label: "Moderar Comentarios", icon: MessageSquare },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            {activeSection === "partidos" && <GestionarPartidosForm />}
            {activeSection === "jugadores" && <GestionarJugadoresForm />}
            {activeSection === "stats" && <CargarStatsForm />}
            {activeSection === "comentarios" && <ModerarComentariosForm />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GestionarPartidosForm() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rival: "",
    fecha: "",
    torneo: "",
    resultado: "",
    youtubeUrl: "",
    planillaUrl: "",
  });
  const [planillaFile, setPlanillaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    getPartidos().then((result) => {
      if (!cancelled && result.success) {
        setPartidos(((result.partidos as unknown) as Partido[]) || []);
      }
      if (!cancelled) setLoadingList(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPartidos = () => {
    getPartidos().then((result) => {
      if (result.success) setPartidos(((result.partidos as unknown) as Partido[]) || []);
    });
  };

  const resetForm = () => {
    setFormData({ rival: "", fecha: "", torneo: "", resultado: "", youtubeUrl: "", planillaUrl: "" });
    setPlanillaFile(null);
    setEditingId(null);
  };

  const handleEdit = (partido: Partido) => {
    setEditingId(partido.id);
    setFormData({
      rival: partido.rival,
      fecha: new Date(partido.fecha).toISOString().split("T")[0],
      torneo: partido.torneo,
      resultado: partido.resultado || "",
      youtubeUrl: partido.youtubeUrl || "",
      planillaUrl: partido.planillaUrl || "",
    });
    setPlanillaFile(null);
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este partido? Se borrarán también sus estadísticas y comentarios.")) return;
    const result = await deletePartido(id);
    if (result.success) {
      setMessage("✅ Partido eliminado");
      refreshPartidos();
      if (editingId === id) resetForm();
    } else {
      setMessage("❌ " + result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const dataToSend = { ...formData };

    // Subir planilla si hay archivo seleccionado
    if (planillaFile) {
      try {
        setMessage("📤 Subiendo planilla...");
        const uploadFormData = new FormData();
        uploadFormData.append("file", planillaFile);
        if (editingId) uploadFormData.append("partidoId", editingId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          setMessage("❌ Error al subir planilla: " + uploadResult.error);
          setLoading(false);
          return;
        }
        dataToSend.planillaUrl = uploadResult.url;
      } catch (_err) {
        setMessage("❌ Error de red al subir planilla");
        setLoading(false);
        return;
      }
    }

    if (editingId) {
      const result = await updatePartido(editingId, dataToSend);
      if (result.success) {
        setMessage("✅ Partido actualizado exitosamente");
        resetForm();
        refreshPartidos();
      } else {
        setMessage("❌ " + result.error);
      }
    } else {
      const result = await createPartido(dataToSend);
      if (result.success) {
        setMessage("✅ Partido creado exitosamente");
        resetForm();
        refreshPartidos();
      } else {
        setMessage("❌ " + result.error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? "Editar Partido" : "Nuevo Partido"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancelar edición
            </button>
          )}
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Rival *</label>
            <input
              type="text"
              required
              value={formData.rival}
              onChange={(e) => setFormData({ ...formData, rival: e.target.value })}
              placeholder="Ej: Club Atlético River Plate"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Fecha *</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Torneo *</label>
            <input
              type="text"
              required
              value={formData.torneo}
              onChange={(e) => setFormData({ ...formData, torneo: e.target.value })}
              placeholder="Ej: Liga Nacional"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Resultado</label>
            <input
              type="text"
              value={formData.resultado}
              onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
              placeholder="Ej: 8-5"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Video (YouTube o Google Drive)</label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=...  o  https://drive.google.com/file/d/..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pegá un link de YouTube o de Google Drive (el archivo tiene que ser público)
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Planilla del partido (PDF)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setPlanillaFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              {formData.planillaUrl && !planillaFile && (
                <a
                  href={formData.planillaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  Ver actual
                </a>
              )}
            </div>
            {planillaFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Archivo seleccionado: {planillaFile.name} ({(planillaFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {loading ? (editingId ? "Guardando..." : "Creando...") : editingId ? "Guardar Cambios" : "Crear Partido"}
        </button>
      </form>

      {/* Lista de partidos */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-bold mb-4">Partidos Cargados</h3>
        {loadingList ? (
          <p className="text-muted-foreground text-sm">Cargando partidos...</p>
        ) : partidos.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay partidos cargados.</p>
        ) : (
          <div className="space-y-3">
            {partidos.map((p: Partido) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              >
                <div>
                  <p className="font-medium">
                    GER vs {p.rival}{" "}
                    <span className="text-muted-foreground text-sm">
                      — {new Date(p.fecha).toLocaleDateString("es-AR")}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.torneo} {p.resultado ? `| Resultado: ${p.resultado}` : ""}
                    {p.planillaUrl ? (
                      <span className="ml-2">
                        |{" "}
                        <a
                          href={p.planillaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📄 Planilla
                        </a>
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-500/10 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GestionarJugadoresForm() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    posiciones: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    getJugadores().then((result) => {
      if (!cancelled && result.success) {
        setJugadores(result.jugadores || []);
      }
      if (!cancelled) setLoadingList(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshJugadores = () => {
    getJugadores().then((result) => {
      if (result.success) setJugadores(result.jugadores || []);
    });
  };

  const resetForm = () => {
    setFormData({ nombre: "", posiciones: [] });
    setEditingId(null);
  };

  const handleEdit = (jugador: Jugador) => {
    setEditingId(jugador.id);
    setFormData({
      nombre: jugador.nombre,
      posiciones: jugador.posiciones,
    });
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este jugador? Se borrarán también sus estadísticas de partidos.")) return;
    const result = await deleteJugador(id);
    if (result.success) {
      setMessage("✅ Jugador eliminado");
      refreshJugadores();
      if (editingId === id) resetForm();
    } else {
      setMessage("❌ " + result.error);
    }
  };

  const handlePosicionChange = (posicion: string) => {
    setFormData((prev) => ({
      ...prev,
      posiciones: prev.posiciones.includes(posicion)
        ? prev.posiciones.filter((p) => p !== posicion)
        : [...prev.posiciones, posicion],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (editingId) {
      const result = await updateJugador(editingId, formData);
      if (result.success) {
        setMessage("✅ Jugador actualizado exitosamente");
        resetForm();
        refreshJugadores();
      } else {
        setMessage("❌ " + result.error);
      }
    } else {
      const result = await createJugador(formData);
      if (result.success) {
        setMessage("✅ Jugador agregado exitosamente");
        resetForm();
        refreshJugadores();
      } else {
        setMessage("❌ " + result.error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? "Editar Jugador" : "Nuevo Jugador"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancelar edición
            </button>
          )}
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre completo *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Martín Pérez"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Posiciones *</label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "Marcador de boya", "4", "5", "Boya", "Arquero"].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handlePosicionChange(pos)}
                  className={`rounded-lg px-3 py-1 text-sm border transition-colors ${
                    formData.posiciones.includes(pos)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted border-border"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || formData.posiciones.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {loading ? (editingId ? "Guardando..." : "Agregando...") : editingId ? "Guardar Cambios" : "Agregar Jugador"}
        </button>
      </form>

      {/* Lista de jugadores */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-bold mb-4">Jugadores Registrados</h3>
        {loadingList ? (
          <p className="text-muted-foreground text-sm">Cargando jugadores...</p>
        ) : jugadores.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay jugadores registrados.</p>
        ) : (
          <div className="space-y-3">
            {jugadores.map((j: Jugador) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              >
                <div>
                  <p className="font-medium">{j.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {j.posiciones.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(j)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-500/10 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CargarStatsForm() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [selectedPartido, setSelectedPartido] = useState("");
  const [selectedJugador, setSelectedJugador] = useState("");
  const [stats, setStats] = useState({
    goles: 0,
    asistencias: 0,
    robos: 0,
    bloqueos: 0,
    exclusiones: 0,
    turnovers: 0,
    tirosArco: 0,
    atajadas: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [message, setMessage] = useState("");
  const [statsExist, setStatsExist] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [pResult, jResult] = await Promise.all([getPartidos(), getJugadores()]);
      if (pResult.success) setPartidos(((pResult.partidos as unknown) as Partido[]) || []);
      if (jResult.success) setJugadores(jResult.jugadores || []);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadExistingStats() {
      if (!selectedPartido || !selectedJugador) {
        setStatsExist(false);
        setStats({
          goles: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
          exclusiones: 0,
          turnovers: 0,
          tirosArco: 0,
          atajadas: 0,
        });
        return;
      }

      setLoadingStats(true);
      const result = await getPartidoJugadorStats(selectedJugador, selectedPartido);
      
      if (result.success && result.stats) {
        setStatsExist(true);
        setStats({
          goles: result.stats.goles,
          asistencias: result.stats.asistencias,
          robos: result.stats.robos,
          bloqueos: result.stats.bloqueos,
          exclusiones: result.stats.exclusiones,
          turnovers: result.stats.turnovers,
          tirosArco: result.stats.tirosArco,
          atajadas: result.stats.atajadas,
        });
      } else {
        setStatsExist(false);
        setStats({
          goles: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
          exclusiones: 0,
          turnovers: 0,
          tirosArco: 0,
          atajadas: 0,
        });
      }
      
      setLoadingStats(false);
    }

    loadExistingStats();
  }, [selectedPartido, selectedJugador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartido || !selectedJugador) {
      setMessage("❌ Seleccioná un partido y un jugador");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await createPartidoJugador({
      jugadorId: selectedJugador,
      partidoId: selectedPartido,
      ...stats,
    });

    if (result.success) {
      setMessage(statsExist ? "✅ Estadísticas actualizadas" : "✅ Estadísticas guardadas");
      setStatsExist(true);
    } else {
      setMessage("❌ " + result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Cargar Estadísticas
      </h2>

      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {statsExist && (
        <div className="rounded-lg px-4 py-2 text-sm bg-yellow-500/20 text-yellow-600">
          ⚠️ Este jugador ya tiene estadísticas en este partido. Se sobreescribirán al guardar.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium mb-1 block">Partido *</label>
          <select
            required
            value={selectedPartido}
            onChange={(e) => setSelectedPartido(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar partido...</option>
            {partidos.map((p: Partido) => (
              <option key={p.id} value={p.id}>
                GER vs {p.rival} - {new Date(p.fecha).toLocaleDateString("es-AR")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Jugador *</label>
          <select
            required
            value={selectedJugador}
            onChange={(e) => setSelectedJugador(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar jugador...</option>
            {jugadores.map((j: Jugador) => (
              <option key={j.id} value={j.id}>
                {j.nombre} - {j.posiciones.join(", ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium mb-4">
          Estadísticas
          {loadingStats && <span className="text-sm text-muted-foreground ml-2">(cargando...)</span>}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Goles", key: "goles" },
            { label: "Asistencias", key: "asistencias" },
            { label: "Robos", key: "robos" },
            { label: "Bloqueos", key: "bloqueos" },
            { label: "Exclusiones", key: "exclusiones" },
            { label: "Turnovers", key: "turnovers" },
            { label: "Tiros al Arco", key: "tirosArco" },
            { label: "Atajadas", key: "atajadas" },
          ].map((stat) => (
            <div key={stat.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{stat.label}</label>
              <input
                type="number"
                min="0"
                value={stats[stat.key as keyof typeof stats]}
                onChange={(e) => setStats({ ...stats, [stat.key]: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || loadingStats}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {statsExist ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {loading ? "Guardando..." : statsExist ? "Actualizar Estadísticas" : "Guardar Estadísticas"}
      </button>
    </form>
  );
}

function ModerarComentariosForm() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getComentarios().then((result) => {
      if (!cancelled && result.success) {
        setComentarios(((result.comentarios as unknown) as Comentario[]) || []);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshComentarios = () => {
    getComentarios().then((result) => {
      if (result.success) setComentarios(((result.comentarios as unknown) as Comentario[]) || []);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este comentario?")) return;
    const result = await deleteComentario(id);
    if (result.success) {
      setMessage("✅ Comentario eliminado");
      refreshComentarios();
    } else {
      setMessage("❌ " + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Moderar Comentarios
      </h2>

      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay comentarios para moderar.</p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {comentarios.map((c: Comentario) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.autorNombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("es-AR")}{" "}
                        {new Date(c.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Partido: GER vs {c.partido.rival} ({new Date(c.partido.fecha).toLocaleDateString("es-AR")})
                    </p>
                    <p className="text-sm">{c.texto}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-500/10 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/20 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}


