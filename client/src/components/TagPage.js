import { useEffect, useState } from "react";
import { collection, onSnapshot,query,orderBy, where ,getDoc} from "firebase/firestore";
import { db } from "../index.js";


export default function TagPage(){
    const [tags, setTags] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
        try {
            const tagsColRef = collection(db, 'tags');
            const querySnapshot = query(tagsColRef, orderBy("name"));

            const unsubscribeTags = onSnapshot(querySnapshot, (snapshot) => {
                let tagData = [];
                snapshot.forEach((doc) => {
                    tagData.push({ ...doc.data(), id: doc.id });
                });
                setTags(tagData);
            });

            return () => {
                unsubscribeTags();
            };

        } catch(err){
            console.log(err.message);
        }}
        fetchData();
    },[]);
        
    return (
        <div id="tagcontent">
            <div id="toptag" className="bg-blue-500 p-4 mb-4 rounded-t-lg">
                <h1 id="countTag" className="text-white text-4xl font-bold rounded-md">
                    There {tags.length === 1 ? 'is' : 'are'} {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
                </h1>
            </div>
            <div id="tag-container" className="flex flex-wrap justify-center">
                {tags.map((tag) => (
                    <div key={tag.id} className="bg-gray-200 rounded-md p-4 m-4 flex justify-center items-center">
                        <a href={`/questions?tag=${tag.id}`} className="text-blue-500 text-2xl">{tag.name}</a>
                    </div>
                ))}
            </div>
        </div>
    );
}