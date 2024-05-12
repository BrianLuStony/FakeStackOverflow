import { useState, useEffect } from "react";
import { getQuestions, getTags } from "./api.js";
import axios from "axios";

// export default function tagList(props) {
//   return (
//     <Tag
//       setTagValue={props.set.setTagValue}
//       setQflag={props.set.setQflag}
//       setTflag={props.set.setTflag}
//       setInMain={props.set.setInMain}
//       user={props.user}
//       fromProfile={props.fromProfile}
//       onCancel={props.onCancel}
//     />
//   );
// }

export default function Tag(props) {
  const [tags, setTags] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [uniqueTags, setUniqueTags] = useState([]);

  const [editing, setEditing] = useState(false);
  const [tagToEdit, setTagToEdit] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { tags } = await getTags();
        const { questions }= await getQuestions();
       
        setTags(tags);
        setQuestions(questions);
        
        if (props.fromProfile) {
          // console.log("props.user", props.user);
          setUniqueTags(props.user.created_tags);
        } else {
          setUniqueTags(Array.from(new Set(tags.map((tag) => tag.name))));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  function handleClick(e) {
    e.preventDefault();
    const tagValue = e.target.textContent;
    props.set.setQflag(true);
    props.set.setTflag(false);
    props.set.setTagValue(tagValue);
    props.set.setInMain(true);
  }


  function editTag(tag){
    setTagToEdit(tag);
    setEditing(true);
  }

  function deleteTag(tag){
    setTagToEdit(tag);
    setDeleting(true);
  }

  function stopEditing(){
    setEditing(false);
    setDeleting(false);
  }
  function hasDuplicateTag(tag) {
    const tagCount = tags.filter(t => t === tag).length;
    return tagCount > 1;
  }

    // console.log("uniquetags: ", uniqueTags);
  const printTag = uniqueTags.length + " Tag" + (uniqueTags.length > 1 ? "s" : "");

  if(editing){
    console.log("Editing...");
    if(hasDuplicateTag(tagToEdit)){
      stopEditing();
      alert("Other users are using this tag!");
      return;
    }
    return(
      <ConfirmEdit
        tag={tagToEdit}
        onCancel={stopEditing}
        refresh={props.refresh}
      />
    );
  }
  else if(deleting){
    console.log("Deleting...");
    // if(hasDuplicateTag(tagToEdit)){
    //   stopEditing();
    //   alert("Other users are using this tag!");
    //   return;
    // }
    return(
      <ConfirmDelete
        tags={tags}
        tag={tagToEdit}
        questions={questions}
        onCancel={stopEditing}
        refresh={props.refresh}
      />
    );
  }
  else{
    return (
      <div id="tagcontent">
        <div id="toptag">
          <h1 id="countTag" style={{ display: "inline", paddingLeft: "16px" }}>
            {printTag}
          </h1>
          <h1 style={{ display: "inline", paddingLeft: "30%" }}>All Tags</h1>
        </div>
        <div id="tag-container">
          {Array.from(uniqueTags).map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return (
              <div className="tag-box" key={tag._id}>
                <a href="#" className="tLink" onClick={handleClick}>
                  {tag.name}
                </a>
                <br />
                <p style={{margin: 0}}>{countDuplicates(tag, questions)} questions</p>
                {props.fromProfile && 
                <>
                <button className="tag-button-edit" onClick={() => editTag(tag)}>Edit</button>
                <button className="tag-button-delete" onClick={() => deleteTag(tag)}>Delete</button>
                </>}
              </div>
            );
          })}
        </div>
        {props.fromProfile ? <button id="return-button" onClick={props.onCancel}>Return</button> : <></>}
      </div>
    );
  }
  
}

function ConfirmEdit(props){
  const [tagName, setTagName] = useState(props.tag.name);
  const [error, setError] = useState("");

  const edit = async (event) => {
    event.preventDefault(); // prevent form from reloading

    // If tag name is not empty then edit tag to new name
    if(tagName.length !== 0){
      try{
        const response = await axios.put(`http://localhost:8000/tags/${props.tag._id}?newName=${tagName}`);
        console.log("Successfully edited tag: ", response);
        props.refresh();
        props.onCancel();
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      setError("Tag name cannot be empty");
    }
  }

  return(
    <div id="answertext" style={{marginLeft: "15%"}}>
      <h1>New Tag*{" "}
          {error && <span style={{ color: "red" }}>{error}</span>}
      </h1>
      <textarea 
        name="editTag" 
        type="text" 
        value={tagName}
        role="combobox" 
        className= "answertext" 
        aria-expanded="false" 
        placeholder="Text" 
        autoComplete="off"
        onChange={(e) => setTagName(e.target.value)}
      />
      <div style={{display: "inline-block", width: "150%"}}>
        <button id= "postA" type = "submit" className="postA" onClick={(e) => edit(e)}>Edit</button>
        <button id="return-button" onClick={props.onCancel}>Return</button>
        <span style={{marginLeft: "30%", marginTop: "20px", color: "red", fontSize: "25px"}}>*indicates mandatory fields<br/></span>
      </div>
    </div>
  )
}

function ConfirmDelete(props){
  const [error, setError] = useState("");

  const deleteTag = async (event) => {
    event.preventDefault(); // prevent form from reloading

    try{
      props.tags.forEach(async (t) => {
        if(t.name == props.tag.name){
          const response = await axios.delete(`http://localhost:8000/tags/${t._id}`);
          console.log("Successfully deleted tag: ", response);
        }
      })
      
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

function countDuplicates(tag, questions){
  let count = 0;
  // console.log("dup tag", tag);
  questions.forEach((q) => {
    // console.log("Q: ",q);
    if (q.tags.some((t) => t.name === tag.name)) {
      count++;
    }
  });
  // console.log(count);
  return count;
};