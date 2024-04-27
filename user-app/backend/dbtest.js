const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())
const port = 3002;

// Create a global connection
let globalConnection;

async function connectToDatabase() {
    try {
        globalConnection = await mysql.createConnection('mysql://simran:1234@127.0.0.1:3306/paytm1');
        console.log('Connected to the database');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

connectToDatabase();

// Route for insert operation
app.post('/users', async (req, res) => {
    try {
        const { name, email, password, balance } = req.body;

        // Using globalConnection.execute for insert operation
        // const [rows1, fields1] = await globalConnection.execute('INSERT INTO users (username, email, password, balance) VALUES (?, ?, ?, ?)', [name, email, password, balance]);
        // console.log('Insert operation using execute:');
        // console.log({ rows: rows1, fields: fields1 });

        // Using globalConnection.query for insert operation
        const [rows2, fields2] = await globalConnection.query('INSERT INTO users (username, email, password, balance) VALUES (?, ?, ?, ?)', [name, email, password, balance]);
        console.log('Insert operation using query:');
        console.log({ rows: rows2, fields: fields2 });

        res.json({ executeResult: rows1, queryResult: rows2 });
    } catch (error) {
        console.error('Error in insert query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for select operation
app.get('/users', async (req, res) => {
    try {
        // Using globalConnection.execute for select operation
        const [rows1, fields1] = await globalConnection.execute('SELECT * FROM users');
        console.log('Select operation using execute:');
        console.log({ rows: rows1, fields: fields1 });

        // Using globalConnection.query for select operation
        const [rows2, fields2] = await globalConnection.query('SELECT * FROM users');
        console.log('Select operation using query:');
        console.log({ rows: rows2, fields: fields2 });

        res.json({ executeResult: rows1, queryResult: rows2 });
    } catch (error) {
        console.error('Error in select query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for update operation
app.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password, balance } = req.body;

        // Using globalConnection.execute for update operation
        const [rows1, fields1] = await globalConnection.execute('UPDATE users SET username = ?, email = ?, password = ?, balance = ? WHERE id = ?', [name, email, password, balance, userId]);
        console.log('Update operation using execute:');
        console.log({ rows: rows1, fields: fields1 });

        // Using globalConnection.query for update operation
        const [rows2, fields2] = await globalConnection.query('UPDATE users SET username = ?, email = ?, password = ?, balance = ? WHERE id = ?', [name, email, password, balance, userId]);
        console.log('Update operation using query:');
        console.log({ rows: rows2, fields: fields2 });

        res.json({ executeResult: rows1, queryResult: rows2 });
    } catch (error) {
        console.error('Error in update query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for delete operation
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Using globalConnection.execute for delete operation
        const [rows1, fields1] = await globalConnection.execute('DELETE FROM users WHERE id = ?', [userId]);
        console.log('Delete operation using execute:');
        console.log({ rows: rows1, fields: fields1 });

        // Using globalConnection.query for delete operation
        const [rows2, fields2] = await globalConnection.query('DELETE FROM users WHERE id = ?', [userId]);
        console.log('Delete operation using query:');
        console.log({ rows: rows2, fields: fields2 });

        res.json({ executeResult: rows1, queryResult: rows2 });
    } catch (error) {
        console.error('Error in delete query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.listen(port, () => {
	console.log(`Server is running on PORT ${port}`);
  });

//   app.post('/paytm/transfer/:id', async (req, res) => {
//     const userId = req.params.id;
//     const {receiver_email, amount, password} = req.body;
//     // console.log({userId, receiver_email, amount, password})
//     if (!userId || !receiver_email || !amount || amount<=0 || !password) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }
//     let transactionId;
//     try {
//       const [users, users_fields] = await con.query('SELECT * FROM Users WHERE id = ? AND password = ?', [userId, password]);
//       if (users.length === 0) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//       }
//       if(users[0].balance < amount){
//         return res.status(400).json({error: 'Insufficient balance'})
//       }
//       const [receiver, receiver_fields] = await con.query('SELECT * FROM Users WHERE email = ?', [receiver_email]);
//       if (receiver.length === 0) {
//           return res.status(404).json({ error: 'Receiver not found' });
//       }
//       const [transaction, transaction_fields] = await con.query('INSERT INTO Transactions (sender, receiver, amount, sender_balance, receiver_balance, description) VALUES (?, (SELECT id FROM Users WHERE email = ?), ?, ?, (SELECT balance FROM Users WHERE email = ?) + amount, "Send Money")', [userId, receiver_email, amount, users[0].balance - amount, receiver_email]);
//       transactionId = transaction.insertId;
//       // Begin transaction
//       await con.beginTransaction();
//         await con.query('UPDATE Users SET balance = balance + ? WHERE email = ?', [amount, receiver_email]);
//         await con.query('UPDATE Users SET balance = balance - ? WHERE id = ?', [amount, userId]);
//         await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['success', transactionId]);
//       await con.commit();
//       res.status(200).json({ message: 'Transaction successful' });
//       } catch (e) {
//       // Rollback transaction on error
//       await con.rollback();
//       await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
//       console.error('Error processing transaction:', e);
//       res.status(500).json({ error: 'Internal server error' });
//     }
// });
