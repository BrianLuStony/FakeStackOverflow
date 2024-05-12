
import { useEffect, useState } from "react";
import axios from "axios";
async function insertNewC(answer,comment){
  try{
    const response = await axios.post("http://localhost:8000/comments", comment);
    const newCommentId = response.data._id;
    answer.comments.push(newCommentId);
    // Save the updated question object to the server
    const r = await axios.put(`http://localhost:8000/answers/${answer._id}`, {newCommentId});
    console.log("CommentUpdate: ",r.data);

  }catch(error){
    console.log(error);
  }
}
export default function Comment({answer,handleCClick}){
  var date = new Date();
  const [formData, setFormData] = useState({
    commentText: "",
  });
  const [formErrors, setFormErrors] = useState({});
  useEffect(()=>{

  },[formData]);

  const newComment = {
    text: "",
    comment_by: null,
    comment_time: date,
    vote: 0
  }

  function handleChange(event){
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }
  function handlePost(event){
    event.preventDefault(); // prevent form from reloading
    const errors = {};
   
    if (formData.commentText.trim().length === 0) {
      errors.commentText = "Question text should not be empty";
    } else if(formData.commentText.trim().length>140){
      errors.commentText = "Too much"
    }
    else {
      // checkHyper(formData.answerText, errors);
    }
    // if (userReputation < 50) {
    //   errors.reputation = "User reputation is insufficient to add a comment";
    //   // Display appropriate message to the user
    // }
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {

      // newComment.comment_by = user
      newComment.text = formData.commentText;
      console.log("New Comment: ",newComment);
      
      insertNewC(answer,newComment);
      // handleAnsClick();
      handleCClick();
      setFormData({
        commentText: "",
      });
    }

  }
  return(
    <div id="answerpage">
        <form id="aform">
          <div id="answername">
              <h1 style={{ marginRight: "12px" }}>{" "}
                {formErrors.reputation && (
                  <span style={{ color: "red" }}>{formErrors.reputation}</span>
                )}
              </h1>
          </div>
          <div id="answertext">
            <h1>Comment Text*{" "}
                {formErrors.commentText && (
                  <span style={{ color: "red" }}>{formErrors.commentText}</span>
                )}
            </h1>
            <textarea 
              name="commentText" 
              type="text" 
              role="combobox" 
              className= "answertext" 
              aria-expanded="false" 
              placeholder="Text" 
              autoComplete="off"
              onChange={handleChange}
            />
            <div style={{display: "inline-block", width: "150%"}}>
              <button id= "postA" type = "submit" className="postA" onClick={handlePost}>Post Comment</button>
              <span style={{marginLeft: "30%", marginTop: "20px", color: "red", fontSize: "25px"}}>*indicates mandatory fields<br/></span>
            </div>
          </div>
        </form>
      </div>
  );
}
