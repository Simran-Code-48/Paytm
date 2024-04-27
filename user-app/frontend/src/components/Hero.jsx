import React from 'react'
import Button from './Button'

const Hero = ({user}) => {
  return (
	<>
		<div className='container mx-auto my-20  px-4 py-2  items-center md:px-0'>
			<div className='text-5xl font-bold mb-5 text-gray-700 font-mono'>
				Good afternoon</div>
			<div className='md:flex block md:justify-between'>
				<div className='text-4xl font-bold text-gray-500 font-mono'>{user}!</div>
				<div className='flex space-x-6 md:mt-0 mt-11'>
					<Button classes='text-lg ' onClick={()=>{}}>Send</Button>
					<Button classes='text-lg' variant="orange" onClick={()=>{}}>Request</Button>
				</div>
			</div>
		</div>
	</>
  )
}

export default Hero