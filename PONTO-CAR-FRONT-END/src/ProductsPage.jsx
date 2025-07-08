// src/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from "react";

function ProductsPage({ API_URL }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data);
      setMessage("");
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setMessage(`Erro ao carregar produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setPreco("");
    setEstoque("");
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      !nome.trim() ||
      isNaN(parseFloat(preco)) ||
      parseFloat(preco) <= 0 ||
      isNaN(parseInt(estoque)) ||
      parseInt(estoque) < 0
    ) {
      setMessage(
        "Nome, preço (positivo) e estoque (não negativo) são obrigatórios e válidos."
      );
      return;
    }

    const productData = {
      nome,
      descricao,
      preco: parseFloat(preco),
      estoque: parseInt(estoque),
    };
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentProduct.id}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            `Produto ${isEditing ? "atualizado" : "criado"} com sucesso!`
        );
        resetForm();
        fetchProducts();
      } else {
        setMessage(
          `Erro: ${
            data.message ||
            `Falha ao ${isEditing ? "atualizar" : "criar"} produto.`
          }`
        );
      }
    } catch (error) {
      console.error(`Erro ao conectar com a API (${method} produto):`, error);
      setMessage(`Erro de conexão: ${error.message}`);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setNome(product.nome);
    setDescricao(product.descricao || "");
    setPreco(product.preco);
    setEstoque(product.estoque);
    setMessage("");
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMessage("Produto deletado com sucesso!");
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage(
          `Erro ao deletar: ${data.message || "Falha ao deletar produto."}`
        );
      }
    } catch (error) {
      console.error("Erro ao conectar com a API (deletar produto):", error);
      setMessage(`Erro de conexão: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gerenciamento de Produtos
      </h1>

      {/* Formulário de Produtos */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {isEditing ? "Editar Produto" : "Adicionar Novo Produto"}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700"
            >
              Nome:
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700"
            >
              Descrição:
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="preco"
              className="block text-sm font-medium text-gray-700"
            >
              Preço:
            </label>
            <input
              type="number"
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="estoque"
              className="block text-sm font-medium text-gray-700"
            >
              Estoque:
            </label>
            <input
              type="number"
              id="estoque"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? "Salvar Edição" : "Adicionar Produto"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
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

      {/* Lista de Produtos */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Lista de Produtos
        </h2>
        {loading ? (
          <p className="text-gray-600">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li
                key={product.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-900 font-medium">
                    {product.nome}
                  </span>
                  <span className="text-gray-600 ml-2 text-sm">
                    R$ {parseFloat(product.preco).toFixed(2)}
                  </span>
                  <span className="text-gray-600 ml-2 text-sm">
                    Estoque: {product.estoque}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                  >
                    Deletar
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

export default ProductsPage;
