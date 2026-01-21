import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import styles from "./AdminCategories.module.css";

export default function AdminCategories() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return;

    await supabase.from("categories").insert([{ name }]);
    setName("");
    loadCategories();
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Categorias</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button>Cadastrar</button>
      </form>

      <ul>
        {categories.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
