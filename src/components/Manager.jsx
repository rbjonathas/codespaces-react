import { useEffect, useState } from "react";
import styles from "./Manager.module.css";
import { supabase } from "../utils/supabase";

export function Manager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [categoryName, setCategoryName] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  const [optionForm, setOptionForm] = useState({
    label: "",
    price: "",
    image_url: "",
  });

  /* =========================
     LOAD CATEGORIES
  ========================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    setCategories(data || []);
  }

  async function fetchProducts(categoryId) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");

    setProducts(data || []);
    setOptions([]);
  }

  async function fetchOptions(productId) {
    const { data } = await supabase
      .from("product_options")
      .select("*")
      .eq("product_id", productId)
      .order("price");

    setOptions(data || []);
  }

  /* =========================
     CREATE CATEGORY
  ========================= */
  async function createCategory(e) {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const { data } = await supabase
      .from("categories")
      .insert([{ name: categoryName }])
      .select()
      .single();

    setCategoryName("");
    await fetchCategories();

    // 🔥 seleciona automaticamente a nova categoria
    setSelectedCategory(data);
    setProducts([]);
    setOptions([]);
  }

  /* =========================
     CREATE PRODUCT
  ========================= */
  async function createProduct(e) {
    e.preventDefault();
    if (!selectedCategory || !productForm.name.trim()) return;

    await supabase.from("products").insert([
      {
        category_id: selectedCategory.id,
        name: productForm.name,
        description: productForm.description,
        image_url: productForm.image_url,
      },
    ]);

    setProductForm({ name: "", description: "", image_url: "" });
    fetchProducts(selectedCategory.id);
  }

  /* =========================
     CREATE OPTION
  ========================= */
  async function createOption(e) {
    e.preventDefault();
    if (!selectedProduct || !optionForm.label || !optionForm.price) return;

    await supabase.from("product_options").insert([
      {
        product_id: selectedProduct.id,
        label: optionForm.label,
        price: Number(optionForm.price),
        image_url: optionForm.image_url,
      },
    ]);

    setOptionForm({ label: "", price: "", image_url: "" });
    fetchOptions(selectedProduct.id);
  }

  return (
    <div className={styles.container}>
      <h2>Administração — Black Coffee ☕</h2>

      {/* =========================
         CATEGORIES
      ========================= */}
      <section className={styles.section}>
        <h3>Categorias</h3>

        <form onSubmit={createCategory} className={styles.form}>
          <input
            placeholder="Ex: Cafés Quentes"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit">Criar categoria</button>
        </form>

        <div className={styles.list}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`${styles.selectBtn} ${
                selectedCategory?.id === c.id ? styles.active : ""
              }`}
              onClick={() => {
                setSelectedCategory(c);
                setSelectedProduct(null);
                fetchProducts(c.id);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* =========================
         PRODUCTS
      ========================= */}
      {selectedCategory && (
        <section className={styles.section}>
          <h3>Produtos — {selectedCategory.name}</h3>

          <form onSubmit={createProduct} className={styles.form}>
            <input
              placeholder="Nome do café"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
            />
            <input
              placeholder="Descrição"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  description: e.target.value,
                })
              }
            />
            <input
              placeholder="URL da imagem"
              value={productForm.image_url}
              onChange={(e) =>
                setProductForm({ ...productForm, image_url: e.target.value })
              }
            />
            <button type="submit">Criar produto</button>
          </form>

          <div className={styles.list}>
            {products.map((p) => (
              <button
                key={p.id}
                className={`${styles.selectBtn} ${
                  selectedProduct?.id === p.id ? styles.active : ""
                }`}
                onClick={() => {
                  setSelectedProduct(p);
                  fetchOptions(p.id);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* =========================
         OPTIONS
      ========================= */}
      {selectedProduct && (
        <section className={styles.section}>
          <h3>Opções — {selectedProduct.name}</h3>

          <form onSubmit={createOption} className={styles.form}>
            <input
              placeholder="Ex: Médio / 250ml"
              value={optionForm.label}
              onChange={(e) =>
                setOptionForm({ ...optionForm, label: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Preço"
              value={optionForm.price}
              onChange={(e) =>
                setOptionForm({ ...optionForm, price: e.target.value })
              }
            />
            <input
              placeholder="Imagem (opcional)"
              value={optionForm.image_url}
              onChange={(e) =>
                setOptionForm({ ...optionForm, image_url: e.target.value })
              }
            />
            <button type="submit">Criar opção</button>
          </form>

          <ul className={styles.optionList}>
            {options.map((o) => (
              <li key={o.id}>
                {o.label} — R$ {Number(o.price).toFixed(2)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
