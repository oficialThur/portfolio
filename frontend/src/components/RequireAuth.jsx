import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "@/service/auth";

export function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    getSession().then((admin) => {
      if (active) {
        setStatus(admin ? "ok" : "anon");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div
        id="conteudo"
        tabIndex={-1}
        className="grid min-h-screen place-items-center bg-background"
      >
        <p
          role="status"
          className="font-mono text-label-md uppercase text-text-muted"
        >
          Verificando sessão…
        </p>
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
