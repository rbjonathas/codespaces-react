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

  /* 🔹 CARREGA OPÇÕES DO PRODUTO */
  useEffect(() => {
    async function loadOptions() {
      const { data, error } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", product.id);

      if (!error) setOptions(data || []);
    }

    loadOptions();
  }, [product.id]);

  return (
    <div className={styles.productCard}>
      <img
        src={selectedOption?.image_url || product.image_url}
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

      {/* 🔹 OPÇÕES (TAMANHO / TIPO) */}
      {showOptions && (
        <div className={styles.optionsBox}>
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.optionButton} ${
                selectedOption?.id === opt.id ? styles.active : ""
              }`}
              onClick={() => setSelectedOption(opt)}
            >
              <strong>{opt.label}</strong>
              <span>R$ {Number(opt.price).toFixed(2)}</span>
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
            option_id: selectedOption.id,
            product_id: product.id,
            name: product.name,
            price: selectedOption.price,
            image: selectedOption.image_url || product.image_url,
            option_label: selectedOption.label,
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
