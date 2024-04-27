import React, { useState, useEffect } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Fetch transaction data from the API endpoint
    fetch('http://localhost:3001/paytm/transactions/1')
      .then(response => response.json())
      .then(data => {
        // Update state with the fetched transaction data
        setTransactions(data);
      })
      .catch(error => {
        console.error('Error fetching transaction data:', error);
      });
  }, [transactions]); // Empty dependency array to ensure useEffect runs only once on component mount

  // Function to determine status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      default:
        return '';
    }
  };
  const getcolor = (amount) => {
    amount = Number(amount);
    if(amount<0){
      return 'text-red-500';
    }
    return 'text-green-500'
  }

  return (
    <>
      <div className="container mx-auto px-4 py-2 md:px-0">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border table-fixed border-gray-200">
            <thead>
              <tr>
                <th className="min-w-[140px] px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Date</th>
                <th className="min-w-[160px] px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Time</th>
                <th className="min-w-[200px] px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Description</th>
                <th className="min-w-[200px] px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 border-b border-gray-300 bg-orange-400 text-left text-xs leading-4 font-medium text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="min-w-min px-6 py-4 border-b border-gray-200">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{transaction.time}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{transaction.description}</td>
                  <td className={`px-6 py-4 whitespace-no-wrap border-b border-gray-300 font-medium text-xl ${getcolor(transaction.amount)}`}>{(transaction.amount)>0 ? ('$'+transaction.amount ): ('-$'+-transaction.amount)}</td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{transaction.balance}</td>
                  <td className={`px-6 py-4 whitespace-no-wrap border-b border-gray-300 `}><div className={`${getStatusColor(transaction.status)} text-white p-1 text-center rounded-full font-semibold`}>{transaction.status}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Transactions;
