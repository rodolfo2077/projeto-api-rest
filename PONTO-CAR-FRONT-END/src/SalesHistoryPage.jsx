// src/SalesHistoryPage.jsx
import React, { useState, useEffect, useCallback } from "react";

function SalesHistoryPage({ API_URL }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedSaleId, setExpandedSaleId] = useState(null); // Para expandir detalhes da venda

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSales(data);
      setMessage("");
    } catch (error) {
      console.error("Erro ao buscar histórico de vendas:", error);
      setMessage(`Erro ao carregar histórico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const toggleExpand = (saleId) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  if (loading)
    return <p className="text-gray-600">Carregando histórico de vendas...</p>;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Histórico de Vendas
      </h1>
      {message && (
        <p
          className={`mt-4 mb-4 text-center ${
            message.startsWith("Erro") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
      {sales.length === 0 ? (
        <p className="text-gray-600">Nenhuma venda registrada ainda.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <ul className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <li key={sale.id} className="py-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(sale.id)}
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Venda #{sale.id} - Cliente: {sale.customer_name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Data: {new Date(sale.sale_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      R$ {parseFloat(sale.total_amount).toFixed(2)}
                    </p>
                    <span className="text-blue-500 text-sm">
                      {expandedSaleId === sale.id
                        ? "Esconder Detalhes ▲"
                        : "Ver Detalhes ▼"}
                    </span>
                  </div>
                </div>
                {expandedSaleId === sale.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Itens da Venda:
                    </h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {sale.items && sale.items.length > 0 ? (
                        sale.items.map((item, index) => (
                          <li key={index}>
                            {item.product_name} - {item.quantity} und. x R${" "}
                            {parseFloat(item.unit_price).toFixed(2)} = R${" "}
                            {(item.quantity * item.unit_price).toFixed(2)}
                          </li>
                        ))
                      ) : (
                        <li>Nenhum item encontrado.</li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SalesHistoryPage;
