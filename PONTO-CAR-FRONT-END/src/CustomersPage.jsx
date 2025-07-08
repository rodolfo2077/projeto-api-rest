// src/CustomersPage.jsx
import React, { useState, useEffect, useCallback } from "react";

function CustomersPage({ API_URL }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null); // Para edição

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCustomers(data);
      setMessage("");
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setMessage(`Erro ao carregar clientes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const resetForm = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setEndereco("");
    setIsEditing(false);
    setCurrentCustomer(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setMessage("O nome é obrigatório.");
      return;
    }

    const customerData = { nome, email, telefone, endereco };
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentCustomer.id}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            `Cliente ${isEditing ? "atualizado" : "criado"} com sucesso!`
        );
        resetForm();
        fetchCustomers(); // Recarrega a lista
      } else {
        setMessage(
          `Erro: ${
            data.message ||
            `Falha ao ${isEditing ? "atualizar" : "criar"} cliente.`
          }`
        );
      }
    } catch (error) {
      console.error(`Erro ao conectar com a API (${method} cliente):`, error);
      setMessage(`Erro de conexão: ${error.message}`);
    }
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    setCurrentCustomer(customer);
    setNome(customer.nome);
    setEmail(customer.email || "");
    setTelefone(customer.telefone || "");
    setEndereco(customer.endereco || "");
    setMessage(""); // Limpa mensagens anteriores
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Tem certeza que deseja deletar este cliente?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${customerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMessage("Cliente deletado com sucesso!");
        fetchCustomers();
      } else {
        const data = await response.json();
        setMessage(
          `Erro ao deletar: ${data.message || "Falha ao deletar cliente."}`
        );
      }
    } catch (error) {
      console.error("Erro ao conectar com a API (deletar cliente):", error);
      setMessage(`Erro de conexão: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gerenciamento de Clientes
      </h1>

      {/* Formulário de Clientes */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {isEditing ? "Editar Cliente" : "Adicionar Novo Cliente"}
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone:
            </label>
            <input
              type="text"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-medium text-gray-700"
            >
              Endereço:
            </label>
            <textarea
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? "Salvar Edição" : "Adicionar Cliente"}
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

      {/* Lista de Clientes */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Lista de Clientes
        </h2>
        {loading ? (
          <p className="text-gray-600">Carregando clientes...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-600">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <span className="text-gray-900 font-medium">
                    {customer.nome}
                  </span>
                  {customer.email && (
                    <span className="text-gray-600 ml-2 text-sm">
                      ({customer.email})
                    </span>
                  )}
                  {customer.telefone && (
                    <span className="text-gray-600 ml-2 text-sm">
                      Tel: {customer.telefone}
                    </span>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
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

export default CustomersPage;
