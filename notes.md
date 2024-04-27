Bank server :
	https://netbanking.hdfcbank.com/netbanking/merchant?ClientCode=8108621&MerchantCode=PAYUAMAZON&TxnCurrency=INR&TxnAmount=1099.00&TxnScAmount=0&MerchantRefNo=kquhq7unazzk5ng3d4&SuccessStaticFlag=N&FailureStaticFlag=N&Date=06/04/2024%2007:02:39&Ref1=&Ref2=&Ref3=&Ref4=&Ref5=&DynamicUrl=https://secure.payu.in/06bbef1fa498786b599b0b7a9d2efdfd/CommonPgResponseHandler.php&CheckSum=19790327

	https://netbanking.hdfcbank.com/netbanking/

	POST http://localhost:3000/netbanking.hdfcbank.com/netbanking/
	{
		payload = { 
			"paytm_hdfc_token" : "paytm-hdfc-token",
			"amount":8,
			"txnId":11,
			"userBankId":61,
			"userBankPin":1234 
		}

		if(token fails or amount<0)
			"unauthorized"
		get connection
			if(user not exists or password not match)
				"UserId or Password is worng"
			if(update balance)
				{ txnId, status : 'success'}
			else
				{ txnId, status : 'fail'}
		"Internal Server Error"
	}
Paytm webhook server : 

	const isAuthenticated = (req.headers.authorization==='Bearer paytm-hdfc-token'); 
        if (!isAuthenticated) {
            console.log('Unauthorized request');
            return res.status(401).send('Unauthorized');
        }
        const { txnId, status } = req.body;
        if (status === 'success') {
			const connection = await pool.getConnection();
			try {
				await connection.execute('UPDATE transactions SET status = ? WHERE txnId = ?', [status, txnId]);
				const [rows] = await connection.execute('SELECT senderId FROM transactions WHERE txnId = ?', [txnId]);
				const sender_id = rows[0].senderId;
				const amount = rows[0].amount;
				await connection.execute('UPDATE bank_account SET balance = balance + ? WHERE user_id = ?', [amount, sender_id]);
			} finally {
				connection.release();
			}
        }
        res.status(200).send('received');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }

Users{
	id auto key start at 101
	username not null
	email unique not null
	password not null
	balance []
}
Transactions{
	id auto key
	from username not null
	to username not null
	amount int not null 
	date time
	status default pending
	description string
}

transfer money => {
	POST http://localhost:3001/paytm/transfer/:id
	body {
		"receiver_email":"user9@example.com",
		"amount":12,
		"password":"password9"
	}
	backend {
		put transaction entry without status(default pending)
		{increase balance with receiver_email,
		decrease balance with userid in params as id} as transaction
		if successfull without error update transaction status with success else with failed
	}
}