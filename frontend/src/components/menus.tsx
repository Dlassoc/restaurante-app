import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Menu, Restaurante } from "../types";

function toNumber(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function Menus() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [restauranteId, setRestauranteId] = useState<number | "">("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponible, setDisponible] = useState(true);

  const menusFiltrados = useMemo(() => {
    if (restauranteId === "") return menus;
    return menus.filter((m) => m.restauranteId === restauranteId);
  }, [menus, restauranteId]);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [r, m] = await Promise.all([
        apiGet<Restaurante[]>("/restaurantes"),
        apiGet<Menu[]>("/menus"),
      ]);
      setRestaurantes(r);
      setMenus(m);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  async function crearMenu(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (restauranteId === "") return setErr("Selecciona un restaurante");
    if (nombre.trim().length < 2) return setErr("Nombre del menú muy corto");

    const p = toNumber(precio);
    if (!Number.isFinite(p) || p <= 0) return setErr("Precio inválido");

    try {
      await apiPost<Menu>("/menus", {
        restauranteId,
        nombre: nombre.trim(),
        precio: p,
        disponible,
      });
      setNombre("");
      setPrecio("");
      setDisponible(true);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "Error creando menú");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div style={{ marginTop: 28 }}>
      <h2>Menús</h2>

      {err && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #f99", borderRadius: 8 }}>
          {err}
        </div>
      )}

      <section style={{ marginTop: 12 }}>
        <h3>Crear menú</h3>
        <form onSubmit={crearMenu} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
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

          <input placeholder="Nombre del menú" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
            Disponible
          </label>

          <button type="submit">Crear menú</button>
        </form>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Listado de menús</h3>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            Filtrar por restaurante:
            <select
              value={restauranteId}
              onChange={(e) => {
                const v = e.target.value;
                setRestauranteId(v === "" ? "" : Number(v));
              }}
            >
              <option value="">(Todos)</option>
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
        ) : menusFiltrados.length === 0 ? (
          <p>No hay menús aún.</p>
        ) : (
          <ul>
            {menusFiltrados.map((m) => (
              <li key={m.id}>
                <b>{m.nombre}</b> — ${String(m.precio)} —{" "}
                {m.disponible ? <span>Disponible</span> : <span>No disponible</span>} (restauranteId:{" "}
                {m.restauranteId})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}