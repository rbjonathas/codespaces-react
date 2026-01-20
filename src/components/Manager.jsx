import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function Manager() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");

  const [groupName, setGroupName] = useState("");
  const [optionName, setOptionName] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  /* 🔹 CARREGAR PRODUTOS */
  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("id, name")
        .order("name");

      setProducts(data || []);
    }

    loadProducts();
  }, []);

  /* 🔹 CRIAR OPÇÃO (VARIANTE) */
  async function createOption(e) {
    e.preventDefault();

    if (!productId || !optionName || !price) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("product_options")
      .insert([
        {
          product_id: productId,
          group_name: groupName || "Opção",
          option_name: optionName,
          price: Number(price),
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erro ao criar opção");
      return;
    }

    setOptionName("");
    setPrice("");
    alert("Opção criada com sucesso ✅");
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Gerenciar Opções do Produto</h2>

      <form onSubmit={createOption}>
        <label>Produto</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Selecione</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Grupo (ex: Tamanho, Tipo)</label>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Tamanho"
        />

        <label>Opção</label>
        <input
          value={optionName}
          onChange={(e) => setOptionName(e.target.value)}
          placeholder="300ml"
        />

        <label>Preço</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Salvando..." : "Criar opção"}
        </button>
      </form>
    </div>
  );
}
