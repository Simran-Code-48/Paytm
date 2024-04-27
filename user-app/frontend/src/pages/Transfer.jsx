import React from 'react';
import Button from '../components/Button';
import transfer from '../images/wallet-transfer.png'
const Transfer = () => {
  const handleSubmit = (event) => {
    event.preventDefault();

    // Collect form data
    const receiverMail = event.target.receiverMail.value;
    const amount = event.target.Amount.value;
    const password = event.target.Password.value;

    // Create request body
    const requestBody = {
      receiver_email: receiverMail,
      amount: amount,
      password: password
    };

    // Make POST request to API endpoint
    fetch('http://localhost:3001/paytm/transfer/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      // Handle response data if needed
      console.log('Payment successful:', data);
      alert('Payment successful!');
    })
    .catch(error => {
      console.error('Error making payment:', error);
      alert('Payment failed. Please try again.');
    });
  };

  return (
    <>
      <div className="font-manrope container mx-auto  w-full items-center justify-center">
        <div className=" box-border w-[520px]  border bg-white p-5">
          {/* <div className="flex items-center justify-between text-3xl">
            <span className="text-[#64748B] w-full text-center">Send Money</span>
          </div> */}
          <img src={transfer} className='h-[250px] mx-auto'/>
          <div className="flex items-center justify-between text-4xl mt-5 mb-10">
            <span className="text-[#64748B] w-full text-center">Send Money</span>
          </div>          <div >
            <form onSubmit={handleSubmit} className="text-left"> {/* Align the form content to the left */}
              <label htmlFor="receiverMail">Receiver Email ID:</label><br />
              <input className="mt-1 mb-5 w-full rounded-[5px] border border-[#A0ABBB] p-2" type="text" id="receiverMail" name="receiverMail" /><br />
              <label htmlFor="Amount">Amount:</label><br />
              <input className="mt-1 mb-5 w-full rounded-[4px] border border-[#A0ABBB] p-2" type="text" id="Amount" name="Amount" /><br />
              <label htmlFor="Password">Password:</label><br />
              <input className="mt-1 mb-5 w-full rounded-[4px] border border-[#A0ABBB] p-2" type="password" id="Password" name="Password" /><br />
              <hr/>
              <div >
                <Button classes='w-full rounded-md py-2' variant='orange' type="submit">Send</Button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transfer;
