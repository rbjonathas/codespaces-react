import "./styles/theme.css";
import "./styles/global.css";

import { Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";

import { Header } from "./components/Header";
import { ProductList } from "./components/ProductList";
import { Cart } from "./components/Cart";
import { Login } from "./components/Login";
import { User } from "./components/User";

import { CartProvider } from "./context/CartContext";
import { SessionProvider } from "./context/SessionContext";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/admin/AdminRoute";

import Manager from "./components/Manager";
import { ManagerVariants } from "./components/ManagerVariants";

export default function App() {
  return (
    <>
      <ToastContainer />

      <SessionProvider>
        <CartProvider>
          <Header />

          <Routes>
            {/* HOME */}
            <Route path="/" element={<ProductList />} />

            {/* CART */}
            <Route path="/cart" element={<Cart />} />

            {/* AUTH */}
            <Route path="/signin" element={<Login value="signin" />} />
            <Route path="/register" element={<Login value="register" />} />

            {/* USER */}
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/manager"
              element={
                <AdminRoute>
                  <Manager />
                </AdminRoute>
              }
            />

            <Route
              path="/manager-variants"
              element={
                <AdminRoute>
                  <ManagerVariants />
                </AdminRoute>
              }
            />
          </Routes>
        </CartProvider>
      </SessionProvider>
    </>
  );
}
