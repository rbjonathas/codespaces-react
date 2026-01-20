import { useEffect, useState } from "react";
import styles from "./ManagerVariants.module.css";
import { supabase } from "../utils/supabase";

export function ManagerVariants() {
  console.log("🚨 MANAGER VARIANTS ATUALIZADO 🚨");

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    color: "",
    size: "",
    image_url: "",
    price_adjust: 0,
  });

  /* 🔹 LOAD PRODUTOS */
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("product_1v")
        .select("id, title, price");

      if (!error) setProducts(data || []);
    }

    loadProducts();
  }, []);

  /* 🔹 LOAD VARIANTS */
  async function loadVariants(product_id) {
    if (!product_id) return;

    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product_id);

    setVariants(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price_adjust" ? Number(value) : value,
    }));
  }

  /* 🔹 SUBMIT */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.product_id || !form.color || !form.size || !form.image_url)
      return;

    await supabase.from("product_variants").insert([
      {
        product_id: Number(form.product_id),
        color: form.color,
        size: form.size,
        image_url: form.image_url,
        price_adjust: form.price_adjust,
      },
    ]);

    setForm({
      ...form,
      color: "",
      size: "",
      image_url: "",
      price_adjust: 0,
    });

    loadVariants(form.product_id);
  }

  /* 🔹 DELETE */
  async function handleDelete(id) {
    await supabase.from("product_variants").delete().eq("id", id);
    loadVariants(form.product_id);
  }

  const selectedProduct = products.find(
    (p) => String(p.id) === String(form.product_id)
  );

  return (
    <div className={styles.container}>
      <h2>Gerenciar Variações</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <select
          name="product_id"
          value={form.product_id}
          onChange={(e) => {
            handleChange(e);
            loadVariants(e.target.value);
          }}
          required
        >
          <option value="">Selecione um produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <input
          name="color"
          placeholder="Cor"
          value={form.color}
          onChange={handleChange}
          required
        />

        <input
          name="size"
          placeholder="Tamanho"
          value={form.size}
          onChange={handleChange}
          required
        />

        <input
          name="image_url"
          placeholder="URL da imagem"
          value={form.image_url}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price_adjust"
          placeholder="Ajuste de preço (ex: 20 ou -10)"
          value={form.price_adjust}
          onChange={handleChange}
          step="0.01"
        />

        <button type="submit">Adicionar Variação</button>
      </form>

      {variants.length > 0 && selectedProduct && (
        <ul className={styles.list}>
          {variants.map((v) => (
            <li key={v.id} className={styles.item}>
              <img src={v.image_url} alt="" />

              <div>
                <strong>
                  {v.color} — {v.size}
                </strong>
                <div className={styles.priceInfo}>
                  Base: R$ {Number(selectedProduct.price).toFixed(2)} <br />
                  Ajuste:{" "}
                  {v.price_adjust >= 0 ? "+" : ""}
                  {Number(v.price_adjust).toFixed(2)} <br />
                  Final: R${" "}
                  {(Number(selectedProduct.price) +
                    Number(v.price_adjust)).toFixed(2)}
                </div>
              </div>

              <button onClick={() => handleDelete(v.id)}>Remover</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
