import styles from "./Cart.module.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Trash } from "lucide-react";

export function Cart() {
  const { cart, updateQtyCart, removeFromCart, clearCart } =
    useContext(CartContext);

  return (
    <div className={styles.cart}>
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <CartItem
              key={item.variant_id}
              item={item}
              updateQtyCart={updateQtyCart}
              removeFromCart={removeFromCart}
            />
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <button onClick={clearCart} className={styles.clearCart}>
          CLEAR CART <Trash size={20} />
        </button>
      )}
    </div>
  );
}

function CartItem({ item, updateQtyCart, removeFromCart }) {
  return (
    <li className={styles.cartItem}>
      <img
        src={item.image}
        alt={item.title}
      />

      <div className={styles.info}>
        <h3>{item.title}</h3>

        {/* VARIANTS */}
        <p className={styles.variant}>
          Cor: <strong>{item.color}</strong> | Tamanho:{" "}
          <strong>{item.size}</strong>
        </p>

        <p className={styles.price}>
          ${(Number(item.price) || 0).toFixed(2)}
        </p>
      </div>

      {/* QUANTIDADE */}
      <div className={styles.quantityControls}>
        <button
          disabled={item.quantity <= 1}
          onClick={() =>
            updateQtyCart(item.variant_id, item.quantity - 1)
          }
        >
          -
        </button>

        <span>{item.quantity}</span>

        <button
          onClick={() =>
            updateQtyCart(item.variant_id, item.quantity + 1)
          }
        >
          +
        </button>
      </div>

      {/* REMOVER */}
      <button
        onClick={() => removeFromCart(item.variant_id)}
        className={styles.removeButton}
      >
        <Trash size={22} />
      </button>
    </li>
  );
}
