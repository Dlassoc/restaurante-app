import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Reserva, Restaurante } from "../types";

function toInt(v: string): number {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function localDateTimeToIso(dtLocal: string): string {
  // dtLocal: "YYYY-MM-DDTHH:mm" (input type="datetime-local")
  // Convertimos a Date local y luego ISO (UTC) para cumplir zod datetime()
  const d = new Date(dtLocal);
  return d.toISOString();
}

export default function Reservas() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtro
  const [filtroRestauranteId, setFiltroRestauranteId] = useState<number | "">("");

  // form
  const [restauranteId, setRestauranteId] = useState<number | "">("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [personas, setPersonas] = useState("2");
  const [fechaHoraLocal, setFechaHoraLocal] = useState("");
  const [notas, setNotas] = useState("");

  const reservasFiltradas = useMemo(() => {
    if (filtroRestauranteId === "") return reservas;
    return reservas.filter((r) => r.restauranteId === filtroRestauranteId);
  }, [reservas, filtroRestauranteId]);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [r, resv] = await Promise.all([
        apiGet<Restaurante[]>("/restaurantes"),
        apiGet<Reserva[]>("/reservas"),
      ]);
      setRestaurantes(r);
      setReservas(resv);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  async function crearReserva(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (restauranteId === "") return setErr("Selecciona un restaurante");
    if (nombreCliente.trim().length < 2) return setErr("Nombre del cliente muy corto");

    const p = toInt(personas);
    if (!Number.isFinite(p) || p <= 0) return setErr("Personas inválido");

    if (!fechaHoraLocal) return setErr("Selecciona fecha y hora");
    const fechaHoraIso = localDateTimeToIso(fechaHoraLocal);

    try {
      await apiPost<Reserva>("/reservas", {
        restauranteId,
        nombreCliente: nombreCliente.trim(),
        personas: p,
        fechaHora: fechaHoraIso,
        notas: notas.trim() ? notas.trim() : undefined,
      });

      setNombreCliente("");
      setPersonas("2");
      setFechaHoraLocal("");
      setNotas("");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "Error creando reserva");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div style={{ marginTop: 28 }}>
      <h2>Reservas</h2>

      {err && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #f99", borderRadius: 8 }}>
          {err}
        </div>
      )}

      <section style={{ marginTop: 12 }}>
        <h3>Crear reserva</h3>
        <form onSubmit={crearReserva} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <select
            value={restauranteId}
            onChange={(e) => {
              const v = e.target.value;
              setRestauranteId(v === "" ? "" : Number(v));
            }}
          >
            <option value="">-- Selecciona restaurante --</option>
            {restaurantes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          <input
            placeholder="Nombre del cliente"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
          />

          <input
            placeholder="Personas"
            value={personas}
            onChange={(e) => setPersonas(e.target.value)}
            inputMode="numeric"
          />

          <label style={{ display: "grid", gap: 6 }}>
            Fecha y hora
            <input
              type="datetime-local"
              value={fechaHoraLocal}
              onChange={(e) => setFechaHoraLocal(e.target.value)}
            />
          </label>

          <textarea
            placeholder="Notas (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
          />

          <button type="submit">Crear reserva</button>
        </form>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Nota: el frontend convierte <code>datetime-local</code> a ISO para que el backend lo acepte.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Listado de reservas</h3>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            Filtrar por restaurante:
            <select
              value={filtroRestauranteId}
              onChange={(e) => {
                const v = e.target.value;
                setFiltroRestauranteId(v === "" ? "" : Number(v));
              }}
            >
              <option value="">(Todas)</option>
              {restaurantes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : reservasFiltradas.length === 0 ? (
          <p>No hay reservas aún.</p>
        ) : (
          <ul>
            {reservasFiltradas.map((r) => (
              <li key={r.id}>
                <b>{r.nombreCliente}</b> — {r.personas} personas —{" "}
                {new Date(r.fechaHora).toLocaleString()} (restauranteId: {r.restauranteId})
                {r.notas ? ` — ${r.notas}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}