import Link from 'next/link'
import {Field, Formik} from "formik"
import { InputField } from '../../fields/InputField'
import PostNav from './PostNav'
import styles from '../../../styles/WindowTab/Post.module.css'
// import { createPostForm } from '../../Utility/Utility';
import { useState,useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import PostData , {InsertYoutubeUrl , checkAcceptedExtensions} from './PostData';
import { ShowError } from '../../fields/error';
import axios from 'axios';

export default function PostTab(){
    let [postContainer , SetPostContainer] = useState(false)
    let [mediaUrl , SetMediaUrl] = useState(false)
    let [mediaUploaded , SetMediaUploaded] = useState([])

    let postForProfile = useRef(null)
    let postForCommunity = useRef(null)
    let postForUser = useRef(null)
    let PostTitle = useRef(null)
    let youtubeIFrame = useRef(null)
    let PostText = useRef(null)
    let PostUrl = useRef(null)
    let [itsCategory , SetItsCategory] = useState(null)

    const [postType, SetPostType] = useState(() => () => console.log("default"));
    const [discardPost, SetDiscardPost] = useState(() => () => console.log("default"));
    const [submitPost, SetSubmitPost] = useState(() => () => console.log("default"));

    let { socket } = useSelector((state: any) => state.socket)
    useEffect(() => {
      if(socket){
        PostNav(socket,postForProfile ,postForCommunity,postForUser , SetPostType ,SetDiscardPost ,SetSubmitPost , PostText , PostUrl)
        PostData(socket, SetPostContainer  ,PostTitle ,SetItsCategory)
      }
    }, [socket]);
    const handleClickInput = (e) => {
      e.preventDefault();
      postForProfile.current.classList.remove("pickedInput")
      postForCommunity.current.classList.remove("pickedInput")
      postForUser.current.classList.remove("pickedInput")
      e.target.classList.add("pickedInput")
    }
    const handleClickDiv = (e) => {
      e.preventDefault();
      postForProfile.current.classList.remove("pickedInput")
      postForCommunity.current.classList.remove("pickedInput")
      postForUser.current.classList.add("pickedInput")
    }
    const handleKeyUp = e =>{
      e.preventDefault();
      InsertYoutubeUrl(e ,youtubeIFrame)
    }
    const ShowDetail = index => e =>{
      e.preventDefault();
      let newArr = [...mediaUploaded]
      newArr[index].showDetails = !newArr[index].showDetails
      SetMediaUploaded(newArr) 
    }
    const UploadPostFile = async e => {
      const files = e.target.files
     
      const form = new FormData()
      let tempArray = mediaUploaded;
      let amountOfFiles = mediaUploaded.length;
      if(files[0].size >= 100 * 1024 * 1024){
        e.target.value = "";
        ShowError("File size huge exceeds 100 MB");
        return;
      }
      if(!checkAcceptedExtensions(files[0])) {
        e.target.value = "";
        ShowError("File type must be jpeg/jpg/png/mp4/mp3/mov/avi/mkv");
        return;
      }
        form.append('files', files[0], files[0].name)
        let data = {
          src : URL.createObjectURL(files[0]) ,
          name : files[0].name ,
          size: (files[0].size / 1024).toFixed(2),
          itsImage : files[0].type.includes("image"),
          percentage : "0%",
          showDetails : false
        }
        tempArray.push(data);
        URL.revokeObjectURL(files[0])        
        SetMediaUploaded([...tempArray]) 
        try {
          let index = amountOfFiles;
          await axios.request({
            method: "post", 
            url: "/upload", 
            data: form,
            onUploadProgress: (progress) => {
              let ratio = progress.loaded / progress.total
              let percentage = (ratio * 100).toFixed(2) + "%";  
              if(mediaUploaded[index]){
                mediaUploaded[index].percentage = percentage
                SetMediaUploaded([...mediaUploaded]) 
              }
            }
          }).then( response => {
            if(response.data.msg){
              if(mediaUploaded[index]){
                mediaUploaded[index].percentage = "Uploaded Successfully"
                SetMediaUploaded(mediaUploaded) 
              }
            }else
              ShowError(response.data.error);
            e.target.value = "";
          }).catch((error) => {
            if(error.toString().includes("413") ){
              ShowError("File size huge exceeds 100 MB");
            }
            else
              ShowError(error);
            e.target.value = "";
          })
         
        } catch (err) {
          ShowError('Error uploading the files')
          console.log('Error uploading the files', err)
          e.target.value = "";
        } 
    }
    return (  
      <>     
      <div className={`Nav`}> 
      {
        !postContainer ?  <input type="button" className={`${styles.nextArrow}`}
          onClick={postType}
        /> :  <>
        <input type="file" id="mediaFileInsertPost" 
         onChange={UploadPostFile} 
        style={{display:"none"}} />
        <label htmlFor="mediaFileInsertPost"  className={`${styles.insertFile}`}></label>
        <input type="button"  className={`${styles.youtube}`}
            onClick={()=>{ SetMediaUrl(!mediaUrl) }}
        /> 
        <input type="button" className={`${styles.create}`}
            onClick={submitPost}
        />
        </> 
      }
      <input type="button" className={`${styles.discard}`}
         onClick={discardPost}
        />
    </div>
        <>
            {
                !postContainer ? <>
                <div  className={`borderColor ${styles.PostType}`}>
                <input type="button" ref={postForProfile} className={`secondLayer`} value="For my Profile" 
                  onClick={handleClickInput}
                />
                 <input type="button" ref={postForCommunity} className={`secondLayer`} value="For the Community"
                 onClick={handleClickInput}
                 />
                </div>
                <div ref={postForUser} className={`${styles.FriendPostType}`} onClick={handleClickDiv}>
                <span>For a User</span>
                <input type="text" className={`secondLayer`} placeholder="ex. Devils Dont Cry #3333" />
                </div>
                </> : null
            }
            {
                postContainer ? <>
            <span ref={PostTitle} className={`borderColor ${styles.postType}`} ></span>
                {
                  itsCategory ? <div className={`${styles.divContainer}`}>
                  <input type="button" className="secondLayer pickedInput" value="General" />
                  <input type="button" className="secondLayer" value="Ability" />
                  <input type="button" className="secondLayer" value="Character" />
                  <input type="button" className="secondLayer" value="Skin"/>
                  <input type="button" className="secondLayer" value="Story" />
                  <input type="button" className="secondLayer" value="In-Game" />
                  <input type="button" className="secondLayer" value="Feature Request" />
                  </div> : null
                }
              {
                itsCategory ? <div className={`${styles.divContainer}`}> <input type="text" placeholder="Title or Topic you wana discuss" maxLength={150} className={`secondLayer ${styles.postTitle}`}/> </div> : null
              }   
            <div className={`${styles.divContainer}`} style={{marginTop:"0"}}>
                {
                  mediaUrl ? 
                  <div className={`${styles.mediaUrlPostDiv}`}>
                  <input type="text" ref={PostUrl} placeholder="Insert Url here" className="secondLayer" onKeyUp={handleKeyUp}/>
                  <iframe ref={youtubeIFrame} className={`secondLayer`} typeof="text/html" frameBorder={0} allowFullScreen></iframe>
                  </div> : null
                }
                  {mediaUploaded && mediaUploaded.length > 0 ?
                  mediaUploaded.map((data , index)=>{  
                    let name = data.name;
                    let src = data.src;
                    let size = data.size;
                    let percentage = data.percentage;
                    size > 1024 ? size = (size/1024).toFixed(2) + " MB" : size += " KB"
                    name.length > 20 ? name = name.substring(0, 20) : null
                    return (
                      <div className={`borderColor ${styles.mediaFileDetails}`} key={`media_${index}_${ new Date().getTime()}`}>
                        {
                          !data.showDetails ? <>
                          <div className={`${styles.extraFileDetails} ${styles.horizontalDeails}`}>
                          
                           <p className={`${styles.mediaFileName}`}>{name}</p>
                          <span className={`${styles.mediaFileProgress}`}>{percentage}</span>
                          <input className={`secondLayer`} type="button" value="More Details"
                            onClick={ShowDetail(index)}
                          />
                          <input className={`pickedInput ${styles.cancelUploadFile}`} type="button" value="Remove" />
                          </div>
                          </> : 
                          <>
                          <div className={`${styles.extraFileDetails}`}>
                          <p className={`${styles.mediaFileName}`}>File: {name}</p>
                          <p className={`${styles.mediaFileName}`}>Size: {size}</p>
                          <span className={`${styles.mediaFileProgress}`}>{percentage}</span>
                          <input className={`pickedInput ${styles.cancelUploadFile}`} type="button" value="Remove" />
                          </div> 
                         {
                            data.itsImage ? <img src={src}/> : 
                            <video controls>
                              <source src={src}/> 
                              Your browser does not support the video tag.
                            </video>
                         }
                          </>     
                    }
                        </div>
                    ) 
                  }) :  null}
            </div>
            <div className={`${styles.divContainer}`}>
                <textarea rows={8} ref={PostText} className="secondLayer" placeholder="Type here..."></textarea>
            </div>
                </> : null
            }
        </>
        </>
    )
}
//  <script type="text/javascript">
//   function fileDataForm(isItImage, filename) {
//     let form = '';

//     return form;
//   }
//   $("#mediaFileInsertPost").change(function(event) {
//     if ($(this).get(0).files.length === 0) {
//       return;
//     }
//     let filename = event.target.files[0].name;
//     if (/\.mov$/.test(filename) || /\.MP4$/.test(filename) || /\.mp4$/.test(filename)) {
//       let form = fileDataForm(false, filename);
//       $(form).appendTo("#fileDetailsPlaceHolder").find('video source').attr('src', URL.createObjectURL(this.files[0]));
//     } else if (/\.png$/.test(filename) || /\.jpg$/.test(filename)) {
//       let form = fileDataForm(true, filename);
//       let getImagePath = URL.createObjectURL(event.target.files[0]);
//       $(form).appendTo("#fileDetailsPlaceHolder").find('img').attr("src", getImagePath)
//     }
//   })
// </script> 

    
