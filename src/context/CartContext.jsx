import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../utils/supabase";
import { SessionContext } from "./SessionContext";

export const CartContext = createContext({});

const PENDING_OPTION_KEY = "pending_option";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { session } = useContext(SessionContext);
  const navigate = useNavigate();

  /* LOAD PRODUCTS */
  const refetchProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("products").select("*");
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refetchProducts();
  }, []);

  /* LOAD CART */
  const loadCartForUser = async (user_id) => {
    if (!user_id) return;
    const { data, error } = await supabase
      .from("cart")
      .select(`
        id,
        quantity,
        product_option:product_options (
          id,
          label,
          price,
          image_url,
          product:products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq("user_id", user_id);

    if (error) {
      console.error(error);
      return;
    }

    setCart(
      (data || []).map((row) => ({
        cart_id: row.id,
        option_id: row.product_option.id,
        quantity: row.quantity,
        name: row.product_option.product.name,
        label: row.product_option.label,
        price: row.product_option.price,
        image:
          row.product_option.image_url ||
          row.product_option.product.image_url,
      }))
    );
  };

  /* ADD TO CART */
  const addToCart = async (option) => {
    if (!session?.user?.id) {
      if (option?.id) {
        localStorage.setItem(
          PENDING_OPTION_KEY,
          JSON.stringify({ option_id: option.id })
        );
      }
      navigate("/signin");
      return;
    }
    if (!option?.id) return;

    const user_id = session.user.id;
    const { data: existing } = await supabase
      .from("cart")
      .select("id, quantity")
      .match({ user_id, product_option_id: option.id })
      .single();

    if (existing) {
      await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert([
        { user_id, product_option_id: option.id, quantity: 1 },
      ]);
    }

    await loadCartForUser(user_id);
  };

  /* RESTORE PENDING OPTION */
  const restorePendingOption = async () => {
    if (!session?.user?.id) return;
    const raw = localStorage.getItem(PENDING_OPTION_KEY);
    if (!raw) return;

    const { option_id } = JSON.parse(raw);
    if (!option_id) return;

    await addToCart({ id: option_id });
    localStorage.removeItem(PENDING_OPTION_KEY);
  };

  /* UPDATE QTY */
  const updateQtyCart = async (option_id, quantity) => {
    if (!session?.user?.id) return;
    if (quantity <= 0) {
      await supabase
        .from("cart")
        .delete()
        .match({ user_id: session.user.id, product_option_id: option_id });
    } else {
      await supabase
        .from("cart")
        .update({ quantity })
        .match({ user_id: session.user.id, product_option_id: option_id });
    }
    await loadCartForUser(session.user.id);
  };

  /* REMOVE ITEM */
  const removeFromCart = async (option_id) => {
    if (!session?.user?.id) return;
    await supabase
      .from("cart")
      .delete()
      .match({ user_id: session.user.id, product_option_id: option_id });
    await loadCartForUser(session.user.id);
  };

  /* CLEAR CART */
  const clearCart = async () => {
    if (!session?.user?.id) {
      setCart([]);
      return;
    }
    await supabase
      .from("cart")
      .delete()
      .eq("user_id", session.user.id);
    setCart([]);
  };

  /* INIT */
  useEffect(() => {
    if (session?.user?.id) {
      loadCartForUser(session.user.id);
      restorePendingOption();
    } else {
      setCart([]);
    }
  }, [session]);

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        loading,
        error,
        addToCart,
        updateQtyCart,
        removeFromCart,
        clearCart,
        refetchProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
