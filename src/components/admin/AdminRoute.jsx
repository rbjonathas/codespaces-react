import { useContext } from "react";
import { Navigate } from "react-router";
import { SessionContext } from "../../context/SessionContext";

export function AdminRoute({ children }) {
  const { session, isAdmin } = useContext(SessionContext);

  console.log("SESSION:", session);
  console.log("IS ADMIN:", isAdmin);
  console.log("METADATA:", session?.user?.user_metadata);

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
