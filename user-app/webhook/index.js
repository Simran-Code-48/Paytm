const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 8090;

app.use(cors())
app.use(bodyParser.json());
let con;
async function connectToDatabase() {
  try {
      con = await mysql.createConnection();
      console.log('Connected to the database');
  } catch (error) {
      console.error('Failed to connect to the database:', error);
  }
}
connectToDatabase();

app.get('/paytm/background', async (req, res) => {
    try {
        const [users] = await con.query('Select * from users ');
        const [transactions] = await con.query('Select * from transactions ');
        const [bankusers] = await con.query('Select * from bankusers ');
        const [banktransactions] = await con.query('Select * from banktransactions ');
        res.status(200).json({users, transactions, bankusers, banktransactions});
    } catch (error) {
        res.status(500).json({message:'internal server error'});
    }
})

app.post('/paytm.webhook', async (req, res) => {
    try {
        console.log('Received webhook payload:', req.body);
        const { txnId } = req.body;
        const [transaction, transaction_fields] = await con.query('SELECT * FROM Transactions WHERE id = ? AND status = ?', [txnId, 'pending']);
        if (transaction.length==0) {
            return res.status(404).json({ error: 'Transaction not found or already processed' });
        }
        // console.log(transaction)
        //transaction = {id, sender, receiver, amount, date_time, status, description, sender_balance, receiver_balance};
        const {amount, receiver} = transaction[0];
        try {
            // Begin transaction
            await con.beginTransaction();
            await con.query('UPDATE Users SET balance = balance + ? WHERE id = ?', [amount, receiver]);
            await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['success', txnId]);
            await con.commit();
            res.status(200).json({ message: 'Transaction successful' });
        } catch (e) {
            // Rollback transaction on error
            await con.rollback();
            await con.query('UPDATE Transactions SET status = ? WHERE id = ?', ['failed', txnId]);
            console.error('Error processing transaction:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error processing webhook payload:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/paytm/webhook', async (req, res) => {
    try {
        console.log('Received webhook payload:', req.body);
        const { txnId } = req.body;
        const transaction = await Transaction.findOne({ _id: txnId, status: 'pending' });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or already processed' });
        }

        const { amount, receiver } = transaction;

        try {
            // Begin transaction
            const session = await mongoose.startSession();
            session.startTransaction();

            // Update user balance
            await User.updateOne({ _id: receiver }, { $inc: { balance: amount } });

            // Update transaction status
            await Transaction.updateOne({ _id: txnId }, { status: 'success' });

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: 'Transaction successful' });
        } catch (e) {
            // Rollback transaction on error
            await session.abortTransaction();
            console.error('Error processing transaction:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error processing webhook payload:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Paytm Webhook runnning on PORT ${port}`);
});
