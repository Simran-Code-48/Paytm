const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const cors = require('cors')
const RESET = "\x1b[0m";
const RED = "\x1b[31m";


const app = express();
app.use(cors())
app.use(bodyParser.json())
const port = 3001;
//1. connect to database
let con;
async function connectToDatabase() {
  try {
    con = await mysql.createConnection(
      // "mysql://simran:1234@127.0.0.1:3306/paytm1"
      {host:"pay-transactions-simran48-testing.d.aivencloud.com",
        port:26272,
        user:"avnadmin",
        password:"AVNS_vSFi3GqvcFgfV_DhLB4"}
    );
    await con.query('Use defaultdb')
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}
connectToDatabase();
// helper functions
function getBankDetails(bankname){
  if(bankname === "hdfc"){
    return { id : 1000001, tokenUrl : "http://localhost:3000/hdfcbank.com/tokengeneration/", url:"http://localhost:3000/netbanking.hdfcbank.com/netbanking/"};
  }else if(bankname === "sbi"){
    return { id : 1000002, url : "netbanking.sbibank.com/netbanking/"};
  }
}
app.get('/', async (req, res) => {
  // Assuming connectToDatabase is an asynchronous function
  try {
    await connectToDatabase(); // Wait for the database connection to be established
    res.json({ message: "hello" });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send money to another person
app.post('/paytm/transfer/:id', async (req, res) => {
    const userId = req.params.id;
    const {receiver_email, amount, password} = req.body;
    //input validation
    if (!userId || !receiver_email || !amount || amount<=0 || !password) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    let transactionId;
    try {
      //user authentication 
      const [users, users_fields] = await con.query('SELECT * FROM Users WHERE id = ? AND password = ?', [userId, password]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      //receiver exists
      const [receiver, receiver_fields] = await con.query('SELECT * FROM Users WHERE email = ?', [receiver_email]);
      if (receiver.length === 0) {
          return res.status(404).json({ error: 'Receiver not found' });
      }
      //register transaction
      const [transaction, transaction_fields] = await con.query('INSERT INTO Transactions (sender, receiver, amount, sender_balance, receiver_balance, description) VALUES (?, ?, ?, ?, ?, "Send Money")', [userId, receiver[0].id, amount, users[0].balance, receiver[0].balance]);
      transactionId = transaction.insertId;
      // Begin transaction
      transaction_status = true;
      await con.beginTransaction();
        //balance checking
        const [query, query_fields] = await con.query('SELECT balance FROM Users WHERE id = ?', [userId]);
        if(query[0].balance < amount){
          transaction_status=false;
          await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
        }else{
          await con.query('UPDATE Users SET balance = balance + ? WHERE email = ?', [amount, receiver_email]);
          await con.query('UPDATE Users SET balance = balance - ? WHERE id = ?', [amount, userId]);
          await con.query('UPDATE Transactions SET status = ?, sender_balance = ?, receiver_balance = (Select balance from users where email = ?) + ? WHERE id = ?', ['success', query[0].balance - amount,receiver_email, amount, transactionId]);
        }
      await con.commit();
      if(transaction_status){
        res.status(200).json({ message: 'Transaction successful' });
      }else{
        res.status(200).json({ message: 'Insufficient balance' })
      }
      } catch (e) {
      // Rollback transaction on error
      await con.rollback();
      await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
      console.error('Error processing transaction:', e);
      res.status(500).json({ error: 'Internal server error' });
    }
});
// Transactions
app.get('/paytm/transactions/:id', async (req, res) => {
    const userId = req.params.id;
    try {
      const [transactions, transactions_field] = await con.query('Select * from Transactions where sender = ? OR receiver = ?',[userId, userId]);
      // console.log(transactions);
    const formattedTransactions = transactions.map(async transaction => {
        const isSender = userId == transaction.sender;
        let description = transaction.description;
        if (description === 'Send Money') {
            if (isSender) {
                const receiverInfo = await con.query('SELECT username FROM Users WHERE id = ?', [transaction.receiver]);
                const receiverUsername = receiverInfo[0][0].username;
                description = `Send Money to ${receiverUsername}`;
            } else {
                const senderInfo = await con.query('SELECT username FROM Users WHERE id = ?', [transaction.sender]);
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
  }
});
//withdraw money
app.post('/paytm/addmoney/:id', async (req, res) => {
  const userId = req.params.id;
  const { bankname, amount } = req.body;
  // console.log({userId, bank, amount };
  if (!userId || !bankname || !amount || amount<=0 ) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  const bank = getBankDetails( bankname );
  let transactionId;
  try {
    const [users, users_fields] = await con.query('SELECT * FROM Users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const [transaction, transaction_fields] = await con.query('INSERT INTO Transactions (sender, receiver, amount, sender_balance, receiver_balance, description) VALUES (?, ?, ?, ?, ? + amount, "Add Money")',  [ bank.id , userId , amount, - amount, users[0].balance]);
    txnId = transaction.insertId;
    const bankResponse = await axios.post( bank.tokenUrl, { userId : Number(userId) , txnId, amount});
    console.log(bankResponse.data.token)
    const confirmationToken = bankResponse.data.token;
    const redirectionURL = `${bank.url}${confirmationToken}`;
    res.status(200).json({url:redirectionURL})
    // res.redirect(redirectionURL);
    //post request {userId, txnId, amount} to bank to generate a confirmation token
    //in response send redirection url with token
    } catch (e) {
    await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', transactionId]);
    console.error('Error processing transaction:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});