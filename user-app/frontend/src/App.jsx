import React from 'react';
import Button from './components/Button';
import Appbar from './components/Appbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <Routes>
          <Route path="/" element={<><Hero user={user}/><Balance/><Transactions/></>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/add-money" element={<AddMoney />} />
          {/* Add more routes for other pages as needed */}
        </Routes>
      {/* <Hero user={user}/>
      <ProfilePage/>
      <AddMoney/>
      <Transfer/>  */}
      
      </BrowserRouter>
    </div>
  );
};

export default App;