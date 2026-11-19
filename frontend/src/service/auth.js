import api from "./api";

// Limpa tokens que versões anteriores guardavam no localStorage.
localStorage.removeItem("token");

/** Retorna o admin logado (via cookie httpOnly) ou null. */
export async function getSession() {
  try {
    const { data } = await api.get("/me");
    return data.authenticated ? data.admin : null;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch {
    // Mesmo se a API falhar, o usuário sai da tela de admin.
  }
}
