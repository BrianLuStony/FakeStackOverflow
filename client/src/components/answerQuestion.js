import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db,auth } from "../index.js";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";
import { checkHyper } from "./content.js";

export default function AnswerQuestion() {
  const {questionId}= useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    answerText: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [user] = useAuthState(auth);

  useEffect(() => {}, [formData]);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handlePost(event) {
    event.preventDefault();
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
      await insertNewA(questionId, newAnswer);
      setFormData({
        answerText: "",
      });
      navigate(-1);
    }
  }

  async function insertNewA(questionId, newAnswer) {
    try {
      const answerRef = await addDoc(collection(db, "answers"), newAnswer);
      const questionRef = doc(db, "questions", questionId);
      await updateDoc(questionRef, {
        answers: arrayUnion(answerRef),
        last_activity: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding answer: ", error);
    }
  }

  return (
    <div className="max-w-lg mt-4 px-4">
      <form id="aform" className="space-y-4">
        <div className="text-gray-800">
          <h1 className="text-2xl font-semibold mb-4">Post Your Answer</h1>
          <textarea
            name="answerText"
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer..."
            value={formData.answerText}
            onChange={handleChange}
          />
          {formErrors.answerText && <p className="text-red-500">{formErrors.answerText}</p>}
        </div>
        <div className="flex justify-end">
          <button
            id="postA"
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
            onClick={handlePost}
          >
            Post Answer
          </button>
        </div>
      </form>
    </div>
  );
}
