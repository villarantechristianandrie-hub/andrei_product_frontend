import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const canManage = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!canManage) return;
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const filteredProducts = products.filter((product) =>
    [product.product_name, product.description].some((value) =>
      String(value || '').toLowerCase().includes(query.trim().toLowerCase())
    )
  );
  const inventoryValue = products.reduce((total, product) => total + product.price * product.quantity, 0);

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="#inventory" aria-label="Fieldwork inventory home">
          <span className="brand-mark">F</span>
          <span>FIELDWORK<span className="brand-subtitle">PRODUCT REGISTER</span></span>
        </a>
        <div className="header-right">
          <div className="profile-chip">
            <span className="profile-avatar">{user.username.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user.username}</strong><small>{canManage ? 'Administrator' : 'Viewer'}</small></span>
          </div>
          <button className="button button-quiet" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <section className="page-heading" id="inventory">
        <div>
          <p className="eyebrow">INVENTORY / OVERVIEW</p>
          <h1>Product register</h1>
          <p className="heading-copy">A clear view of what is on hand and what it is worth.</p>
        </div>
        {canManage && <button className="button button-primary" onClick={() => setFormFor({})}>Add product <span aria-hidden="true">+</span></button>}
      </section>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

      <section className="summary-grid" aria-label="Inventory summary">
        <div className="summary-item"><span className="summary-label">PRODUCTS LISTED</span><strong>{products.length.toString().padStart(2, '0')}</strong></div>
        <div className="summary-item"><span className="summary-label">UNITS ON HAND</span><strong>{products.reduce((total, product) => total + product.quantity, 0).toLocaleString()}</strong></div>
        <div className="summary-item summary-highlight"><span className="summary-label">TOTAL STOCK VALUE</span><strong>{peso.format(inventoryValue)}</strong></div>
        <div className="summary-item"><span className="summary-label">ACCESS LEVEL</span><strong className="access-value">{canManage ? 'Manage' : 'View only'}</strong></div>
      </section>

      <section className="inventory-section">
        <div className="section-heading">
          <div><p className="eyebrow">CATALOGUE</p><h2>All products <span className="count-badge">{products.length}</span></h2></div>
          <label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><input type="search" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products" /></label>
        </div>

        <div className="table-wrap">
          {loading ? <p className="center">Loading inventory…</p> : (
            <table>
              <thead>
                <tr><th className="id-column">REF</th><th>PRODUCT</th><th>DESCRIPTION</th><th className="num">UNIT PRICE</th><th className="num">IN STOCK</th><th>ADDED</th>{canManage && <th className="actions-heading">ACTIONS</th>}</tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={canManage ? 7 : 6} className="center empty-state">{products.length ? 'No products match your search.' : 'No products have been added yet.'}</td></tr>
                )}
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="id-column">{String(p.id).padStart(3, '0')}</td>
                    <td><strong className="product-name">{p.product_name}</strong></td>
                    <td className="description-cell">{p.description || '—'}</td>
                    <td className="num price-cell">{peso.format(p.price)}</td>
                    <td className="num"><span className={`stock-count ${p.quantity === 0 ? 'stock-empty' : ''}`}>{p.quantity}</span></td>
                    <td className="date-cell">{p.created_at}</td>
                    {canManage && <td className="actions"><button className="button button-quiet button-small" onClick={() => setFormFor(p)}>Edit</button><button className="button button-delete button-small" onClick={() => handleDelete(p)}>Delete</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <footer className="table-footer"><span>{filteredProducts.length} of {products.length} products</span><span>{canManage ? 'Administrator access' : 'Read-only access'}</span></footer>
      </section>

      <footer className="page-footer"><span>FIELDWORK INVENTORY</span><span>PRODUCT DATA / PHP</span>
      </footer>

      {canManage && formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </main>
  );
}
