import { useState, useEffect, React } from "react";


export default function AskPage() {
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        qTitle: props.modifying ? props.questionToModify.title : "",
        qDetail: props.modifying ? props.questionToModify.text : "",
        qTag: tagString,
      });

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