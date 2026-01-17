import { useState, useEffect, useContext } from "react";
import styles from "./Manager.module.css";
import { supabase } from "../utils/supabase";
import { SessionContext } from "../context/SessionContext";

export function Manager() {
  const { session } = useContext(SessionContext);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: null, title: "", price: "", thumbnail: "", description: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("product_1v").select();
      if (error) setError(error.message);
      else setProducts(data || []);
      setLoading(false);
    }
    // only load if admin
    if (session?.user?.user_metadata?.admin) load();
  }, [session]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || form.price === "") return;
    try {
      if (editing) {
        const { error } = await supabase
          .from("product_1v")
          .update({ title: form.title, price: Number(form.price), thumbnail: form.thumbnail, description: form.description })
          .eq("id", form.id);
        if (error) throw error;
        setProducts(products.map(p => p.id === form.id ? { ...p, title: form.title, price: Number(form.price), thumbnail: form.thumbnail, description: form.description } : p));
        setEditing(false);
      } else {
        const { data, error } = await supabase
          .from("product_1v")
          .insert([{ title: form.title, price: Number(form.price), thumbnail: form.thumbnail, description: form.description }])
          .select()
          .single();
        if (error) throw error;
        setProducts([...products, data]);
      }
      setForm({ id: null, title: "", price: "", thumbnail: "", description: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    }
  }

  function handleEdit(product) {
    setForm({ id: product.id, title: product.title || "", price: product.price ?? "", thumbnail: product.thumbnail || "", description: product.description || "" });
    setEditing(true);
  }

  async function handleRemove(id) {
    try {
      const { error } = await supabase.from("product_1v").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      if (editing && form.id === id) {
        setForm({ id: null, title: "", price: "", thumbnail: "", description: "" });
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    }
  }

  if (!session) return <p>Faça login para acessar esta área.</p>;
  if (!session.user.user_metadata.admin) return <p>Você não tem permissão para acessar esta área.</p>;

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerBox}>
        <h2 className={styles.managerTitle}>Gerenciar Produtos</h2>
        {error && <div className={styles.managerError}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.managerActions}>
          <input
            name="title"
            placeholder="Nome do produto"
            value={form.title}
            onChange={handleChange}
            className={styles.managerInput}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Preço"
            value={form.price}
            onChange={handleChange}
            className={styles.managerInput}
            required
            min={0}
            step={0.01}
          />
          <input
            name="thumbnail"
            placeholder="URL da imagem (thumbnail)"
            value={form.thumbnail}
            onChange={handleChange}
            className={styles.managerInput}
          />
          <input
            name="description"
            placeholder="Descrição"
            value={form.description}
            onChange={handleChange}
            className={styles.managerInput}
          />
          <button type="submit" className={styles.managerButton}>
            {editing ? "Atualizar" : "Adicionar"}
          </button>
        </form>
        {loading ? (
          <p>Carregando produtos...</p>
        ) : (
          <ul className={styles.managerList}>
            {products.map(product => (
              <li key={product.id} className={styles.managerItem}>
                <div className={styles.managerItemInfo}>
                  <strong>{product.title}</strong> - R$ {(Number(product.price) || 0).toFixed(2)}
                  <div>{product.description}</div>
                </div>
                <div className={styles.managerItemActions}>
                  <button
                    className={styles.managerButton}
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.managerButton}
                    onClick={() => handleRemove(product.id)}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}