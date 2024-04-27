const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
app.use(cors())
app.use(bodyParser.json());
let con;
async function connectToDatabase() {
  try {
    con = await mysql.createConnection(
      "mysql://simran:1234@127.0.0.1:3306/paytm1"
    );
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}
connectToDatabase();

//paytm data
const paytm_token = "paytm-hdfc-token";
const paytmAccountId = 1001;
const otherBackendURL = "http://localhost:8090/paytm.webhook"; // Replace with the actual URL
const tokens_amount = [];

// Route for token generation
app.post("/hdfcbank.com/tokengeneration/", async (req, res) => {
  const { userId, txnId, amount } = req.body;
  console.log({ userId, txnId, amount });
  const token = jwt.sign({ userId, txnId, amount }, paytm_token); // Replace paytm_secret with your actual secret key
  tokens_amount.push({ token, amount, txnId });
  res.status(200).json({ token });
});
// app.post('/netbanking.hdfcbank.com/netbanking/:token', async (req, res) => {
//     const token = req.params.token;
//     const { userBankId, userBankPin } = req.body;

//     try {
//         const [user] = await con.query('SELECT * FROM BankUsers WHERE id = ? AND pin = ?', [userBankId, userBankPin]);
//         if (!user) {
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }

//         const tokenEntry = tokens_amount.find(entry => entry.token === token);
//         if (!tokenEntry) {
//             return res.status(404).json({ error: 'Token not found' });
//         }

//         const amount = tokenEntry.amount;
//         if (user.balance < amount) {
//             return res.status(400).json({ error: 'Insufficient balance' });
//         }

//         await con.beginTransaction();

//         // Insert transaction into BankTransactions table
//         const transactionInsert = await con.query(
//             `INSERT INTO BankTransactions (sender, receiver, amount, sender_balance, receiver_balance)
//             VALUES (?, ?, ?, ?, ?)`, [userBankId, paytmAccountId, amount, user[0].balance - amount, paytmAccountId, user[0].balance - amount]
//         );
//         const transactionId = transactionInsert.insertId;

//         // Update sender's balance
//         await con.query('UPDATE BankUsers SET balance = balance - ? WHERE id = ?', [amount, userBankId]);

//         // Update receiver's balance (Paytm account)
//         await con.query('UPDATE BankUsers SET balance = balance + ? WHERE id = ?', [amount, paytmAccountId]);

//         // Update transaction status
//         await con.query('UPDATE BankTransactions SET status = ? WHERE id = ?', ['success', transactionId]);

//         // Commit transaction
//         await con.commit();

//         // Notify other backend about successful transaction
//         await axios.post(otherBackendURL, { status: 'success', txnId: transactionId });

//         res.status(200).json({ message: 'Transaction successful' });
//     } catch (error) {
//         // Rollback transaction in case of error
//         await con.rollback();
//         console.error('Error processing transaction:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

