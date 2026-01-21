import styles from "./ProductList.module.css";
import { CircularProgress } from "@mui/material";
import { Product } from "./Product";
import { useState, useContext, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";

export function ProductList() {
  
  const { products, loading, error } = useContext(CartContext);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const searchInput = useRef(null);

  useEffect(() => {
    if(products) {
      setFilteredProducts(products);
    }
  }, [products]);

  function handleSearch() {
    const query = searchInput.current.value.toLowerCase();
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          (product.name && product.name.toLowerCase().includes(query)) || 
          (product.description && product.description.toLowerCase().includes(query))
        )
      );
    }
  }

  function handleClear() {
    searchInput.current.value = "";
    setFilteredProducts(products);
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          ref={searchInput}
          type="text"
          placeholder="Search products..."
          className={styles.searchInput}
          onChange={handleSearch}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          OK
        </button>
        <button className={styles.clearButton} onClick={handleClear}>
          CLEAR
        </button>
      </div>
      <div className={styles.productList}>
        {filteredProducts.map((product) => (
          <Product 
            key={product.id} 
            product={product}
            isExpanded={expandedProductId === product.id}
            onExpand={() => setExpandedProductId(product.id)}
            onClose={() => setExpandedProductId(null)}
          />
        ))}
      </div>
      {loading && (
        <div>
          <CircularProgress
            thickness={5}
            style={{ margin: "2rem auto", display: "block" }}
            sx={{ color: "#001111" }}
          />
          <p>Loading products...</p>
        </div>
      )}
      {error && <p>❌ {error}</p>}
    </div>
  );
}