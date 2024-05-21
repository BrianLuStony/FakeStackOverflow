import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../index.js"; // Ensure this points to your firebase.js
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AskPage({ modifying, questionToModify, onCancel }) {
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    qTitle: modifying ? questionToModify.title : "",
    qDetail: modifying ? questionToModify.text : "",
    qTag: modifying ? questionToModify.tags.join(" ") : "", // assuming tags is an array in questionToModify
  });
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.qTitle) errors.qTitle = "Title is required";
    if (!formData.qDetail) errors.qDetail = "Detail is required";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const tagsArray = formData.qTag ? formData.qTag.split(" ").filter(tag => tag.trim() !== "") : [];

    try {
      const tagReferences = [];
      for (const tag of tagsArray) {
        const tagDocRef = doc(db, "tags", tag);
        const tagDoc = await getDoc(tagDocRef);

        if (!tagDoc.exists()) {
          await setDoc(tagDocRef, { name: tag });
        }

        tagReferences.push(tagDocRef);
      }

      const userRef = user ? doc(db, "users", user.uid) : null;

      const questionData = {
        title: formData.qTitle,
        text: formData.qDetail,
        tags: tagReferences,
        ask_date_time: serverTimestamp(),
        asked_by: userRef,
        answers: [],
        views: 0,
        votes: 0,
        last_activity: serverTimestamp(),
      };

      if (modifying) {
        const questionRef = doc(db, "questions", questionToModify.id);
        await updateDoc(questionRef, questionData);
      } else {
        await addDoc(collection(db, "questions"), questionData);
      }

      navigate('/questions'); // Redirect to questions page or desired route
    } catch (error) {
      console.error("Error adding question: ", error);
    }
  };

  if (!user) {
    return <div>Please sign in to ask a question.</div>;
  }

  return (
    <div className="max-w-4xl p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          {modifying ? "Edit Your Question" : "Ask a New Question"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="qTitle" className="block text-lg font-medium text-gray-700">
              Question Title*{" "}
              {formErrors.qTitle && (
                <span className="text-red-500 text-sm">{formErrors.qTitle}</span>
              )}
            </label>
            <input
              id="qTitle"
              name="qTitle"
              type="text"
              value={formData.qTitle}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Title"
              maxLength="100"
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Limited to 100 characters or less
            </p>
          </div>

          <div>
            <label htmlFor="qDetail" className="block text-lg font-medium text-gray-700">
              Question Text*{" "}
              {formErrors.qDetail && (
                <span className="text-red-500 text-sm">{formErrors.qDetail}</span>
              )}
            </label>
            <textarea
              id="qDetail"
              name="qDetail"
              value={formData.qDetail}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Details"
              rows="6"
              onChange={handleChange}
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              Add details about your question
            </p>
          </div>

          <div>
            <label htmlFor="qTag" className="block text-lg font-medium text-gray-700">
              Tags
              {formErrors.qTag && (
                <span className="text-red-500 text-sm">{formErrors.qTag}</span>
              )}
            </label>
            <input
              id="qTag"
              name="qTag"
              type="text"
              value={formData.qTag}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tags"
              maxLength="55"
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add keywords separated by spaces
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4">
            {modifying && (
              <>
                <button
                  type="button"
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => null}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {modifying ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
