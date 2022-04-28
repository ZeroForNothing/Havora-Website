import { InputField } from '../../fields/InputField'
import styles from '../../../styles/WindowTab/Post.module.css'
import { useState,useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {InsertYoutubeUrl , checkAcceptedExtensions} from './PostData';
import { ShowError } from '../../fields/error';
import axios from 'axios';
import CategorySearch  from "../../Components/CategorySearch"

export default function PostTab({WindowLoad}){
    let [mediaUrl , SetMediaUrl] = useState(false)
    let [mediaUploaded , SetMediaUploaded] = useState([])

    let [PostType,SetPostType] = useState(null)
    let youtubeIFrame = useRef(null)
    let PostText = useRef(null)
    let [PostUrl,SetPostUrl] = useState(null)
    let [PostTitle,SetPostTitle] = useState(null)

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)
    let [uploadURL , SetUploadURL] = useState<string>(null)

    const [currentCategoryID, SetCurrentCategoryID] = useState<number>(null);


    useEffect(() => {
      if(!socket) return;
      socket.emit('fetchPostType')
      socket.on("fetchPostType", function(data) {
        if (data.type == 1) {
          SetPostType(`My Profile Post`)
          SetCurrentCategoryID(1)
        } else if (data.type == 2) {
          SetPostType(`Community Post`)
        } else if (data.type == 3 && data.name != null && data.code != null) {
          SetPostType(`Post for ${data.name} #${data.code}`)
          SetCurrentCategoryID(1)
        }       
      });
      socket.on("discardPostCreation", ()=> {
        console.log("discardPostCreation")
      });
      socket.on("promptToDiscardPost",()=>{
        console.log("promptToDiscardPost")
      })   
      SetUploadURL("/upload?picToken=" + user.picToken+"&folderName="+ WindowLoad+'&directoryFolder=PostFiles')
    }, [socket]);

    const handlePostUrl = e =>{
      e.preventDefault();
      if(InsertYoutubeUrl(e ,youtubeIFrame)) SetPostUrl(e.target.value.trim())
    }
    const handlePostTitle = e =>{
      e.preventDefault();
      SetPostTitle(e.target.value.trim())
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
            url: uploadURL, 
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
            if(response.data.ok){
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
        <div className={`NavButton`} onClick={()=>{    
          socket.emit("discardPost")
        }}>
              <span className={`bi bi-arrow-left`}></span>
              <p>Back</p>
        </div>
        <div className={`NavButton`} onClick={()=>{    
          SetMediaUrl(!mediaUrl)
        }}>
              <span className={`bi bi-youtube`}></span>
              <p>Add Youtube Url</p>
        </div>
        <label className={`NavButton`} htmlFor="mediaFileInsertPost">
              <span className={`bi bi-upload`}></span>
              <p>Add Media</p>
        </label>
        <input type="file" id="mediaFileInsertPost" onChange={UploadPostFile} style={{display:"none"}} />
        <div className={`NavButton`} onClick={()=>{    
          socket.emit("createPost",{
            categoryType : currentCategoryID,
            title : PostTitle ? PostTitle.trim() : null,
            text : PostText.current ? PostText.current.value : null,
            url : PostUrl && PostUrl.trim().length != 0 ? PostUrl.trim() : null
          })
        }}>
              <span className={`bi bi-save`}></span>
              <p>Submit Post</p>
        </div>
      </div>

            <div className={`MainDisplay`}>
            <div className={`${styles.PostContainer}`}>

            <div className={`borderColor ${styles.postType}`} >{PostType}</div>
                {
                  PostType === "Community Post" ? <>
                    <CategorySearch socket={socket} currentCategoryID={currentCategoryID} SetCurrentCategoryID={SetCurrentCategoryID} fetchPosts={false}/>
                    <InputField type="text" placeholder="Title or Topic you wana discuss" maxLength={150} onKeyUp={handlePostTitle} style={{marginTop:"20px"}}/> 
                  </>
                  : null
                } 
            <div className={`${styles.divContainer}`} style={{marginTop:"0"}}>
                {
                  mediaUrl ? 
                  <div className={`${styles.mediaUrlPostDiv}`}>
                    <InputField type="text" placeholder="Insert Url here" onKeyUp={handlePostUrl}/>
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
            <textarea rows={8} ref={PostText} className={`secondLayer InputField`} placeholder="Type here..."></textarea>
              
            </div>
            </div>
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

    
