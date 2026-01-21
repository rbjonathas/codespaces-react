import { useContext } from "react";
import { Navigate } from "react-router";
import { SessionContext } from "../../context/SessionContext";

export function AdminRoute({ children }) {
  const { session } = useContext(SessionContext);

  const isAdmin =
    session?.user?.user_metadata?.admin === true;

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
