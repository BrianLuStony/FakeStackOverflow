
import { getDateString, checkHyper } from "./content.js";
import { useState, useEffect, React } from "react";
import axios from "axios";
import { getTags } from "./api.js";

// export default function askQuestion(props) {
//   console.log("modifying", props.modifying);

//   return <Ask 
//             set={props.set} 
//             user={props.user} 
//             modifying={props.modifying} 
//             questionToModify={props.questionToModify}
//             onCancel={props.onCancel}
//           />;
// }

async function insertNewQ(formData, Qtags, user, refresh) {
  try{
    console.log("userID: ", user._id);

    const date = new Date();

    // Gets names of all existing tags
    const existingTags = (await axios.get("http://localhost:8000/tags")).data.map(tag => tag.name);
    console.log("Existing tags: ", existingTags);
    // Stores array of new tags created by this question
    let newCreatedTags = [];

    // Stores array of all tags in this question
    const createdTags = await Promise.all(Qtags.map(async (tag) => {
      const newTag = { name: tag };

      // Tag is created by this user if tag doesn't already exist
      if(!existingTags.includes(tag)){
        newCreatedTags.push(tag);
      }
      const response = await axios.post("http://localhost:8000/tags", newTag);
      // if(!existingTags.includes(tag)){
      //   newCreatedTags.push(response.data);
      // }
      return response.data;
    }));

    console.log("Created tags ", newCreatedTags);
    // Concatenate the existing tagIds with the newly created tagIds
    const allTagIds = [...createdTags.map(tag => tag._id)];

    const question = {
      title: formData.qTitle,
      text: formData.qDetail,
      tags: allTagIds,
      asked_by: user,
      ask_date_time: date,
      answers: [],
      views: 0,
      votes: 0,
    };

    console.log("insert Data: ", user._id, newCreatedTags);
    // Updates list of created_tags in current user
    const userResponse = await axios.put(`http://localhost:8000/users/${user._id}`, {newCreatedTags})
    console.log("User tags updated: ", userResponse.data);
    // Creates new question
    const response = await axios.post("http://localhost:8000/questions", question);
    console.log("New question created:", response.data);

    refresh();
  }catch (error) {
    console.log(error);
  }
}

async function modifyQ(formData, Qtags, user, onComplete, questionToModify, event) {
  try{
    // Gets names of all existing tags
    const existingTags = (await axios.get("http://localhost:8000/tags")).data.map(tag => tag.name);
    console.log("Existing tags: ", existingTags);
    // Stores array of new tags created by this question
    let newCreatedTags = [];

    // Stores array of all tags in this question
    const createdTags = await Promise.all(Qtags.map(async (tag) => {
      const newTag = { name: tag };

      // Tag is created by this user if tag doesn't already exist
      if(!existingTags.includes(tag)){
        newCreatedTags.push(tag);
      }
      const response = await axios.post("http://localhost:8000/tags", newTag);
      

      return response.data;
    }));
  
    // Concatenate the existing tagIds with the newly created tagIds
    const allTagIds = [...createdTags.map(tag => tag._id)];
  
    // console.log("prev Question tags: ", questionToModify.tags);
    // console.log("new Question tags: ", createdTags);
    questionToModify.tags.forEach(async (tag) => {
      await axios.delete(`http://localhost:8000/tags/${tag._id}`)
        .then(res => console.log(res))
        .catch(err => console.log(err));
    })

    const question = {
      _id: questionToModify._id,
      title: formData.qTitle,
      text: formData.qDetail,
      tags: allTagIds,
      asked_by: questionToModify.asked_by,
      ask_date_time: questionToModify.ask_date_time,
      answers: questionToModify.answers,
      views: questionToModify.views,
      votes: questionToModify.votes,
    };

    // Updates list of created_tags in current user
    const userResponse = await axios.put(`http://localhost:8000/users/${user._id}`, {newCreatedTags})
    console.log("User tags updated: ", userResponse.data);

    // Modifies question with the same _id
    const response = await axios.put("http://localhost:8000/questions", question);
    console.log("Question modified: ", response.data);

    // Sets modifying to false
    onComplete()
  }catch (error) {
    console.log(error);
  }
}

async function deleteQuestion(question, onComplete, event){
  event.preventDefault();
  try{
    // Deletes all tags on the question
    question.tags.forEach(async tag => 
      await axios.delete(`http://localhost:8000/tags/${tag._id}`)
      .then((res) => console.log(res)));

    // Deletes all answers on the question
    question.answers.forEach(async answer => 
      await axios.delete(`http://localhost:8000/answers/${answer._id}`));

    // Delete question
    await axios.delete(`http://localhost:8000/questions/${question._id}`);

    onComplete();
  }
  catch(error){
    console.log(error);
  }
}

