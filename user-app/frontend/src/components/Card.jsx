import React from 'react'

const Card = ({classes, heading, amount, percentage, status}) => {
  // const [heading, amount, percentage, status] = ['INR','7500', 7, 'Withdraw']
  return (
		<div className={`shadow-lg px-7 rounded-xl py-5 + ${classes}`}>
					<div className='py-3 text-xl font-semibold text-gray-500'>{heading}</div>
					<div className='py-1 text-3xl font-bold'>{amount}</div>
					<div className='py-3 flex justify-between'>
						<div>{percentage}% </div>
						<div className='text-green-500 font-bold'>{status} </div>
					</div>
		</div>
  )
}

export default Card