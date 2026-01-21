import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import styles from "./Manager.module.css";

export default function Manager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  
  // Estados para Categorias
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  // Estados para Produtos
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Estados para Opções
  const [selectedProductId, setSelectedProductId] = useState("");
  const [optionName, setOptionName] = useState("");
  const [price, setPrice] = useState("");
  const [optionImageUrl, setOptionImageUrl] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("categories"); // "categories", "products" ou "options"

  /* 🔹 CARREGAR DADOS */
  async function loadData() {
    const { data: cats } = await supabase.from("categories").select("*").order("name");
    const { data: prods } = await supabase.from("products").select("*").order("name");
    const { data: opts } = await supabase.from("product_options").select("*").order("created_at");

    setCategories(cats || []);
    setProducts(prods || []);
    setOptions(opts || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ==================== CATEGORIAS ==================== */

  /* 🔹 CRIAR/ATUALIZAR CATEGORIA */
  async function handleSubmitCategory(e) {
    e.preventDefault();

    if (!categoryName) {
      alert("Digite o nome da categoria");
      return;
    }

    setLoading(true);

    try {
      if (editingCategoryId) {
        // ATUALIZAR
        const { error } = await supabase
          .from("categories")
          .update({ name: categoryName })
          .eq("id", editingCategoryId);

        if (error) throw error;
        alert("Categoria atualizada com sucesso ✅");
        setEditingCategoryId(null);
      } else {
        // CRIAR
        const { error } = await supabase.from("categories").insert([
          { name: categoryName },
        ]);

        if (error) throw error;
        alert("Categoria criada com sucesso ✅");
      }

      setCategoryName("");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 EDITAR CATEGORIA */
  function handleEditCategory(category) {
    setCategoryName(category.name);
    setEditingCategoryId(category.id);
    window.scrollTo(0, 0);
  }

  /* 🔹 DELETAR CATEGORIA */
  async function handleDeleteCategory(id) {
    if (!window.confirm("Deseja realmente deletar esta categoria?")) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      alert("Categoria deletada com sucesso ✅");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar categoria");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 CANCELAR EDIÇÃO CATEGORIA */
  function handleCancelCategory() {
    setEditingCategoryId(null);
    setCategoryName("");
  }

  /* ==================== PRODUTOS ==================== */

  /* 🔹 CRIAR/ATUALIZAR PRODUTO */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !categoryId) {
      alert("Preencha pelo menos nome e categoria");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // ATUALIZAR
        const { error } = await supabase
          .from("products")
          .update({
            name,
            description,
            image_url: imageUrl,
            category_id: categoryId,
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Produto atualizado com sucesso ✅");
        setEditingId(null);
      } else {
        // CRIAR
        const { error } = await supabase.from("products").insert([
          {
            name,
            description,
            image_url: imageUrl,
            category_id: categoryId,
          },
        ]);

        if (error) throw error;
        alert("Produto criado com sucesso ✅");
      }

      setName("");
      setDescription("");
      setImageUrl("");
      setCategoryId("");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 EDITAR PRODUTO */
  function handleEdit(product) {
    setName(product.name);
    setDescription(product.description || "");
    setImageUrl(product.image_url || "");
    setCategoryId(product.category_id || "");
    setEditingId(product.id);
    setTab("products");
    window.scrollTo(0, 0);
  }

  /* 🔹 DELETAR PRODUTO */
  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente deletar este produto?")) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      alert("Produto deletado com sucesso ✅");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar produto");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 CANCELAR EDIÇÃO PRODUTO */
  function handleCancel() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setCategoryId("");
  }

  /* ==================== OPÇÕES ==================== */

  /* 🔹 CRIAR/ATUALIZAR OPÇÃO */
  async function handleSubmitOption(e) {
    e.preventDefault();

    if (!selectedProductId || !optionName || !price) {
      alert("Preencha produto, nome e preço");
      return;
    }

    setLoading(true);

    try {
      if (editingOptionId) {
        // ATUALIZAR
        const { error } = await supabase
          .from("product_options")
          .update({
            product_id: selectedProductId,
            option_name: optionName,
            price: Number(price),
            image_url: optionImageUrl,
          })
          .eq("id", editingOptionId);

        if (error) throw error;
        alert("Opção atualizada com sucesso ✅");
        setEditingOptionId(null);
      } else {
        // CRIAR
        const { error } = await supabase.from("product_options").insert([
          {
            product_id: selectedProductId,
            option_name: optionName,
            price: Number(price),
            image_url: optionImageUrl,
            group_name: "Opção",
          },
        ]);

        if (error) throw error;
        alert("Opção criada com sucesso ✅");
      }

      setOptionName("");
      setPrice("");
      setOptionImageUrl("");
      setSelectedProductId("");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar opção");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 EDITAR OPÇÃO */
  function handleEditOption(option) {
    setSelectedProductId(option.product_id);
    setOptionName(option.option_name);
    setPrice(option.price);
    setOptionImageUrl(option.image_url || "");
    setEditingOptionId(option.id);
    setTab("options");
    window.scrollTo(0, 0);
  }

  /* 🔹 DELETAR OPÇÃO */
  async function handleDeleteOption(id) {
    if (!window.confirm("Deseja realmente deletar esta opção?")) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("product_options").delete().eq("id", id);
      if (error) throw error;
      alert("Opção deletada com sucesso ✅");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar opção");
    } finally {
      setLoading(false);
    }
  }

  /* 🔹 CANCELAR EDIÇÃO OPÇÃO */
  function handleCancelOption() {
    setEditingOptionId(null);
    setOptionName("");
    setPrice("");
    setOptionImageUrl("");
    setSelectedProductId("");
  }

  /* 🔹 FILTRAR PRODUTOS */
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* 🔹 OBTER OPÇÕES DE PRODUTO SELECIONADO */
  const productOptions = selectedProductId 
    ? options.filter(o => o.product_id === selectedProductId)
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Gerenciar Cafeteria</h1>
        <p>Gerencie categorias, produtos e suas variantes</p>
      </div>

      {/* ABAS */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${tab === "categories" ? styles.active : ""}`}
          onClick={() => { setTab("categories"); handleCancelCategory(); }}
        >
          🏷️ Categorias
        </button>
        <button
          className={`${styles.tabButton} ${tab === "products" ? styles.active : ""}`}
          onClick={() => { setTab("products"); handleCancel(); }}
        >
          📦 Produtos
        </button>
        <button
          className={`${styles.tabButton} ${tab === "options" ? styles.active : ""}`}
          onClick={() => { setTab("options"); handleCancelOption(); }}
        >
          🎯 Opções/Variantes
        </button>
      </div>

      {/* TAB: CATEGORIAS */}
      {tab === "categories" && (
        <>
          {/* FORMULÁRIO CATEGORIA */}
          <div className={styles.formSection}>
            <h2>{editingCategoryId ? "✏️ Editar Categoria" : "➕ Nova Categoria"}</h2>
            
            <form onSubmit={handleSubmitCategory} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Café em Pó, Bebidas Quentes, Doces"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Salvando..." : editingCategoryId ? "Atualizar" : "Cadastrar"}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={handleCancelCategory}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA CATEGORIAS */}
          <div className={styles.listSection}>
            <h2>📋 Categorias Cadastradas ({categories.length})</h2>

            {categories.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhuma categoria cadastrada</p>
            ) : (
              <div className={styles.productTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Produtos</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const prodCount = products.filter(p => p.category_id === category.id).length;
                      return (
                        <tr key={category.id}>
                          <td><strong>{category.name}</strong></td>
                          <td className={styles.badge}>
                            {prodCount} produto{prodCount !== 1 ? "s" : ""}
                          </td>
                          <td className={styles.actions}>
                            <button
                              onClick={() => handleEditCategory(category)}
                              className={styles.editBtn}
                              disabled={loading}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className={styles.deleteBtn}
                              disabled={loading}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB: PRODUTOS */}
      {tab === "products" && (
        <>
          {/* FORMULÁRIO PRODUTO */}
          <div className={styles.formSection}>
            <h2>{editingId ? "✏️ Editar Produto" : "➕ Novo Produto"}</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nome do Produto *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Café em Pó"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Selecione a categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o produto..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>URL da Imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA PRODUTOS */}
          <div className={styles.listSection}>
            <h2>📋 Produtos Cadastrados ({filteredProducts.length})</h2>

            <input
              type="text"
              placeholder="🔍 Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />

            {filteredProducts.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhum produto encontrado</p>
            ) : (
              <div className={styles.productTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Descrição</th>
                      <th>Opções</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const productOpts = options.filter(o => o.product_id === product.id);
                      return (
                        <tr key={product.id}>
                          <td className={styles.productName}>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            {categories.find((c) => c.id === product.category_id)?.name || "-"}
                          </td>
                          <td className={styles.description}>
                            {product.description ? product.description.substring(0, 40) + "..." : "-"}
                          </td>
                          <td className={styles.optionsCount}>
                            <span className={styles.badge}>{productOpts.length}</span>
                          </td>
                          <td className={styles.actions}>
                            <button
                              onClick={() => handleEdit(product)}
                              className={styles.editBtn}
                              disabled={loading}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className={styles.deleteBtn}
                              disabled={loading}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB: OPÇÕES */}
      {tab === "options" && (
        <>
          {/* FORMULÁRIO OPÇÃO */}
          <div className={styles.formSection}>
            <h2>{editingOptionId ? "✏️ Editar Opção" : "➕ Nova Opção/Variante"}</h2>
            
            <form onSubmit={handleSubmitOption} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Produto *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o produto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Nome da Opção * (ex: 250g, 1kg, Premium)</label>
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Ex: 250g, 500g, 1kg"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Preço *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>URL da Imagem (opcional - pode ser diferente do produto)</label>
                <input
                  type="url"
                  value={optionImageUrl}
                  onChange={(e) => setOptionImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Salvando..." : editingOptionId ? "Atualizar" : "Cadastrar"}
                </button>
                {editingOptionId && (
                  <button
                    type="button"
                    onClick={handleCancelOption}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA OPÇÕES */}
          <div className={styles.listSection}>
            <h2>🎯 Opções/Variantes Cadastradas ({options.length})</h2>

            {options.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhuma opção cadastrada</p>
            ) : (
              <div className={styles.productTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Opção</th>
                      <th>Preço</th>
                      <th>Imagem</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((option) => {
                      const product = products.find(p => p.id === option.product_id);
                      return (
                        <tr key={option.id}>
                          <td><strong>{product?.name || "?"}</strong></td>
                          <td>{option.option_name}</td>
                          <td className={styles.price}>
                            <strong>R$ {Number(option.price).toFixed(2)}</strong>
                          </td>
                          <td className={styles.imageCol}>
                            {option.image_url ? "✅" : "❌"}
                          </td>
                          <td className={styles.actions}>
                            <button
                              onClick={() => handleEditOption(option)}
                              className={styles.editBtn}
                              disabled={loading}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteOption(option.id)}
                              className={styles.deleteBtn}
                              disabled={loading}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
