import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Restaurante } from "../types";

export default function Restaurantes() {
  const [items, setItems] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiGet<Restaurante[]>("/restaurantes");
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando restaurantes");
    } finally {
      setLoading(false);
    }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (nombre.trim().length < 2) return setErr("Nombre muy corto");
    if (direccion.trim().length < 5) return setErr("Dirección muy corta");

    try {
      await apiPost<Restaurante>("/restaurantes", {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() ? telefono.trim() : undefined,
      });
      setNombre("");
      setDireccion("");
      setTelefono("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Error creando restaurante");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Restaurantes</h2>

      {err && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #f99", borderRadius: 8 }}>
          {err}
        </div>
      )}

      <section style={{ marginTop: 12 }}>
        <h3>Crear restaurante</h3>
        <form onSubmit={crear} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <input
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <button type="submit">Crear</button>
        </form>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Listado</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <p>No hay restaurantes aún.</p>
        ) : (
          <ul>
            {items.map((r) => (
              <li key={r.id}>
                <b>{r.nombre}</b> — {r.direccion} {r.telefono ? `(${r.telefono})` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}