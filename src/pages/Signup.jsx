import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import { handleError } from '../reusable-Components/utils'
const Signup = () => {

    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
})
const handleChange = (e)=>{
    const {name, value} = e.target;
    console.log(name, value);
    const copySignupInfo = {...signupInfo};
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
}  
console.log('loginIngo ->', signupInfo);

const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
        return handleError('Name, email, and password are required');
    }
    try {
        const url = 'http://localhost:8080/auth/signup';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupInfo),
        });

        if (!response.ok) {
            const error = await response.json();
            return handleError(error.message || 'Signup failed');
        }

        const result = await response.json();
        console.log(result);
    } catch (err) {
        handleError(err.message || 'An unexpected error occurred');
    }
};


  return (
    <>
    <div className="container">
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
            <div>
                <label htmlFor="name">Name</label>
                <input 
                onChange={handleChange}
                type="text"
                name= 'name'
                autoFocus
                placeholder='Enter Your Name....'
                value={signupInfo.name}
                 />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input 
                onChange={handleChange}
                type="email"
                name= 'email'
                placeholder='Enter Your Email....'
                value={signupInfo.email} 
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                onChange={handleChange}
                type="password"
                name= 'password'
                autoFocus
                placeholder='Enter Your Password....'
                value={signupInfo.password}
                 />
            </div>
            <button type='submit'>Signup</button>
            <span>Already have an account?
                <Link to='/login'>Login</Link>
            </span>
        </form>
        <ToastContainer/>
    </div>
    </>
  )
}

export default Signup