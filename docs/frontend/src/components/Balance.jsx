import React from 'react';
import Card from './Card';

const Balance = () => {
  return (
    <>
      <div className='container mx-auto  py-2 '>
        <div className='text-xl font-bold text-gray-800'>Balance</div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 py-10'>
          {/* Each Card should adjust automatically based on screen size */}
          <Card classes='col-span-1' heading='USD' amount='7,500' percentage='4' status='Withdraw'/>
          <Card classes='col-span-1' heading='INR' amount='1,00,000' percentage='7' status='Withdraw'/>
          <Card classes='col-span-1' heading='EUR' amount='10,500' percentage='9' status='Withdraw'/>
        </div>
      </div>
    </>
  );
};

export default Balance;
