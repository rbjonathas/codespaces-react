import styles from "./Product.module.css";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { supabase } from "../utils/supabase";

export function Product({ product }) {
  const { addToCart } = useContext(CartContext);

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [added, setAdded] = useState(false);

  /* 🔹 CARREGA OPÇÕES (VARIANTES) */
  useEffect(() => {
    async function loadOptions() {
      const { data, error } = await supabase
        .from("product_options")
        .select("id, option_name, price")
        .eq("product_id", product.id)
        .order("price");

      if (!error) setOptions(data || []);
      else console.error(error);
    }

    loadOptions();
  }, [product.id]);

  return (
    <div className={styles.productCard}>
      <img
        src={product.image_url}
        alt={product.name}
        className={styles.productImage}
      />

      <h2 className={styles.productTitle}>{product.name}</h2>

      {product.description && (
        <p className={styles.productDescription}>
          {product.description}
        </p>
      )}

      {/* 🔹 PREÇO */}
      <p className={styles.productPrice}>
        {selectedOption
          ? `R$ ${Number(selectedOption.price).toFixed(2)}`
          : "Selecione uma opção"}
      </p>

      {/* 🔹 OPÇÕES */}
      {showOptions && (
        <div className={styles.optionsBox}>
          {options.map((option) => (
            <button
              key={option.id}
              className={`${styles.optionButton} ${
                selectedOption?.id === option.id ? styles.active : ""
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <strong>{option.option_name}</strong>
              <span>R$ {Number(option.price).toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}

      {/* 🔹 BOTÃO PRINCIPAL */}
      <button
        className={styles.productButton}
        disabled={showOptions && !selectedOption}
        onClick={() => {
          if (!showOptions) {
            setShowOptions(true);
            return;
          }

          if (!selectedOption) return;

          addToCart({
            id: selectedOption.id, // product_option_id
          });

          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
      >
        {!showOptions
          ? "ESCOLHER"
          : added
          ? "✔ ADICIONADO"
          : "ADICIONAR"}
      </button>
    </div>
  );
}
