import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../index.js";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDateString } from "./content.js";

export default function QuestionPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const questionId = searchParams.get('questionId');
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [tags, setTags] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionDoc = await getDoc(doc(db, "questions", questionId));
        if (questionDoc.exists()) {
          const questionData = questionDoc.data();
          setQuestion({ id: questionDoc.id, ...questionData });

          // Fetch tags
          const tagPromises = questionData.tags.map(async (tagRef) => {
            const tagDoc = await getDoc(tagRef);
            if (tagDoc.exists()) {
              return { id: tagDoc.id, ...tagDoc.data() };
            }
            return null;
          });
          const tagsList = await Promise.all(tagPromises);
          setTags(tagsList.filter(tag => tag !== null));

          // Fetch answers
          const answerPromises = questionData.answers.map(async (answerRef) => {
            const answerDoc = await getDoc(answerRef);
            if (answerDoc.exists()) {
              return { id: answerDoc.id, ...answerDoc.data() };
            }
            return null;
          });
          const answersList = await Promise.all(answerPromises);
          setAnswers(answersList.filter(answer => answer !== null));
        } else {
          console.log("No such question!");
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleVote = async (itemId, type, itemType) => {
    if (!user) return;

    const itemRef = doc(db, itemType === 'question' ? "questions" : "answers", itemId);
    const voteChange = type === 'upvote' ? increment(1) : increment(-1);

    await updateDoc(itemRef, { votes: voteChange });

    if (itemType === 'question') {
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        votes: prevQuestion.votes + (type === 'upvote' ? 1 : -1),
      }));
    } else {
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer.id === itemId
            ? { ...answer, votes: answer.votes + (type === 'upvote' ? 1 : -1) }
            : answer
        )
      );
    }
  };

  const handleAnswerClick = () => {
    navigate(`/question/${questionId}/answerquestion`);
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div id="inQ" className="max-w-4xl py-8 px-4">
      <div id="A" className="bg-white shadow rounded-lg p-6">
        <div id="abody" className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div id="aleft" className="col-span-1">
            <h2 className="text-xl font-semibold mb-4">{answers.length} answers</h2>
            <h2 className="text-xl font-semibold mt-20">{question.views} views</h2>
          </div>
          <div id="amiddle" className="col-span-2">
            <div id="Qname">
              <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
            </div>
            <div id="Qdescript" className="mb-6">
              <p className="text-lg mb-4">{question.text}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag.id} className="bg-gray-200 text-gray-800 text-sm font-medium px-2 py-1 rounded">{tag.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div id="aright" className="col-span-1 flex flex-col items-center">
            <div className="votecell flex flex-col items-center mb-6">
              <button
                className="vbutton bg-blue-500 text-white font-bold py-1 px-2 rounded mb-2"
                onClick={() => handleVote(question.id, 'upvote', 'question')}
              >
                Upvote
              </button>
              <div className="vcount text-lg font-semibold">{question.votes}</div>
              <button
                className="vbutton bg-red-500 text-white font-bold py-1 px-2 rounded mt-2"
                onClick={() => handleVote(question.id, 'downvote', 'question')}
              >
                Downvote
              </button>
            </div>
            <div className="auName text-center">
              <span className="text-red-500 font-medium">{question.asked_by.username}</span>
              <br />
              <span className="text-gray-500">
                {getDateString(question.ask_date_time)}
              </span>
            </div>
          </div>
        </div>
        <div className="answer-container mt-8">
          <ul id="answerList" className="space-y-4">
            {answers.map((answer) => (
              <li key={answer.id} className="answer bg-gray-50 p-4 rounded-lg shadow flex gap-4">
                <div className="votecell flex flex-col items-center">
                  <button
                    className="vbutton bg-blue-500 text-white font-bold py-1 px-2 rounded mb-2"
                    onClick={() => handleVote(answer.id, 'upvote', 'answer')}
                  >
                    Upvote
                  </button>
                  <div className="vcount text-lg font-semibold">{answer.votes}</div>
                  <button
                    className="vbutton bg-red-500 text-white font-bold py-1 px-2 rounded mt-2"
                    onClick={() => handleVote(answer.id, 'downvote', 'answer')}
                  >
                    Downvote
                  </button>
                </div>
                <div className="answerbody flex-1">
                  <p className="text-lg">{answer.text}</p>
                </div>
                <div className="aData text-center">
                  <span className="aname text-gray-800 font-medium">{answer.ans_by.username}</span>
                  <br />
                  <span className="adate text-gray-500">{getDateString(answer.ans_date_time)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" onClick={handleAnswerClick} className="mt-8 bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600">
          Answer Question
        </button>
      </div>
    </div>
  );
}
