import styles from "./Product.module.css";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { supabase } from "../utils/supabase";

export function Product({ product, isExpanded, onExpand, onClose }) {
  const { addToCart } = useContext(CartContext);

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [added, setAdded] = useState(false);

  /* 🔹 CARREGA OPÇÕES */
  useEffect(() => {
    async function loadOptions() {
      const { data, error } = await supabase
        .from("product_options")
        .select("id, option_name, price, image_url")
        .eq("product_id", product.id)
        .order("price");

      if (!error) setOptions(data || []);
      else console.error(error);
    }

    loadOptions();
  }, [product.id]);

  /* 🔹 IMAGEM ATUAL */
  const currentImage =
    selectedOption?.image_url || product.image_url;

  /* 🔹 ADICIONAR E RESETAR */
  function handleAddToCart() {
    if (!selectedOption) return;

    addToCart({ id: selectedOption.id });

    setAdded(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  }

  /* 🔹 FECHAR E RESETAR */
  function handleClose() {
    setSelectedOption(null);
    setAdded(false);
    onClose();
  }

  /* 🔹 TOGGLE SELEÇÃO */
  function handleToggleOption(option) {
    if (selectedOption?.id === option.id) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  }

  return (
    <>
      {/* OVERLAY quando expandido */}
      {isExpanded && (
        <div 
          className={styles.overlay}
          onClick={handleClose}
        />
      )}

      <div className={`${styles.productCard} ${isExpanded ? styles.expanded : ""}`}>
        <img
          src={currentImage}
          alt={product.name}
          className={styles.productImage}
        />

        <h2 className={styles.productTitle}>{product.name}</h2>

        {product.description && (
          <p className={styles.productDescription}>
            {product.description}
          </p>
        )}

        <p className={styles.productPrice}>
          {selectedOption
            ? `R$ ${Number(selectedOption.price).toFixed(2)}`
            : isExpanded && "Selecione uma opção"}
        </p>

        {isExpanded && (
          <div className={styles.optionsBox}>
            {options.map((option) => (
              <button
                key={option.id}
                className={`${styles.optionButton} ${
                  selectedOption?.id === option.id ? styles.active : ""
                }`}
                onClick={() => handleToggleOption(option)}
              >
                <strong>{option.option_name}</strong>
                <span>R$ {Number(option.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}

        <button
          className={styles.productButton}
          disabled={isExpanded && !selectedOption}
          onClick={() => {
            if (!isExpanded) {
              onExpand();
              return;
            }

            if (!selectedOption) return;

            handleAddToCart();
          }}
        >
          {!isExpanded
            ? "ESCOLHER"
            : added
            ? "✔ ADICIONADO"
            : "ADICIONAR"}
        </button>
      </div>
    </>
  );
}
