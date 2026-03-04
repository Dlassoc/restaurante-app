import Menus from "./components/menus";
import Restaurantes from "./components/restaurantes";
export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Restaurante App</h1>
      <p style={{ opacity: 0.75 }}>
        API: <code>{import.meta.env.VITE_API_URL ?? "http://localhost:3000"}</code>
      </p>

      <Restaurantes />
      <Menus />
    </div>
  );
}