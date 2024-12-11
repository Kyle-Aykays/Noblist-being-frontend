import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<Routes>
  <Route path='/' element={<Navigate to='/login'/>}/>
  <Route path='/home' element={<Home/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/signup' element={<Signup/>}/>
  <Route path='/profile' element={<Profile/>}/>
</Routes>
    </>
  )
}

export default App
