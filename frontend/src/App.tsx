import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./lib/api";
import type { Restaurante } from "./types";

export default function App() {
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
      setErr(e?.message ?? "error");
    } finally {
      setLoading(false);
    }
  }

  async function createRestaurante(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await apiPost<Restaurante>("/restaurantes", {
        nombre,
        direccion,
        telefono: telefono || undefined,
      });
      setNombre("");
      setDireccion("");
      setTelefono("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Restaurante App</h1>

      <p style={{ opacity: 0.8 }}>
        Backend: <code>{import.meta.env.VITE_API_URL ?? "http://localhost:3000"}</code>
      </p>

      {err && <div style={{ padding: 12, background: "#fee", border: "1px solid #f99" }}>{err}</div>}

      <section style={{ marginTop: 24 }}>
        <h2>Crear restaurante</h2>
        <form onSubmit={createRestaurante} style={{ display: "grid", gap: 8 }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <input placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <button type="submit">Crear</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Restaurantes</h2>
        {loading ? (
          <p>Cargando...</p>
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