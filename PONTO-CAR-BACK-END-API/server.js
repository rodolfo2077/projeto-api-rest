import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

let connection;

// --- Conexão e Inicialização do Banco de Dados ---
async function initializeDatabase() {
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "SalesSystemDB", // <-- **MUITO IMPORTANTE:** Use este nome de banco de dados!
    });
    console.log("🎉 Conectado ao MySQL com sucesso!");

    // --- Criação das Tabelas ---
    // (A ordem é importante devido às chaves estrangeiras)

    // Tabela de Clientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NULL,
        telefone VARCHAR(20) NULL,
        endereco TEXT NULL
      )
    `);
    console.log('Tabela "customers" verificada/criada.');

    // Tabela de Produtos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        estoque INT NOT NULL DEFAULT 0
      )
    `);
    console.log('Tabela "products" verificada/criada.');

    // Tabela de Vendas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela "sales" verificada/criada.');

    // Tabela de Itens de Venda (detalhes de cada venda)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela "sale_items" verificada/criada.');

  } catch (error) {
    console.error('❌ Erro ao conectar ou inicializar o banco de dados:', error);
    process.exit(1);
  }
}

// --- Rotas da API ---

// --- Rotas para Clientes (Customers) ---
app.post('/customers', async (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  if (!nome) {
    return res.status(400).json({ message: 'Nome do cliente é obrigatório.' });
  }
  try {
    const [result] = await connection.execute(
      'INSERT INTO customers (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)',
      [nome, email || null, telefone || null, endereco || null]
    );
    res.status(201).json({ id: result.insertId, nome, email, telefone, endereco, message: 'Cliente criado com sucesso!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) { // Verificação mais robusta para UNIQUE email
      return res.status(409).json({ message: 'Este email já está cadastrado para outro cliente.' });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar cliente.' });
  }
});

app.get('/customers', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM customers');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar clientes.' });
  }
});

app.get('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.execute('SELECT * FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter cliente.' });
  }
});

app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, endereco } = req.body;
  if (!nome) { // Nome ainda é obrigatório para PUT
    return res.status(400).json({ message: 'Nome do cliente é obrigatório.' });
  }
  try {
    const [result] = await connection.execute(
      'UPDATE customers SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
      [nome, email || null, telefone || null, endereco || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json({ id, nome, email, telefone, endereco, message: 'Cliente atualizado com sucesso!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) {
      return res.status(409).json({ message: 'Este email já está cadastrado para outro cliente.' });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar cliente.' });
  }
});

app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar cliente.' });
  }
});

// --- Rotas para Produtos (Products) ---
app.post('/products', async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  if (!nome || preco === undefined || isNaN(preco) || estoque === undefined || isNaN(estoque)) {
    return res.status(400).json({ message: 'Nome, preço e estoque são obrigatórios para o produto.' });
  }
  try {
    const [result] = await connection.execute(
      'INSERT INTO products (nome, descricao, preco, estoque) VALUES (?, ?, ?, ?)',
      [nome, descricao || null, parseFloat(preco), parseInt(estoque)]
    );
    res.status(201).json({ id: result.insertId, nome, descricao, preco, estoque, message: 'Produto criado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar produto.' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM products');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar produtos.' });
  }
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter produto por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter produto.' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, estoque } = req.body;
  if (!nome || preco === undefined || isNaN(preco) || estoque === undefined || isNaN(estoque)) {
    return res.status(400).json({ message: 'Nome, preço e estoque são obrigatórios para o produto.' });
  }
  try {
    const [result] = await connection.execute(
      'UPDATE products SET nome = ?, descricao = ?, preco = ?, estoque = ? WHERE id = ?',
      [nome, descricao || null, parseFloat(preco), parseInt(estoque), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.status(200).json({ id, nome, descricao, preco, estoque, message: 'Produto atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto.' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar produto.' });
  }
});

// --- Rotas para Vendas (Sales) ---
app.post('/sales', async (req, res) => {
  const { customer_id, items } = req.body;

  if (!customer_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'ID do cliente e itens da venda são obrigatórios.' });
  }

  let total_amount = 0;
  let productsToUpdate = [];

  try {
    // 1. Verificar produtos e calcular total
    for (const item of items) {
      const [productRows] = await connection.execute('SELECT nome, preco, estoque FROM products WHERE id = ?', [item.product_id]);
      if (productRows.length === 0) {
        return res.status(404).json({ message: `Produto com ID ${item.product_id} não encontrado.` });
      }
      const product = productRows[0];
      if (product.estoque < item.quantity) {
        return res.status(400).json({ message: `Estoque insuficiente para o produto ${product.nome}. Disponível: ${product.estoque}, Solicitado: ${item.quantity}.` });
      }
      total_amount += product.preco * item.quantity;
      productsToUpdate.push({ id: item.product_id, newStock: product.estoque - item.quantity });
    }

    // 2. Criar a Venda principal
    const [saleResult] = await connection.execute(
      'INSERT INTO sales (customer_id, total_amount) VALUES (?, ?)',
      [customer_id, total_amount]
    );
    const saleId = saleResult.insertId;

    // 3. Inserir os Itens de Venda e atualizar estoque
    for (const item of items) {
      const [productPriceRow] = await connection.execute('SELECT preco FROM products WHERE id = ?', [item.product_id]);
      const unit_price = productPriceRow[0].preco;

      await connection.execute(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, unit_price]
      );

      const productUpdate = productsToUpdate.find(p => p.id === item.product_id);
      if (productUpdate) {
        await connection.execute('UPDATE products SET estoque = ? WHERE id = ?', [productUpdate.newStock, item.product_id]);
      }
    }

    res.status(201).json({ id: saleId, customer_id, total_amount, items, message: 'Venda criada com sucesso!' });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar venda.' });
  }
});

app.get('/sales', async (req, res) => {
  try {
    const [sales] = await connection.execute(`
      SELECT
        s.id,
        s.sale_date,
        s.total_amount,
        c.nome AS customer_name,
        c.email AS customer_email
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.sale_date DESC
    `);

    for (const sale of sales) {
      const [items] = await connection.execute(`
        SELECT
          si.quantity,
          si.unit_price,
          p.nome AS product_name
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `, [sale.id]);
      sale.items = items;
    }

    res.status(200).json(sales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar vendas.' });
  }
});

app.get('/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [sales] = await connection.execute(`
      SELECT
        s.id,
        s.sale_date,
        s.total_amount,
        c.nome AS customer_name,
        c.email AS customer_email
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (sales.length === 0) {
      return res.status(404).json({ message: 'Venda não encontrada.' });
    }

    const sale = sales[0];
    const [items] = await connection.execute(`
      SELECT
        si.quantity,
        si.unit_price,
        p.nome AS product_name,
        p.descricao AS product_description
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [sale.id]);
    sale.items = items;

    res.status(200).json(sale);
  } catch (error) {
    console.error('Erro ao obter venda por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter venda.' });
  }
});


// --- Inicialização do Servidor ---
async function startServer() {
  const PORT = process.env.PORT || 3000;
  await initializeDatabase(); // Garante que o banco de dados esteja pronto antes de iniciar o servidor

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}!`);
    console.log(`Acesse: http://localhost:${PORT}`);
  });
}

startServer();

// Gerenciamento de encerramento para fechar a conexão com o banco de dados
process.on('SIGINT', async () => {
  console.log('\nDesconectando do MySQL...');
  if (connection) {
    await connection.end();
  }
  console.log('Conexão com MySQL encerrada.');
  process.exit(0);
});