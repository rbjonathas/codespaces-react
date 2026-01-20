import { useContext } from "react";
import { Navigate } from "react-router";
import { SessionContext } from "../context/SessionContext";

export function ProtectedRoute({ children }) {
  const { session } = useContext(SessionContext);

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
