import { useEffect, useState } from "react";
import { getQuestions, getUsers, getAns, getQuestionsByUser} from "./api";
import ModifyQuestion from "./askQuestion";
import TagList from "./tagList";
import axios from "axios";
import { getDateString } from "./content";

export default function UserProfile({set, user, isAdmin, refresh,setV,setQflag,setInProfile}){
    const [questions, setQuestions] = useState([]); // Objects of user asked questions
    const [createdTags, setCreatedTags] = useState([]); // Names of user created tags
    const [answers, setAnswers] = useState([]);
    const [users, setUsers] = useState([]);

    const[modifyingQuestion, setModifyingQuestion] = useState(false);
    const[viewingTags, setViewingTags] = useState(false);

    const[questionToModify, setQuestionToModify] = useState({}); // stores object of question to modify
    const[isDeleting, setIsDeleting] = useState(false);
    

    useEffect(() =>{
        const fetchData = async () => {
            try{
                let {questions} = await getQuestions();
                questions = questions.filter((q) =>q.asked_by.username === user.username);
                setQuestions(questions);
            }
            catch (error){
                console.log(error);
            }
            try {
                let { answers } = await getAns();
                answers = answers.filter((ans) => ans !== undefined);
                setAnswers(answers);
            } 
            catch (error) {
                console.log(error);
            }
            try{
                let users = await getUsers();
                setUsers(users.user);
            }
            catch(error){
                console.log(error);
            }
            setCreatedTags(user.createdTags);
        }
        fetchData();
    },[set.setInProfile, modifyingQuestion, refresh]);

    const startModify = (question) => {
        console.log("Modifying question...");
        setQuestionToModify(question);
        setModifyingQuestion(true);
    }

    const returnProfile = () => {
        console.log("Returning to profile...");
        setModifyingQuestion(false);
        setViewingTags(false);
        setIsDeleting(false);
        refresh();
    }

    const viewTags = () => {
        console.log("Viewing user created tags...");
        setViewingTags(true);
    }

    const startDelete = () => {
        console.log("Deleting user...");
        setIsDeleting(true);
    }
    const getUserAns = async (user) =>{
        const displayedQuestions = await getQuestionsByUser(user._id);
        setV(displayedQuestions);
        setQflag(true);
        setInProfile(false);
        set.setInMain(true);
    }
    if(modifyingQuestion){
        return(
            <ModifyQuestion 
                set={set} 
                user={user} 
                modifying={modifyingQuestion} 
                questionToModify={questionToModify}
                onCancel={returnProfile}
                refresh={refresh}
            />
        );
    }
    else if(viewingTags){
        return(
            <TagList
                set={set}
                user={user}
                fromProfile={viewingTags}
                onCancel={returnProfile}
                refresh={refresh}
            />
        );
    }
    else{
        return(
            <div id="userProfile-container">
                <h1 id="userProfile-name">{user.username}</h1>
                <p id="userProfile-email">{user.email}</p>
                <p id="userProfile-rep">{user.reputation} Reputation</p>
                <p id="userProfile-created">Active since {getDateString(user.register_date)}</p>
                <AskedQuestions user={user} questions={questions} clicked={startModify}/>
                <div className="userProfile-section">
                    <h3>Tags</h3>
                    <a className="userProfile-button" onClick={viewTags}>View Tags Created</a>
                </div>
                <div className="userProfile-section">
                    <h3>Answers</h3>
                    <a className="userProfile-button" onClick={()=>{getUserAns(user)}}>View Questions Answered</a>
                </div>
                {isAdmin && <EditUsers users={users} isDeleting={isDeleting} onCancel={returnProfile} clicked={startDelete} refresh={refresh}/>}
            </div>
        );
    }
    
}

function AskedQuestions(props){
    return(
    <div id="userProfile-questions" className="userProfile-section">
        <h3>Modify Questions</h3>
        <ul className="userProfile-list">
            {props.questions.map((question) => (
                <li className="userProfile-button">
                    <a className="userProfile-button" 
                        key={"userProfile-question" + question._id}
                        onClick={() => props.clicked(question)}
                    >
                        {question.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>
    );
}

function EditUsers(props){
    const [userToDelete, setUserToDelete] = useState(null);
    if(props.isDeleting){
        return(
            <ConfirmDelete user={userToDelete} onCancel={props.onCancel} refresh={props.refresh}/>
        );
    }
    else{
        return(
            <div id="userProfile-questions" className="userProfile-section">
                <h3>Modify Users</h3>
                <ul className="userProfile-list">
                {props.users.map((user) => (
                    <>
                        {user.email !== "admin@admin.com" && (
                        <li className="userProfile-button">
                            <a
                            className="userProfile-button"
                            key={"userProfile-user" + user._id}
                            >
                            {user.username}
                            </a>
                            <button className="tag-button-delete" onClick={() => {
                                props.clicked();
                                setUserToDelete(user);
                            }}>Delete</button>
                        </li>
                        )}
                    </>
                    ))}

                </ul>
            </div>
        );
    }
    
}

function ConfirmDelete(props){
    const deleteTag = async (event) => {
      event.preventDefault(); // prevent form from reloading
      try{
        const response = await axios.delete(`http://localhost:8000/users/${props.user._id}`);
        console.log("Successfully deleted tag: ", response);
        
        props.refresh();
        props.onCancel();
      }
      catch(err){
        console.log(err);
      }
    }

    return(
        <div id="answertext" style={{marginLeft: "15%"}}>
          <h1>Are you sure?</h1>
          
          <div style={{display: "inline-block", width: "150%"}}>
            <button id= "postA" type = "submit" className="postA" onClick={(e) => deleteTag(e)}>Delete</button>
            <button id="return-button" onClick={props.onCancel}>Return</button>
          </div>
        </div>
      )
}

// async function QuestionList(user){
//     const displayedQuestions = await getQuestionsByUser(user._id);
//     return (
//         <>
//         <div id = "Q">
//           <ul id="questionList">
//             {displayedQuestions.map((question) => (
//               <li key={question._id} className="question">
//               <div className="q_leftside">
//                 <span className="q_num_answers">{Array.from(question.answers).length} Answer</span>
//                 <span className="q_num_views">{question.views} View</span>
//               </div>
//               <div className="q_rightside">
//                 <div className="q_top">
//                   <a
//                     className="q_title"
//                     onClick={() => {
//                       setQClick(true);
//                       setQuestion(question);
//                       addViewQ(question);
//                       setInMain(false);
//                     }}
//                   >
//                     {question.title}
//                   </a>
//                   <div className="q_metadata">
//                     <span className="q_asked_by">{question.asked_by.username}</span>
//                     <span> asked </span>
//                     <span className="q_ask_date">
//                       {getDateString(question.ask_date_time)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="q_tags">
//                   {questionTags[question._id] ? (
//                     questionTags[question._id].map((tag) => (
//                       <span key={tag._id} className="q_tag">
//                         {tag}
//                       </span>
//                     ))
//                   ) : (
//                     <span>Loading tags...</span>
//                   )}
//                 </div>
//               </div>
//             </li>
//             ))}
//           </ul>
//         </div>
//         <div className="pagination">
//         <button onClick={handlePrevPage} disabled={currentPage === 0}>
//           Prev
//         </button>
//         <button
//           onClick={handleNextPage}
//           disabled={currentPage >= Math.floor(displayedQ.length / pageSize)}
//         >
//           Next
//         </button>
//       </div>
//       </>
//       );
// }