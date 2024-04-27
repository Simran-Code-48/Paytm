const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3001;

// Create a connection pool
const pool = mysql.createPool({
  host: "pay-transactions-simran48-testing.d.aivencloud.com",
  port: 26272,
  user: "avnadmin",
  password: "AVNS_vSFi3GqvcFgfV_DhLB4",
  database: "defaultdb",
  connectionLimit: 10 // Adjust according to your requirements
});

// Helper function to get bank details
function getBankDetails(bankname) {
  if (bankname === "hdfc") {
    return { id: 1000001, tokenUrl: "http://localhost:3000/hdfcbank.com/tokengeneration/", url: "http://localhost:3000/netbanking.hdfcbank.com/netbanking/" };
  } else if (bankname === "sbi") {
    return { id: 1000002, url: "netbanking.sbibank.com/netbanking/" };
  }
}

// Send money to another person
app.post('/paytm/transfer/:id', async (req, res) => {
  const userId = req.params.id;
  const { receiver_email, amount, password } = req.body;

  // Input validation
  if (!userId || !receiver_email || !amount || amount <= 0 || !password) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  let connection;
  let transactionId;
  try {
    connection = await pool.getConnection();

    // User authentication
    const [users, users_fields] = await connection.query('SELECT * FROM Users WHERE id = ? AND password = ?', [userId, password]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if receiver exists
    const [receiver, receiver_fields] = await connection.query('SELECT * FROM Users WHERE email = ?', [receiver_email]);
    if (receiver.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Register transaction
    const [transaction, transaction_fields] = await connection.query('INSERT INTO Transactions (sender, receiver, amount, sender_balance, receiver_balance, description) VALUES (?, ?, ?, ?, ?, "Send Money")', [userId, receiver[0].id, amount, users[0].balance, receiver[0].balance]);
    transactionId = transaction.insertId;

    // Begin transaction
    let transaction_status = true;
    await connection.beginTransaction();

    // Balance checking
    const [query, query_fields] = await connection.query('SELECT balance FROM Users WHERE id = ?', [userId]);
    if (query[0].balance < amount) {
      transaction_status = false;
      await connection.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
    } else {
      await connection.query('UPDATE Users SET balance = balance + ? WHERE email = ?', [amount, receiver_email]);
      await connection.query('UPDATE Users SET balance = balance - ? WHERE id = ?', [amount, userId]);
      await connection.query('UPDATE Transactions SET status = ?, sender_balance = ?, receiver_balance = (SELECT balance FROM users WHERE email = ?) + ? WHERE id = ?', ['success', query[0].balance - amount, receiver_email, amount, transactionId]);
    }

    await connection.commit();

    if (transaction_status) {
      res.status(200).json({ message: 'Transaction successful' });
    } else {
      res.status(200).json({ message: 'Insufficient balance' });
    }
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    await connection.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
});

// Add money to the wallet
app.post('/paytm/addmoney/:id', async (req, res) => {
  const userId = req.params.id;
  const { bankname, amount } = req.body;

  if (!userId || !bankname || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const bank = getBankDetails(bankname);
  let connection;
  try {
    connection = await pool.getConnection();

    // Perform database operations using the connection
    // Example: await connection.query(...);

    // Send a POST request to the bank API
    const bankResponse = await axios.post(bank.tokenUrl, { userId: Number(userId), amount });

    // Extract the token from the bank's response
    const confirmationToken = bankResponse.data.token;

    // Construct the redirection URL
    const redirectionURL = `${bank.url}${confirmationToken}`;

    res.status(200).json({ url: redirectionURL });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
});

// Retrieve transaction history
// Transactions
app.get('/paytm/transactions/:id', async (req, res) => {
  const userId = req.params.id;

  let connection;
  try {
    connection = await pool.getConnection();

    const [transactions, transactions_field] = await connection.query('Select * from Transactions where sender = ? OR receiver = ?', [userId, userId]);
    
    const formattedTransactions = transactions.map(async transaction => {
        const isSender = userId == transaction.sender;
        let description = transaction.description;
        if (description === 'Send Money') {
            if (isSender) {
                const receiverInfo = await connection.query('SELECT username FROM Users WHERE id = ?', [transaction.receiver]);
                const receiverUsername = receiverInfo[0][0].username;
                description = `Send Money to ${receiverUsername}`;
            } else {
                const senderInfo = await connection.query('SELECT username FROM Users WHERE id = ?', [transaction.sender]);
                const senderUsername = senderInfo[0][0].username;
                description = `Receive Money from ${senderUsername}`;
            }
        }
        const date_time = new Date(transaction.date_time);
        const date = date_time.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = date_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const amount = isSender ? -transaction.amount : transaction.amount;
        const balance = isSender ? transaction.sender_balance : transaction.receiver_balance;
        const status = transaction.status;
        return { description, date, time, amount, balance, status };
    });
    const formattedTransactionsResult = await Promise.all(formattedTransactions);
    res.json(formattedTransactionsResult);
  } catch (error) {
      console.error('Error fetching and formatting transaction data:', error);
      res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
});

// Root route
app.get('/', async (req, res) => {
  try {
    res.json({ message: "hello" });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Listen for incoming requests
app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
