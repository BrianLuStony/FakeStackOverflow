import React, { useState,useEffect } from "react";
import axios from "axios";
import Content from "./content.js"
import backgroundImage from '../welcome.png'; 
import Sidebar from "./sidebar/Sidebar.js"

export default function Welcome() {
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest,setIsGuest]=useState(false);
  const [isAdmin, setIsAdmin]=useState(false);


  const handleRegister = async () => {
    // Check if passwords match
    if (password !== passwordVerification) {
      setFeedback("Passwords do not match");
      return;
    }

    // Check if email has a valid form
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setFeedback("Email is not valid");
      return;
    }

    // Check if password contains username or email
    if (password.includes(username) || password.includes(email)) {
      setFeedback("Password cannot contain username or email");
      return;
    }
    setShowLogin(true);
    handleFormChange();
    // Save user info to database
    try {
      const response = await axios.post("http://localhost:8000/signup", {
        username,
        email,
        password,
        passwordVerify: passwordVerification,
        reputation: 0,
      });
      console.log(response);
      if (response.status === 200) {
        setFeedback("User created successfully");
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setFeedback("Email is already in use");
      } else {
        setFeedback("Failed to create user");
      }
    }
  };

  const handleLogin = async () => {
    // Save user info to database
    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });
      if (response.status === 200) {
        // document.cookie = `session=${response.data.sessionId}`;
        setFeedback("Login successful");
        setIsLoggedIn(true);
        handleFormChange();
        // Redirect to home page
      }
      if(response.data.email == "admin@admin.com"){
        setIsAdmin(true);
      }
      else{
        setIsAdmin(false);
      }
      
      setUser(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setFeedback("Incorrect email or password");
      } else {
        setFeedback("Failed to login");
      }
    }
  };
  const handleGuest = ()=>{
    // alert("GUEST LOGIN");
    setIsGuest(true);
    setIsAdmin(false);
    setUser(null);
  }

  // useEffect(() => {
  //   const fetchData = async () =>{
  //     const userData = await axios.get(`http://localhost:8000/users/${user._id}`);
  //     setUser(userData);
  //   }
  //   if(user){
  //     fetchData();
  //   }
  // }, [refresh])

  const handleFormChange = (event) => {
    setFeedback("");
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordVerification("");
    
  };

  const registrationForm = (
    <>
      <div className="inForm">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Verify Password"
          value={passwordVerification}
          onChange={(event) => setPasswordVerification(event.target.value)}
        />
        <br />
        <button className="formB" onClick={handleRegister}>Register</button>
      </div>
    </>
  );
  const loginForm = (
    <>
      <div className="inForm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <br />
        <button className="formB" onClick={handleLogin}>Login</button>
      </div>
    </>
  );
  function handleSubmit(event) {
    event.preventDefault();
    // other code to handle the form submission
  }
  const handleLogout = ()=>{
    console.log("Logged out");
    setIsLoggedIn(false);
    setIsGuest(false);
    setIsAdmin(false);
    setUser(null);
    
  };
  if(isLoggedIn || isGuest || isAdmin){
    return(
      <div>
        <Sidebar/>
        <button className="logoutButton" onClick={handleLogout}>Logout</button>
      </div>
    )
  }else{
    return (
      <section style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover',padding: 100 ,minHeight: '100vh'}}>
      <h1 id="welcome">Welcome to FakeStackOverFlow!</h1>
      <div style={{padding: '4%'}}></div>
      {showLogin ? (
        <form onSubmit={handleSubmit}>
          {loginForm}
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          {registrationForm}
        </form>
      )}
      <div>
        <button className="formB" onClick={() => setShowLogin(false)}>Register as a new user</button>
        <button className="formB" onClick={() => setShowLogin(true)}>Login as an existing user</button>
        <button className="formB" onClick={handleGuest} >Continue as Guest</button>
      </div>
      {feedback && <p style={{color:'red', fontSize: '50px'}}>{feedback}</p>}
      </section>
    );
  }
  
}
