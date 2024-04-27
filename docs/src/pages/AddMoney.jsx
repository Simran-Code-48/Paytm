import React, { useState } from 'react';
import Button from '../components/Button';
import addmoney from '../images/addmoney.jpeg'
const AddMoney = () => {
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (event) => {
	event.preventDefault();
  
	// Step 1: POST request to add money
	fetch('http://localhost:3001/paytm/addmoney/1', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		bankname: bank,
		amount: amount
	  })
	})
	.then(response => response.json())
	.then(data => {
	  // Extract URL from response
	  const netbankingURL = data.url;
  
	  // Redirect to net banking page in a new tab
	  window.open(`http://127.0.0.1:5500/user-app/frontendHTML/netbanking.html?url=${encodeURIComponent(netbankingURL)}`, '_blank');
	})
	.catch(error => console.error('Error adding money:', error));
  };
  

  return (
    <>
   <div className=" font-manrope container mx-auto h-screen w-full items-center justify-center">
      <div className=" box-border w-[600px] border bg-white p-5">
        
        <img src={addmoney}/>
        <div className="flex items-center justify-between text-4xl mt-5 mb-10">
            <span className="text-[#64748B] w-full text-center">Add Money to Wallet</span>
          </div> 
        <form onSubmit={handleSubmit}>
          <div className="mt-6">
            <label htmlFor="bank" className="font-semibold">Choose a bank</label>
            <select id="bank" className="mt-1 w-full rounded-[4px] border border-[#A0ABBB] p-2" value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Choose a bank</option>
              <option value="hdfc">HDFC bank</option>
              <option value="axis">Axis bank</option>
              <option value="sbi">SBI bank</option>
            </select>
          </div>

          <div className="mt-6">
            <label htmlFor="amount" className="font-semibold">Amount</label>
            <input type="number" id="amount" className="mt-1 w-full rounded-[4px] border border-[#A0ABBB] p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$ Enter amount" />
          </div>

          <div className="mt-6 ">
            <Button type="submit" classes="w-full rounded-md py-2" variant='orange'>Proceed</Button>
          </div>
        </form>
      </div>
    </div>
    {/* <div className="font-manrope flex h-screen w-full items-center justify-center">
      <div className="mx-auto box-border w-[365px] border bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Add money to wallet</span>
          <div className="cursor-pointer border rounded-[4px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-6">
            <label htmlFor="bank" className="font-semibold">Choose a bank</label>
            <select id="bank" className="mt-1 w-full rounded-[4px] border border-[#A0ABBB] p-2" value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Choose a bank</option>
              <option value="hdfc">HDFC bank</option>
              <option value="axis">Axis bank</option>
              <option value="sbi">SBI bank</option>
            </select>
          </div>

          <div className="mt-6">
            <label htmlFor="amount" className="font-semibold">Amount</label>
            <input type="number" id="amount" className="mt-1 w-full rounded-[4px] border border-[#A0ABBB] p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$ Enter amount" />
          </div>

          <div className="mt-6">
            <Button type="submit" classes="w-full rounded-md py-2" variant='orange'>Proceed</Button>
          </div>
        </form>
      </div>
    </div> */}
    </>
  );
};

export default AddMoney;
