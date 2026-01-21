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

  /* LOAD PRODUCTS (opcional, não interfere no carrinho) */
  const refetchProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) setError(error.message);
    else setProducts(data || []);

    setLoading(false);
  };

  useEffect(() => {
    refetchProducts();
  }, []);

  /* LOAD CART — ALINHADO AO BANCO */
  const loadCartForUser = async (user_id) => {
    if (!user_id) return;

    const { data, error } = await supabase
      .from("cart")
      .select(`
        id,
        quantity,
        product_option:product_options (
          id,
          option_name,
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
        option_name: row.product_option.option_name,
        price: row.product_option.price,
        image: row.product_option.image_url || row.product_option.product.image_url,
      }))
    );
  };

  /* ADD TO CART */
  const addToCart = async (option) => {
    const optionId = option?.option_id || option?.id;
    if (!optionId) return;

    if (!session?.user?.id) {
      localStorage.setItem(
        PENDING_OPTION_KEY,
        JSON.stringify({ option_id: optionId })
      );
      navigate("/signin");
      return;
    }

    const user_id = session.user.id;

    const { data: existing } = await supabase
      .from("cart")
      .select("id, quantity")
      .match({ user_id, product_option_id: optionId })
      .single();

    if (existing) {
      await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert([
        {
          user_id,
          product_option_id: optionId,
          quantity: 1,
        },
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
        .match({
          user_id: session.user.id,
          product_option_id: option_id,
        });

      // Remove do estado local mantendo a ordem
      setCart(cart.filter(item => item.option_id !== option_id));
    } else {
      await supabase
        .from("cart")
        .update({ quantity })
        .match({
          user_id: session.user.id,
          product_option_id: option_id,
        });

      // Atualiza apenas no estado local mantendo a ordem
      setCart(cart.map(item => 
        item.option_id === option_id 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  /* REMOVE ITEM */
  const removeFromCart = async (option_id) => {
    if (!session?.user?.id) return;

    await supabase
      .from("cart")
      .delete()
      .match({
        user_id: session.user.id,
        product_option_id: option_id,
      });

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
