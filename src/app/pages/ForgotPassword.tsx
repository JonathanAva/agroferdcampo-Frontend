import { useState, FormEvent } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "../config/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "No se pudo procesar la solicitud. Verifica el correo.");
    } finally {
      setLoading(false);
    }
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-5" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5" 
                  style={{ color: "var(--text-sec)" }} 
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="premium"
              className="w-full gap-2"
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send size={18} />
                  Enviar Link de Recuperación
                </>
              )}
            </Button>
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
