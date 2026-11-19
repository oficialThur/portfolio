import { useNavigate } from "react-router-dom";
import api from "@/service/api";
import { buttonGhost } from "./styles";

export function AdminHeader() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/logout");
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6 md:px-8">
      <h1 className="font-mono text-label-md uppercase text-text-primary">
        Admin
      </h1>
      <button type="button" onClick={handleLogout} className={buttonGhost}>
        Sair
      </button>
    </header>
  );
}
