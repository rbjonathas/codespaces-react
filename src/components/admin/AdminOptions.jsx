import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import styles from "./AdminOptions.module.css";

export default function AdminOptions() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [optionName, setOptionName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await supabase.from("product_options").insert([
      {
        product_id: productId,
        option_name: optionName,
        price,
        image_url: imageUrl,
        group_name: "Opção",
      },
    ]);

    setOptionName("");
    setPrice("");
    setImageUrl("");
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Opções do Produto</h2>

      <form onSubmit={handleSubmit}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input placeholder="Opção (ex: 300ml)" value={optionName} onChange={(e) => setOptionName(e.target.value)} />
        <input placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input placeholder="Imagem da opção" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        <button>Cadastrar</button>
      </form>
    </div>
  );
}
