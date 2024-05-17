import { checkHyper } from "./content.js";
import { useEffect, useState } from "react";
import axios from "axios";
async function insertNewA(question,answer,editAns){
  try{
    let response = "";
    if(editAns){
      console.log(answer);
      response = await axios.put(`http://localhost:8000/answers2/${editAns._id}`, answer);
      // handle success
      console.log(response.data);
    }else{
      response = await axios.post("http://localhost:8000/answers", answer);
      console.log(response);
      const newAnswerId = response.data._id;
      question.answers.push(newAnswerId);
      const r = await axios.put(`http://localhost:8000/questions/${question._id}`, {newAnswerId});
    }
   
    // Save the updated question object to the server
    
  }catch(error){
    console.log(error);
  }
}
export default function AnswerQuestion({question,handleAnsClick,setAnswerC,user,setAclick, editAns,setEditAns}){
  var date = new Date();
  const [formData, setFormData] = useState({
    answerText: "",
  });
  const [formErrors, setFormErrors] = useState({});
  useEffect(()=>{

  },[formData]);


  const newAnswer = {
    text: "",
    ans_by:user,
    ans_date_time: date,
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
   
    if (formData.answerText.trim().length === 0) {
      errors.answerText = "Question text should not be empty";
    } 
    else {
      checkHyper(formData.answerText, errors);
    }
    
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      console.log("posted answer: " + newAnswer.aid);
      newAnswer.ans_by = user;
      setAclick(false);
      newAnswer.text = formData.answerText;
      console.log("New Answer: ",newAnswer);
      setAnswerC(false);
      insertNewA(question,newAnswer,editAns);
      setEditAns(null);
      handleAnsClick();
      setFormData({
        answerText: "",
      });
    }

  }
  return(
    <div id="answerpage">
        <form id="aform">
          <div id="answername">
              {/* <h1 style={{ marginRight: "12px" }}>{" "}
                {formErrors.answerName && (
                  <span style={{ color: "red" }}>{formErrors.answerName}</span>
                )}
              </h1>
               */}
          </div>
          <div id="answertext">
            <h1>Answer Text*{" "}
                {formErrors.answerText && (
                  <span style={{ color: "red" }}>{formErrors.answerText}</span>
                )}
            </h1>
            <textarea 
              name="answerText" 
              type="text" 
              role="combobox" 
              className= "answertext" 
              aria-expanded="false" 
              placeholder="Text" 
              autoComplete="off"
              onChange={handleChange}
            />
            <div style={{display: "inline-block", width: "150%"}}>
              <button id= "postA" type = "submit" className="postA" onClick={handlePost}>Post Answer</button>
              <span style={{marginLeft: "30%", marginTop: "20px", color: "red", fontSize: "25px"}}>*indicates mandatory fields<br/></span>
            </div>
          </div>
        </form>
      </div>
  );
}