export default function Ask(props) {
  let tagString = "";
  if(props.modifying){
    props.questionToModify.tags.forEach((tag) => tagString += (tag.name + " "))
  }
  const [formData, setFormData] = useState({
    qTitle: props.modifying ? props.questionToModify.title : "",
    qDetail: props.modifying ? props.questionToModify.text : "",
    qTag: tagString,
  });

  
  // if(props.modifying && !props.initFormData){
  //   setFormData({
  //     qTitle: props.questionToModify.title,
  //     qDetail: props.questionToModify.text,
  //   })
  // }

  const [formErrors, setFormErrors] = useState({});
  
  const handleSubmit = async(event) => {
    event.preventDefault(); // prevent form from reloading
    const errors = {};
    if (formData.qTitle.trim().length === 0) {
      errors.qTitle = "Title should not be empty";
    } else if (formData.qTitle.trim().length > 50) {
      errors.qTitle = "Title should not be more than 50 characters";
    }
    if (formData.qDetail.trim().length === 0) {
      errors.qDetail = "Question text should not be empty";
    } else if(formData.qDetail.trim().length >140) {
      errors.qDetail = "Should not be more than 140 characters";
    }
    else {
      checkHyper(formData.qDetail, errors);
    }

    var tags = [];
    if (formData.qTag.trim().length > 0) {
      tags = formData.qTag.trim().split(/\s+/);

      if (tags.length > 5) {
        errors.qTag = "Too many tags (maximum 5)";
      } else {
        for (let i = 0; i < tags.length; i++) {
          const tag = tags[i];
          console.log(tag.length);
          if (tag.length > 10) {
            errors.qTag = "Tag is too long (maximum 10 characters)";
            break;
          }
        }
      }
    }
    if(props.user.reputation < 50){
      const tagResponse = await axios.get("http://localhost:8000/tags");
      const existingTags = tagResponse.data;
      const existingTagNames = existingTags.map(tag => tag.name);
      const invalidTags = tags.filter(tag => !existingTagNames.includes(tag));
      if (invalidTags.length > 0) {
        errors.qTag = "Not enough reputation to create a new tag";
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      console.log(formData); // send form data
      if(props.modifying){
        modifyQ(formData, tags, props.user, props.onCancel, props.questionToModify, props.refresh, event);
        props.set.setInProfile(false);
      }
      else{
        insertNewQ(formData, tags, props.user, props.refresh);
      }
      setFormData({
        qTitle: "",
        qDetail: "",
        qTag: "",
      });
      const lq = document.getElementById("link-q");
      lq.style.backgroundColor = "lightgrey";
      lq.style.borderRight = "3px solid orange";
      const lt = document.getElementById("link-t");
      lt.style.backgroundColor = "";
      lt.style.borderRight = "";
      props.set.setAskClick(false);
      props.set.setInMain(true);
      props.set.setQflag(true);
      props.set.setTflag(false);
      props.set.setTagValue("");
      props.set.setInputValue("");
    }

  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div id="questions">
      <div id="postQuestion">
        <h1 style={{ marginRight: "12px" }}>
          Question Title*{" "}
          {formErrors.qTitle && (
            <span style={{ color: "red" }}>{formErrors.qTitle}</span>
          )}
        </h1>
        <span>
          &emsp;&emsp;Limited title to 100 characters or less
          <br />
        </span>
        <form onSubmit={handleSubmit}>
          <input
            id="qTitle"
            name="qTitle"
            type="text"
            value={formData.qTitle}
            role="combobox"
            className="qTitle topsearch tinput"
            aria-label="qTitle"
            aria-expanded="false"
            placeholder="Title"
            autoComplete="off"
            maxLength="100"
            onChange={handleChange}
          />

          <h1 style={{ marginRight: "12px" }}>
            Question Text*{" "}
            {formErrors.qDetail && (
              <span style={{ color: "red" }}>{formErrors.qDetail}</span>
            )}
          </h1>
          <span>
            &emsp;&emsp;Add details
            <br />
          </span>

          <textarea
            id="qDetail"
            name="qDetail"
            type="text"
            value={formData.qDetail}
            role="combobox"
            className="qDetail topsearch tinput"
            aria-label="qDetail"
            aria-expanded="false"
            placeholder="Details"
            autoComplete="off"
            onChange={handleChange}
          ></textarea>

          <h1 style={{ marginRight: "12px" }}>
            Tags*{" "}
            {formErrors.qTag && (
              <span style={{ color: "red" }}>{formErrors.qTag}</span>
            )}
          </h1>
          <span>
            &emsp;&emsp;Add keywords seperated by whitespaces
            <br />
          </span>
          <input
            id="qTag"
            name="qTag"
            type="text"
            value={formData.qTag}
            role="combobox"
            className="qTag topsearch tinput"
            aria-label="qTag"
            aria-expanded="false"
            placeholder="Tags"
            autoComplete="off"
            maxLength="55"
            onChange={handleChange}
          />

          {/* <h1 style={{ marginRight: "12px" }}>
            Name*{" "}
            {formErrors.qName && (
              <span style={{ color: "red" }}>{formErrors.qName}</span>
            )}
          </h1> */}
{/* 
          <input
            id="qName"
            name="qName"
            type="text"
            role="combobox"
            className="qName topsearch tinput"
            aria-label="qName"
            aria-expanded="false"
            placeholder="Name"
            autoComplete="off"
            maxLength="55"
            onChange={handleChange}
          /> */}

          <div>
            <span
              style={{
                position: "absolute",
                bottom: "3%",
                right: "15%",
                color: "red",
                fontSize: "25px",
              }}
            >
              *indicates mandatory fields
              <br />
            </span>
            <button id="postQ" type="submit" className="postQ">
              {props.modifying ? "Update" : "Sent"}
            </button>
            {props.modifying ? <button id="return-button" onClick={(e) => deleteQuestion(props.questionToModify, props.onCancel, e)}>Delete</button> : <></>}
            {props.modifying ? <button id="return-button" onClick={props.onCancel}>Cancel</button> : <></>}
          </div>
        </form>
      </div>
    </div>
  );
}
