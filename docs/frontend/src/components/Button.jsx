import React from 'react';

const Button = ({ classes='', variant, children, onClick }) => {
  let combinedClasses = ' shadow-lg py-3 font-semibold px-8 rounded-full ';

  switch (variant) {
    case 'success':
      combinedClasses += 'bg-green-700 text-white hover:bg-green-600 ';
      break;
    case 'danger':
      combinedClasses += 'bg-red-500 text-white hover:bg-red-600 ';
      break;
    case 'warning':
      combinedClasses += 'bg-yellow-500 text-white hover:bg-yellow-600 ';
      break;
    case 'orange':
      combinedClasses += 'bg-orange-600 text-white hover:bg-orange-500 ';
      break;
    default:
      combinedClasses += 'bg-gray-100 text-gray-700 hover:bg-gray-400 hover:text-white ';
      break;
  }

  // Append provided classes
  combinedClasses += classes;

  return (
    <button className={combinedClasses.trim()} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
