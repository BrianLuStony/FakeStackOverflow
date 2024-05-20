import { checkHyper } from "./content.js";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../index.js";
import { useLocation } from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";

export default function AnswerQuestion() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const questionId = searchParams.get('questionId');

  const [formData, setFormData] = useState({
    answerText: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {}, [formData]);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handlePost(event) {
    const [user] = useAuthState(auth);
    event.preventDefault(); // prevent form from reloading
    const errors = {};

    if (formData.answerText.trim().length === 0) {
      errors.answerText = "Answer text should not be empty";
    } else {
      checkHyper(formData.answerText, errors);
    }

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      const userRef = user ? doc(db, "users", user.uid) : null;
      const newAnswer = {
        text: formData.answerText,
        ans_by: userRef,
        ans_date_time: serverTimestamp(),
      };
      await insertNewA(questionId, newAnswer); // Changed question.id to questionId
      setFormData({
        answerText: "",
      });
      navigate(`/question?questionId=${questionId}`);
    }
  }

  async function insertNewA(questionId, newAnswer) { // Changed question.id to questionId
    try {
      const answerRef = await addDoc(collection(db, "answers"), newAnswer);
      const questionRef = doc(db, "questions", questionId);
      await updateDoc(questionRef, {
        answers: arrayUnion(answerRef)
      });
    } catch (error) {
      console.error("Error adding answer: ", error);
    }
  }

  return (
    <div id="answerpage">
      <form id="aform">
        <div id="answertext">
          <h1>
            Answer Text*{" "}
            {formErrors.answerText && (
              <span style={{ color: "red" }}>{formErrors.answerText}</span>
            )}
          </h1>
          <textarea
            name="answerText"
            type="text"
            role="combobox"
            className="answertext"
            aria-expanded="false"
            placeholder="Text"
            autoComplete="off"
            onChange={handleChange}
          />
          <div style={{ display: "inline-block", width: "150%" }}>
            <button id="postA" type="submit" className="postA" onClick={handlePost}>
              Post Answer
            </button>
            <span
              style={{
                marginLeft: "30%",
                marginTop: "20px",
                color: "red",
                fontSize: "25px",
              }}
            >
              *indicates mandatory fields
              <br />
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
