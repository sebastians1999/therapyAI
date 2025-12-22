import React {useState} from 'react'
import { Link } from 'react-router-dom'
import '../css/Signup.css'
import { useState } from 'react'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState('')

  return (
    <div>
      <form>
        <h2>Signup To Start!</h2>
        <p>Already have an account? <Link to="/signin">Sign in!</Link></p>
        <div>
            <input placeholder='Email' type="email" name="" id="" />
            <input placeholder='Password' type="password" name="" id="" />
            <button >Sign Up</button>
        </div>
      </form>

    </div>
  )
}

export default Signup
