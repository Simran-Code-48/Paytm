import React from 'react';
import Button from './components/Button';
import Appbar from './components/Appbar';
import { BrowserRouter } from 'react-router-dom';
import Hero from './components/Hero';
import Balance from './components/Balance';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import AddMoney from './pages/AddMoney';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const user = 'Harkirat'
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <div >
      <BrowserRouter>
      <Appbar/>
      <Hero user={user}/>
      <ProfilePage/>
      <AddMoney/>
      <Transfer/> 
      <Balance/>
      <Transactions/>
      </BrowserRouter>
    </div>
  );
};

export default App;
