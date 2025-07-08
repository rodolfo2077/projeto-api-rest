// src/App.jsx
import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomersPage from "./CustomersPage"; // Novo componente
import ProductsPage from "./ProductsPage"; // Novo componente
import SalesPage from "./SalesPage"; // Novo componente para fazer vendas
import SalesHistoryPage from "./SalesHistoryPage"; // Novo componente para histórico/finanças
import "./index.css";

function App() {
  const API_BASE_URL = "http://localhost:3000"; // URL base para a API

  return (
    <Router>
      <div className="h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4 shadow-lg">
          <div className="text-2xl font-bold mb-8 text-center text-blue-400">
            Ponto Car - Elétrica Automotiva
          </div>
          <nav className="flex-grow">
            <ul>
              <li className="mb-4">
                <Link
                  to="/customers"
                  className="block p-3 rounded-md text-lg hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  Clientes
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  to="/products"
                  className="block p-3 rounded-md text-lg hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  Produtos
                </Link>
              </li>
              <li className="mb-4 border-t border-gray-700 pt-4 mt-4">
                <Link
                  to="/make-sale"
                  className="block p-3 rounded-md text-lg hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  Fazer Venda
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  to="/sales-history"
                  className="block p-3 rounded-md text-lg hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  Histórico de Vendas
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-8 flex justify-center items-start">
          <Routes>
            <Route
              path="/customers"
              element={<CustomersPage API_URL={`${API_BASE_URL}/customers`} />}
            />
            <Route
              path="/products"
              element={<ProductsPage API_URL={`${API_BASE_URL}/products`} />}
            />
            <Route
              path="/make-sale"
              element={<SalesPage API_BASE_URL={API_BASE_URL} />}
            />
            <Route
              path="/sales-history"
              element={<SalesHistoryPage API_URL={`${API_BASE_URL}/sales`} />}
            />
            {/* Rota padrão ao carregar */}
            <Route
              path="/"
              element={<CustomersPage API_URL={`${API_BASE_URL}/customers`} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
