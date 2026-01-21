import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import styles from "./AdminProducts.module.css";

export default function AdminProducts() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  async function loadData() {
    const { data: cats } = await supabase.from("categories").select("*");
    const { data: prods } = await supabase.from("products").select("*");

    setCategories(cats || []);
    setProducts(prods || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await supabase.from("products").insert([
      {
        name,
        description,
        image_url: imageUrl,
        category_id: categoryId,
      },
    ]);

    setName("");
    setDescription("");
    setImageUrl("");
    setCategoryId("");
    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Produtos</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input placeholder="URL da imagem" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Selecione a categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button>Cadastrar</button>
      </form>

      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
