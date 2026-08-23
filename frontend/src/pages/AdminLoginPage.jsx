import { useEffect, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email({ error: "Informe um email válido." }),
  password: z
    .string()
    .min(1, { error: "Informe a senha." })
    .min(8, { error: "A senha deve ter pelo menos 8 caracteres." }),
});

const inputClass =
  "h-11 w-full rounded-md border border-border bg-transparent px-3.5 py-2.5 text-body-md text-text-primary transition-colors duration-200 focus:border-text-muted";

const labelClass =
  "mb-2 block font-mono text-label-md uppercase text-text-muted";

const errorClass = "font-mono text-label-md text-[#EF4444]";

/**
 * Tela de login do admin (DESIGN.md › Admin Area › Login Screen): card
 * `admin-login-card` centrado, inputs `admin-input`, botão
 * `admin-button-primary` e os quatro estados previstos — default, loading,
 * erro de autenticação e foco de teclado. Validação com zod; mensagens de
 * erro inline abaixo do campo correspondente.
 *
 * A autenticação está propositalmente desconectada: o submit válido simula a
 * tentativa e cai no estado de erro até o backend ser plugado (TODO abaixo).
 */
export function AdminLoginPage() {
  useEffect(() => {
    document.title = "Login — Admin";
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }
  }, []);

  const [values, setValues] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setAuthError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setFieldErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setFieldErrors({});
    setAuthError("");
    setIsSubmitting(true);
    try {
      // TODO(owner): autenticar no backend (ex.: POST /api/auth/login com
      // `result.data`); em sucesso navegar para /admin, em 401 chamar
      // setAuthError("Email ou senha incorretos."). O delay abaixo existe só
      // para exercitar o estado de loading enquanto a rota não existe.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAuthError("Autenticação ainda não conectada ao backend.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="enter w-full max-w-[400px] rounded-md border border-border p-10">
        <h1 className="text-center font-mono text-label-md uppercase text-text-primary">
          Admin
        </h1>

        <form
          className="mt-8 flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="login-email" className={labelClass}>
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "login-email-error" : undefined
              }
              className={inputClass}
            />
            {fieldErrors.email && (
              <p
                id="login-email-error"
                role="alert"
                className={`${errorClass} mt-2`}
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className={labelClass}>
              Senha
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "login-password-error" : undefined
              }
              className={inputClass}
            />
            {fieldErrors.password && (
              <p
                id="login-password-error"
                role="alert"
                className={`${errorClass} mt-2`}
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-10 cursor-pointer self-center rounded-md bg-white px-5 font-mono text-label-md uppercase text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          {authError && (
            <p role="alert" className={`${errorClass} text-center`}>
              {authError}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
