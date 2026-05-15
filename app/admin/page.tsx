"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Upload, Users, Calendar, Trophy } from "lucide-react";
import { createPartido, createJugador, createPartidoJugador, getPartidos, getJugadores } from "@/lib/actions";

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
              <p className="text-muted-foreground mt-1">
                Waterpolo GER
              </p>
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
    { id: "partidos", label: "Cargar Partido", icon: Calendar },
    { id: "jugadores", label: "Agregar Jugador", icon: Users },
    { id: "stats", label: "Cargar Stats", icon: Trophy },
    { id: "planilla", label: "Subir Planilla", icon: Upload },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
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
            {activeSection === "partidos" && <CargarPartidoForm />}
            {activeSection === "jugadores" && <AgregarJugadorForm />}
            {activeSection === "stats" && <CargarStatsForm />}
            {activeSection === "planilla" && <SubirPlanillaForm />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CargarPartidoForm() {
  const [formData, setFormData] = useState({
    rival: "",
    fecha: "",
    torneo: "",
    resultado: "",
    youtubeUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await createPartido(formData);

    if (result.success) {
      setMessage("✅ Partido creado exitosamente");
      setFormData({ rival: "", fecha: "", torneo: "", resultado: "", youtubeUrl: "" });
    } else {
      setMessage("❌ " + result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Nuevo Partido
      </h2>
      
      {message && (
        <div className={`rounded-lg px-4 py-2 text-sm ${message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
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
          <label className="text-sm font-medium mb-1 block">URL de YouTube</label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {loading ? "Creando..." : "Crear Partido"}
      </button>
    </form>
  );
}

function AgregarJugadorForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    posiciones: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    const result = await createJugador(formData);

    if (result.success) {
      setMessage("✅ Jugador agregado exitosamente");
      setFormData({ nombre: "", posiciones: [] });
    } else {
      setMessage("❌ " + result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Nuevo Jugador
      </h2>

      {message && (
        <div className={`rounded-lg px-4 py-2 text-sm ${message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
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
        <Plus className="h-4 w-4" />
        {loading ? "Agregando..." : "Agregar Jugador"}
      </button>
    </form>
  );
}

function CargarStatsForm() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [pResult, jResult] = await Promise.all([getPartidos(), getJugadores()]);
      if (pResult.success) setPartidos(pResult.partidos || []);
      if (jResult.success) setJugadores(jResult.jugadores || []);
    }
    loadData();
  }, []);

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
      setMessage("✅ Estadísticas guardadas");
      setStats({
        goles: 0, asistencias: 0, robos: 0, bloqueos: 0,
        exclusiones: 0, turnovers: 0, tirosArco: 0, atajadas: 0,
      });
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
        <div className={`rounded-lg px-4 py-2 text-sm ${message.startsWith("✅") ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
          {message}
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
            {partidos.map((p: any) => (
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
            {jugadores.map((j: any) => (
              <option key={j.id} value={j.id}>
                {j.nombre} - {j.posiciones.join(", ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium mb-4">Estadísticas</h3>
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
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {loading ? "Guardando..." : "Guardar Estadísticas"}
      </button>
    </form>
  );
}

function SubirPlanillaForm() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Subir Planilla
      </h2>
      
      <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
        <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">
          Funcionalidad en desarrollo
        </p>
        <p className="text-xs text-muted-foreground">
          Próximamente: subida de planillas PDF/JPG
        </p>
      </div>
    </div>
  );
}
