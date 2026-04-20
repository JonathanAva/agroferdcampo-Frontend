import { useState, FormEvent } from "react";
import logo from "../../assets/logo.png";

import { useNavigate, Link } from "react-router";
import { useAuth, Branch } from "../context/AuthContext";
import { Sprout, Mail, Lock, AlertCircle, MapPin, ArrowLeft } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "select-branch">("login");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const { login, selectBranch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('Iniciando login para:', email);
      const response = await login(email, password);
      console.log('Respuesta de login:', response);

      if (response.requireBranchSelection) {
        console.log('Requiere selección de sucursal. Sucursales:', response.branches);
        setBranches(response.branches || []);
        setUserId(response.user?.id || null);
        setStep("select-branch");
      } else if (response.accessToken) {
        console.log('Login exitoso (sucursal única)');
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error('Error en handleSubmit:', err);
      setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = async (branchId: number) => {
    if (!userId) return;
    setError("");
    setLoading(true);

    try {
      const response = await selectBranch(userId, branchId);
      if (response.accessToken) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Error al seleccionar sucursal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-lg transition-all duration-300"
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

          <p style={{ color: "var(--text-sec)" }} className="mt-2 text-center">
            {step === "login" 
              ? "Sistema de Gestión Multi-Sucursal" 
              : "Selecciona una sucursal para continuar"}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-6 animate-shake"
            style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
          >
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {step === "login" ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-main)" }}
              >
                Correo Electrónico
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg border focus-within:ring-2 ring-[var(--accent)] transition-all"
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-main)" }}
              >
                Contraseña
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg border focus-within:ring-2 ring-[var(--accent)] transition-all"
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

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
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
        ) : (
          /* Branch Selection */
          <div className="space-y-4">
            <div className="grid gap-3">
              {branches && branches.length > 0 ? (
                branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch.id)}
                    disabled={loading}
                    className="flex items-center justify-between p-4 rounded-xl border text-left transition-all hover:bg-[var(--bg)] group active:scale-[0.98]"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--bg)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: "var(--text-main)" }}>
                          {branch.name}
                        </div>
                        <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-sec)" }}>
                          Rol: {branch.role}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8" style={{ color: "var(--text-sec)" }}>
                  <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No se encontraron sucursales asignadas.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep("login")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-sec)" }}
            >
              <ArrowLeft size={16} />
              Volver al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

