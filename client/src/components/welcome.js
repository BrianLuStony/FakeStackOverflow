import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../index.js"; // Ensure this points to your firebase.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc ,serverTimestamp} from "firebase/firestore";
import backgroundImage from '../welcome.png'; 
import Sidebar from "./sidebar/Sidebar";

export default function Welcome() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        navigate('/questions');
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordVerification) {
      setFeedback("Passwords do not match");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setFeedback("Email is not valid");
      return;
    }

    if (password.includes(username) || password.includes(email)) {
      setFeedback("Password cannot contain username or email");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        reputation: 0,
        register_date: serverTimestamp(),
        created_tags: []
      });
      setFeedback("User created successfully");
      setShowLogin(true);
      handleFormChange();
      navigate('/questions');
    } catch (err) {
      console.error(err);
      setFeedback("Failed to create user");
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFeedback("Login successful");
      setIsLoggedIn(true);
      handleFormChange();

      if (user.email === "admin@admin.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setUser(user);
      navigate('/questions'); // Redirect to the desired route
    } catch (err) {
      console.error(err);
      setFeedback("Incorrect email or password");
    }
  };

  const handleGuest = () => {
    setIsGuest(true);
    setIsAdmin(false);
    setUser(null);
    navigate('/questions');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsGuest(false);
      setIsAdmin(false);
      setUser(null);
      console.log("Logged out");
    } catch (err) {
      console.error(err);
      setFeedback("Failed to log out");
    }
  };

  const handleFormChange = () => {
    setFeedback("");
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordVerification("");
  };

  const registrationForm = (
    <div className="inForm">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="input"
      />
      <br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="input"
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="input"
      />
      <br />
      <input
        type="password"
        placeholder="Verify Password"
        value={passwordVerification}
        onChange={(event) => setPasswordVerification(event.target.value)}
        className="input"
      />
      <br />
      <button className="formB" onClick={handleRegister}>Register</button>
    </div>
  );

  const loginForm = (
    <div className="inForm">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="input"
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="input"
      />
      <br />
      <button className="formB" onClick={handleLogin}>Login</button>
    </div>
  );

  if (isLoggedIn || isGuest || isAdmin) {
    return (
      <div>
        <Sidebar />
        <button className="logoutButton" onClick={handleLogout}>Logout</button>
      </div>
    );
  } else {
    return (
      <section style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', padding: 100, minHeight: '100vh' }}>
        <h1 id="welcome">Welcome to FakeStackOverFlow!</h1>
        <div style={{ padding: '4%' }}></div>
        {showLogin ? (
          <form>
            {loginForm}
          </form>
        ) : (
          <form>
            {registrationForm}
          </form>
        )}
        <div>
          <button className="formB" onClick={() => setShowLogin(false)}>Register as a new user</button>
          <button className="formB" onClick={() => setShowLogin(true)}>Login as an existing user</button>
          <button className="formB" onClick={handleGuest}>Continue as Guest</button>
        </div>
        {feedback && <p style={{ color: 'red', fontSize: '50px' }}>{feedback}</p>}
      </section>
    );
  }
}
