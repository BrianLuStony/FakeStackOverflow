import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../index.js"; // Ensure this points to your firebase.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
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

  const handleLogin = async (e) => {
    e.preventDefault();
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

  const handleLogout = async (e) => {
    e.preventDefault();
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
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="password"
        placeholder="Verify Password"
        value={passwordVerification}
        onChange={(event) => setPasswordVerification(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handleRegister}>
        Register
      </button>
    </div>
  );

  const loginForm = (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handleLogin}>
        Login
      </button>
    </div>
  );

  if (isLoggedIn || isGuest || isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Sidebar />
      </div>
    );
  } else {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen bg-cover" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to FakeStackOverFlow!</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          {showLogin ? (
            <form>
              {loginForm}
            </form>
          ) : (
            <form>
              {registrationForm}
            </form>
          )}
          <div className="mt-4 space-y-2">
            <button className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={() => setShowLogin(false)}>
              Register as a new user
            </button>
            <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => setShowLogin(true)}>
              Login as an existing user
            </button>
            <button className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700" onClick={handleGuest}>
              Continue as Guest
            </button>
          </div>
          {feedback && <p className="mt-4 text-red-600 text-center">{feedback}</p>}
        </div>
      </section>
    );
  }
}