app.post("/netbanking.hdfcbank.com/netbanking/:token", async (req, res) => {
  const token = req.params.token;
  const { userBankId, userBankPin } = req.body;
  console.log({ userBankId, userBankPin });

  try {
    const [user] = await con.query(
      "SELECT * FROM BankUsers WHERE id = ? AND pin = ?",
      [userBankId, userBankPin]
    );
    if (user.length == 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const tokenEntry = tokens_amount.find((entry) => entry.token === token);
    if (!tokenEntry) {
      return res.status(404).json({ error: "Token not found" });
    }
    console.log(user);
    const amount = tokenEntry.amount;
    if (user[0].balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const [transactionInsert, txnfields] = await con.query(
      `INSERT INTO BankTransactions (sender, receiver, amount, sender_balance, receiver_balance) 
            VALUES (?, ?, ?, ?, (SELECT balance from BankUsers where id = ?) + ?)`,
      [
        userBankId,
        paytmAccountId,
        amount,
        user[0].balance - amount,
        paytmAccountId,
        amount,
      ]
    );
    const transactionId = transactionInsert.insertId;
    await con.beginTransaction();
    await con.query("UPDATE BankUsers SET balance = balance - ? WHERE id = ?", [
      amount,
      userBankId,
    ]);
    await con.query("UPDATE BankUsers SET balance = balance + ? WHERE id = ?", [
      amount,
      paytmAccountId,
    ]);
    await con.query(
      'UPDATE BankTransactions SET status = "success" WHERE id = ?',
      [transactionId]
    );
    await con.commit();
    await axios.post(otherBackendURL, {
      status: "success",
      txnId: tokenEntry.txnId,
    });

    res.status(200).json({ message: "Transaction successful" });
  } catch (error) {
    await con.rollback();
    console.error("Error processing transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post('/netbanking.hdfcbank.com/netbanking/:token', async (req, res) => {
//     const token = req.params.token;
//     const { userBankId, userBankPin } = req.body;
//     //1. authenticate user 2. verify token 3. reduce balance from user balance 4. add balance to paytm account with id 1001 5. send success message to URL with token
// });

// app.post('/netbanking.hdfcbank.com/netbanking/:id', async (req, res) => {
//     try {
//         const { paytm_hdfc_token, amount, txnId, userBankId, userBankPin } = req.body;
//         console.log({ paytm_hdfc_token, amount, txnId, userBankId, userBankPin });

//         if (paytm_hdfc_token !== paytm_token || amount < 0) {
//             console.log({ message: 'Unauthorized' });
//             return res.status(400).json({ message: 'Unauthorized' });
//         }

//         const connection = await pool.getConnection();
//         try {
//             let [rows] = await connection.execute('SELECT phone FROM bank_account where user_id = ? and pin = ? ',
//             [userBankId, userBankPin]);

//             //if rows empty as '[]' => no user with given id and pin
//             if (rows.length === 0) {
//                 console.log({ message: 'UserId or password is Wrong' });
//                 return res.status(404).json({ message: 'UserId or Password is Wrong' });
//             }

//             console.log('user' + rows);

//             [rows] = await connection.execute('UPDATE bank_account SET balance = balance + ? WHERE user_id = ? AND pin = ? ', [amount, userBankId, userBankPin]);

//             if (rows.affectedRows === 1) {
//                 console.log({ txnId, status: 'success' });

//                 // Send success response to other backend URL
//                 await sendResponseToBackend(txnId, 'success');

//                 return res.json({ txnId, status: 'success' });
//             } else {
//                 console.log({ message: 'fail' });

//                 // Send failure response to other backend URL
//                 await sendResponseToBackend(txnId, 'fail');

//                 return res.status(400).json({ message: 'fail' });
//             }
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Internal Server Error' });
//         } finally {
//             connection.release();
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// async function sendResponseToBackend(txnId, status) {
//     const token = paytm_token;

//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//     };

//     let response;
//     let retryCount = 0;

//     while (true) {
//         try {
//             const axiosPromise = axios.post(otherBackendURL, { txnId, status }, { headers });
//             const timeoutPromise = new Promise((resolve) => {
//                 setTimeout(() => resolve({ status: 'timeout' }), 60000);
//             });

//             response = await Promise.race([axiosPromise, timeoutPromise]);

//             if (response.status === 200) {
//                 console.log('Response sent successfully');
//                 break;
//             } else if (response.status === 'timeout') {
//                 retryCount++;
//                 console.log(`No response received within 60 seconds. Retrying attempt ${retryCount}...`);
//             }
//         } catch (error) {
//             retryCount++;
//             console.error(`Error sending response: ${error.message}. Retrying attempt ${retryCount}...`);
// 			await delay(60000)
//         }
//     }
// }
// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
app.listen(port, () => {
  console.log("HDFC webhook running on PORT " + port);
});

// const express = require('express')
// const mysql = require('mysql2/promise')
// const bodyParser = require('body-parser');

// const app=express()
// const port = 3000;

// app.use(bodyParser.json());

// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'simran',
//     database: 'paytm1',
//     password: '1234',
//     connectionLimit: 10
// });
// //paytm data
// const paytm_token = 'paytm-hdfc-token';

// app.post('/netbanking.hdfcbank.com/netbanking/',async (req, res) => {
// 	try{
// 		const { paytm_hdfc_token, amount, txnId, userBankId, userBankPin } =  req.body;
// 		console.log({ paytm_hdfc_token, amount, txnId, userBankId, userBankPin })

// 		if(paytm_hdfc_token!==paytm_token || amount<0){
// 			console.log({message:'Unauthorized'})
// 			return res.status(400).json({message:'Unauthorized'});
// 		}

// 		const connection = await pool.getConnection();
// 		try{
// 			let [rows] = await connection.execute('SELECT phone FROM bank_account where user_id = ? and pin = ? ',
// 			[userBankId, userBankPin]);
// 			//if rows empty as '[]' => no user with given id and pin
// 			if(rows.length===0){
// 				console.log({message:'UserId or password is Wrong'})
// 				return res.status(404).json({message:'UserId or Password is Wrong'})
// 			}
// 			console.log('user' + rows);
// 			[rows] = await connection.execute('Update bank_account set balance = balance + ? where user_id = ? and pin = ? ',[amount, userBankId, userBankPin]);
// 			if (rows.affectedRows === 1) {
// 				console.log({ txnId, status : 'success'});
// 				return res.json({ txnId, status : 'success'});
// 			} else {
// 				console.log({ message: 'fail' });
// 				return res.status(400).json({ message: 'fail' });
// 			}
// 		}catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Internal Server Error' });
//         } finally {
//             connection.release();
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' });
// 	}
// })

// app.listen(port, () => {
// 	console.log("HDFC webhook running on PORT "+port);
// })
