import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, where, getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../index.js";
import { getDateString } from "./content.js";
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState('Guest');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagId = searchParams.get('tag');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid); // Adjust this path based on your Firestore structure
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserDisplayName(userData.username); // Adjust the field name based on your Firestore document
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document: ", error);
        }
      } else {
        setUser(null);
        setUserDisplayName('Guest');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const questionsColRef = collection(db, 'questions');
      let questionsQuery;

      if (sortBy === 'unanswered') {
        questionsQuery = query(questionsColRef, where("answers", "==", []), orderBy("ask_date_time", "desc"));
      } else if (sortBy === 'active') {
        questionsQuery = query(questionsColRef, orderBy("last_activity", "desc"));
      } else {
        questionsQuery = query(questionsColRef, orderBy("ask_date_time", "desc"));
      }
      if (tagId) {
        const tagRef = doc(db, 'tags', tagId);
        questionsQuery = query(questionsColRef, where("tags", "array-contains", tagRef));
      }

      const unsubscribeQuestions = onSnapshot(questionsQuery, async (snapshot) => {
        let questionData = [];
        let userDataPromises = [];
        let tagDataPromises = [];

        snapshot.forEach((doc) => {
          let q = { ...doc.data(), id: doc.id };
          if (q.asked_by) {
            userDataPromises.push(getDoc(q.asked_by));
          }
          if (q.tags) {
            q.tags.forEach(tag => tagDataPromises.push(getDoc(tag)));
          }
          questionData.push(q);
        });

        const userDataSnapshots = await Promise.all(userDataPromises);
        const tagDataSnapshots = await Promise.all(tagDataPromises);

        userDataSnapshots.forEach((userDataSnapshot, index) => {
          const userData = userDataSnapshot.exists() ? { userID: userDataSnapshot.id, ...userDataSnapshot.data() } : null;
          questionData[index].userData = userData;
        });

        let tagIndex = 0;
        questionData.forEach((question) => {
          question.tagsData = [];
          if (question.tags) {
            question.tags.forEach(() => {
              const tagDataSnapshot = tagDataSnapshots[tagIndex];
              const tagData = tagDataSnapshot.exists() ? { tagID: tagDataSnapshot.id, ...tagDataSnapshot.data() } : null;
              question.tagsData.push(tagData);
              tagIndex++;
            });
          }
        });

        setQuestions(questionData);
        setLoading(false);
      });

      return () => {
        unsubscribeQuestions();
      };
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [sortBy, tagId]);

  const filterQuestions = useCallback(() => {
    if (searchQuery) {
      const filtered = questions.filter(question =>
        question.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    filterQuestions();
  }, [filterQuestions]);

  const handleAsk = () => {
    navigate('/askQ');
  };
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    navigate('/questions');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      filterQuestions();
    }
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <div className="topbar bg-gray-200 p-4 flex justify-between items-center">
        <span className="text-lg font-bold">All questions</span>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search questions..."
            onChange={handleInputChange}
            onKeyDown={handleSearch}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="sort-buttons flex space-x-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none" onClick={() => handleSortChange('newest')}>Newest</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none" onClick={() => handleSortChange('unanswered')}>Unanswered</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none" onClick={() => handleSortChange('active')}>Active</button>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none" onClick={handleAsk}>Ask Question</button>
          <span className="ml-4 text-gray-700 font-medium">
            {userDisplayName}
          </span>
        </div>
      </div>
      <div id="Q">
        <ul id="questionList">
          {filteredQuestions.map((question) => (
            <li key={question.id} className="question">
              <div className="q_leftside">
                <span className="q_num_answers">{Array.from(question.answers).length} Answer</span>
                <span className="q_num_views">{question.views} View</span>
              </div>
              <div className="q_rightside">
                <div className="q_top">
                  <a
                    className="q_title bold"
                    href={`/question?questionId=${question.id}`}
                  >
                    {question.title}
                  </a>
                  <div className="q_metadata">
                    <span className="q_asked_by">{question.userData?.username}</span>
                    <span> asked </span>
                    <span className="q_ask_date">
                      {getDateString(question.ask_date_time)}
                    </span>
                  </div>
                  <div className="q_tags">
                    {question.tagsData?.map((tag) => (
                      <span key={tag.tagID} className="tag p-1 mr-2">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
