import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../utils/supabase";
import { SessionContext } from "./SessionContext";

export const CartContext = createContext({
  products: [],
  loading: false,
  error: null,
  cart: [],
  theme: "light",
  addToCart: () => {},
  updateQtyCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  setTheme: () => {},
});

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [theme, setTheme] = useState("light");

  const { session } = useContext(SessionContext);
  const LOCAL_CART_KEY = "cart";
  const LOCAL_THEME_KEY = "theme";

  
  const persistLocalCart = (items) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch {}
  };

  
  const persistTheme = (value) => {
    try {
      localStorage.setItem(LOCAL_THEME_KEY, value);
      document.documentElement.setAttribute("data-theme", value);
    } catch {}
  };

  
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("product_1v").select();
      if (error) setError(error.message);
      else setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);
  
  const loadCartForUser = async (user_id) => {
    try {
      const { data, error } = await supabase
        .from("cart")
        .select(`
          product_id,
          quantity,
          product_1v (title, price, thumbnail)
        `)
        .eq("user_id", user_id);

      if (error) {
        console.error("Error loading cart:", error);
        return;
      }

      const loaded = data.map((row) => ({
        id: row.product_id,
        quantity: row.quantity,
        title: row.product_1v?.title,
        price: row.product_1v?.price,
        thumbnail: row.product_1v?.thumbnail,
      }));

      setCart(loaded);
    } catch (e) {
      console.error(e);
    }
  };
  
  const mergeLocalToRemote = async (user_id) => {
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (!raw) return;
      const local = JSON.parse(raw);

      for (const item of local) {
        const product_id = item.id;
        const { data: existing } = await supabase
          .from("cart")
          .select("quantity")
          .match({ user_id, product_id })
          .single();

        if (existing) {
          const newQty = existing.quantity + item.quantity;
          await supabase
            .from("cart")
            .update({ quantity: newQty })
            .match({ user_id, product_id });
        } else {
          await supabase.from("cart").insert([{ user_id, product_id, quantity: item.quantity }]);
        }
      }

      localStorage.removeItem(LOCAL_CART_KEY);
      await loadCartForUser(user_id);
    } catch (e) {
      console.error("Error merging cart:", e);
    }
  };
  
  const addToCart = async (product) => {
    const product_id = product.id;

    if (session?.user?.id) {
      const user_id = session.user.id;
      try {
        const { data: existing } = await supabase
          .from("cart")
          .select("quantity")
          .match({ user_id, product_id })
          .single();

        if (existing) {
          const newQty = existing.quantity + 1;
          await supabase.from("cart").update({ quantity: newQty }).match({ user_id, product_id });
        } else {
          await supabase.from("cart").insert([{ user_id, product_id, quantity: 1 }]);
        }

        await loadCartForUser(user_id);
      } catch (e) {
        console.error("Error adding to remote cart", e);
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((it) => it.id === product_id);
        const next = existing
          ? prev.map((it) => (it.id === product_id ? { ...it, quantity: it.quantity + 1 } : it))
          : [...prev, { id: product_id, quantity: 1, title: product.title, price: product.price, thumbnail: product.thumbnail }];
        persistLocalCart(next);
        return next;
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (session?.user?.id) {
      await supabase.from("cart").delete().match({ user_id: session.user.id, product_id: productId });
      await loadCartForUser(session.user.id);
    } else {
      setCart((prev) => {
        const next = prev.filter((item) => item.id !== productId);
        persistLocalCart(next);
        return next;
      });
    }
  };

  const updateQtyCart = async (productId, quantity) => {
    if (session?.user?.id) {
      if (quantity <= 0) {
        await supabase.from("cart").delete().match({ user_id: session.user.id, product_id: productId });
      } else {
        await supabase.from("cart").update({ quantity }).match({ user_id: session.user.id, product_id: productId });
      }
      await loadCartForUser(session.user.id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
      persistLocalCart(cart);
    }
  };

  const clearCart = async () => {
    if (session?.user?.id) {
      await supabase.from("cart").delete().eq("user_id", session.user.id);
      setCart([]);
    } else {
      setCart([]);
      persistLocalCart([]);
    }
  };

  useEffect(() => {
    async function init() {
      // Tema
      const storedTheme = localStorage.getItem(LOCAL_THEME_KEY);
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.setAttribute("data-theme", storedTheme);
      } else {
        setTheme("light");
        document.documentElement.setAttribute("data-theme", "light");
      }

      // Carrinho
      if (session?.user?.id) {
        await mergeLocalToRemote(session.user.id);
        await loadCartForUser(session.user.id);
      } else {
        const rawCart = localStorage.getItem(LOCAL_CART_KEY);
        setCart(rawCart ? JSON.parse(rawCart) : []);
      }
    }

    init();
  }, [session]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    persistTheme(newTheme);
  };

  return (
    <CartContext.Provider
      value={{
        products,
        loading,
        error,
        cart,
        theme,
        addToCart,
        updateQtyCart,
        removeFromCart,
        clearCart,
        setTheme: changeTheme,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
