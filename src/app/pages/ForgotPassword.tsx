import { useState, FormEvent } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de envío de correo
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
            Recuperar Contraseña
          </h1>

          <p style={{ color: "var(--text-sec)" }} className="mt-2 text-center text-sm">
            Ingresa tu correo electrónico y te enviaremos un link para restablecer tu contraseña.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send size={18} />
                  Enviar Link de Recuperación
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-main)" }}>
              ¡Correo Enviado!
            </h2>
            <p style={{ color: "var(--text-sec)" }} className="mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-all"
            style={{ color: "var(--text-main)" }}
          >
            <ArrowLeft size={16} />
            Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
