// src/SalesPage.jsx
import React, { useState, useEffect, useCallback } from "react";

function SalesPage({ API_BASE_URL }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]); // { product_id, name, price, quantity, stock_available }
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/customers`),
        fetch(`${API_BASE_URL}/products`),
      ]);

      if (!customersRes.ok)
        throw new Error(`HTTP error! Customers status: ${customersRes.status}`);
      if (!productsRes.ok)
        throw new Error(`HTTP error! Products status: ${productsRes.status}`);

      const customersData = await customersRes.json();
      const productsData = await productsRes.json();

      setCustomers(customersData);
      setProducts(productsData);
      setMessage("");
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      setMessage(`Erro ao carregar clientes/produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAddProductToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      setMessage("Selecione um produto e uma quantidade válida.");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProduct));
    if (!product) {
      setMessage("Produto não encontrado.");
      return;
    }

    if (quantity > product.estoque) {
      setMessage(
        `Estoque insuficiente para ${product.nome}. Disponível: ${product.estoque}`
      );
      return;
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      (item) => item.product_id === product.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
      if (newQuantity > product.estoque) {
        setMessage(`Quantidade total para ${product.nome} excede o estoque.`);
        return;
      }
      updatedCart[existingItemIndex].quantity = newQuantity;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart((prevCart) => [
        ...prevCart,
        {
          product_id: product.id,
          name: product.nome,
          price: parseFloat(product.preco),
          quantity: quantity,
          stock_available: product.estoque,
        },
      ]);
    }
    setMessage("");
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleFinalizeSale = async () => {
    if (!selectedCustomer) {
      setMessage("Selecione um cliente para finalizar a venda.");
      return;
    }
    if (cart.length === 0) {
      setMessage("Adicione produtos ao carrinho antes de finalizar a venda.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomer),
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Venda finalizada com sucesso!");
        setSelectedCustomer("");
        setCart([]);
        // Optional: Re-fetch products to show updated stock
        fetchInitialData();
      } else {
        setMessage(
          `Erro ao finalizar venda: ${
            data.message || "Falha ao finalizar venda."
          }`
        );
      }
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      setMessage(`Erro de conexão: ${error.message}`);
    }
  };

  if (loading) return <p>Carregando dados para venda...</p>;

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Fazer uma Nova Venda
      </h1>

      {/* Seleção de Cliente */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          1. Selecione o Cliente
        </h2>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Selecione um Cliente --</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.nome} {customer.email ? `(${customer.email})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Adicionar Produtos à Venda */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          2. Adicionar Produtos
        </h2>
        <div className="flex space-x-4 mb-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Selecione um Produto --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nome} (R$ {parseFloat(product.preco).toFixed(2)}) -
                Estoque: {product.estoque}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            } // Garante qtde mínima de 1
            min="1"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddProductToCart}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Adicionar ao Carrinho
          </button>
        </div>

        {/* Carrinho de Compras */}
        {cart.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Carrinho:
            </h3>
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li
                  key={item.product_id}
                  className="py-2 flex justify-between items-center text-gray-800"
                >
                  <span>
                    {item.name} x {item.quantity} (R$ {item.price.toFixed(2)}{" "}
                    cada)
                  </span>
                  <button
                    onClick={() => handleRemoveFromCart(item.product_id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right text-2xl font-bold text-gray-800">
              Total: R$ {calculateTotal()}
            </div>
          </div>
        )}
      </div>

      {/* Finalizar Venda */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          3. Finalizar Venda
        </h2>
        <button
          onClick={handleFinalizeSale}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Finalizar Venda
        </button>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.startsWith("Erro") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default SalesPage;
