import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./lib/api";
import Menus from "./components/menus";

type Restaurante = {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string | null;
};

export default function App() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Restaurante[]>("/restaurantes");
      setRestaurantes(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando restaurantes");
    } finally {
      setLoading(false);
    }
  }

  async function crearRestaurante(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) return setError("Nombre muy corto");
    if (direccion.trim().length < 5) return setError("Dirección muy corta");

    try {
      await apiPost<Restaurante>("/restaurantes", {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() ? telefono.trim() : undefined,
      });
      setNombre("");
      setDireccion("");
      setTelefono("");
      await cargar();
    } catch (e: any) {
      setError(e?.message ?? "Error creando restaurante");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Restaurantes</h1>
      <p style={{ opacity: 0.75 }}>
        API: <code>{import.meta.env.VITE_API_URL ?? "http://localhost:3000"}</code>
      </p>

      {error && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #f99", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <section style={{ marginTop: 20 }}>
        <h2>Crear restaurante</h2>
        <form onSubmit={crearRestaurante} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <input
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <button type="submit">Crear</button>
        </form>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Listado</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : restaurantes.length === 0 ? (
          <p>No hay restaurantes aún.</p>
        ) : (
          <ul>
            {restaurantes.map((r) => (
              <li key={r.id}>
                <b>{r.nombre}</b> — {r.direccion} {r.telefono ? `(${r.telefono})` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section style={{ marginTop: 28 }}>
        <Menus />
      </section>
    </div>
  );
}
