import { useState, FormEvent } from "react";
import logo from "../../assets/logo.png";

import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Sprout, Mail, Lock, AlertCircle } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate("/dashboard");
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-lg"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 20px 50px var(--shadow)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-0">
            <img src={logo} alt="Logo" className="w-56 h-auto mx-auto" />
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            Agroferr D'Campo
          </h1>

          <p style={{ color: "var(--text-sec)" }} className="mt-2">
            Sistema de Gestión Multi-Sucursal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
            >
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-main)" }}
            >
              Correo Electrónico
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
              }}
            >
              <Mail size={20} style={{ color: "var(--text-sec)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--text-main)" }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-main)" }}
            >
              Contraseña
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
              }}
            >
              <Lock size={20} style={{ color: "var(--text-sec)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--text-main)" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm hover:underline transition-all"
                style={{ color: "var(--accent)" }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </form>

        {/* Demo Credentials */}
        <div
          className="mt-6 p-4 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text-sec)",
          }}
        >
          <p
            className="font-semibold mb-2"
            style={{ color: "var(--text-main)" }}
          >
            Credenciales de prueba:
          </p>
          <p>• Admin: admin@agroferdcampo.com / admin123</p>
          {/*<p>• Supervisor: supervisor@agroferdcampo.com / super123</p>*/}
          {/*<p>• Cajero: cajero@agroferdcampo.com / cajero123</p>*/}
        </div>
      </div>
    </div>
  );
}
