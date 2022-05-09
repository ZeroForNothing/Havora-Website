import { useRef, useState } from 'react'
import moment from "moment";
import contentStyles from '../../styles/WindowTab/Content.module.css'


const PostForm = ({socket, contentID, token, prof,  categoryName , categoryID , currentCategoryID, title, mediaFolder, mediaFiles, mediaUrl, postText, name, code, myName, myCode, postDate, commentsCount, postAgree, postDisagree, userInteracted, postViews, itsComment, itsReply, ...props})=> {
  
    let [textBeingEdited,SetTextBeingEdited] = useState(false);
    let [showMoreText,SetShowMoreText] = useState(false);
    let [showUserBoxTools,SetShowUserBoxTools] = useState(false);
    let EditedText = useRef(null);
    itsComment || itsReply ? null : mediaFiles = mediaFiles.split(",")

    return (
      <div className={`borderColor ${contentStyles.postContainer}`}>
        {
          !textBeingEdited ? 
          <div className={`secondLayer ${contentStyles.userBoxTools} bi bi-three-dots-vertical`} onClick={() => { SetShowUserBoxTools(!showUserBoxTools) }}>
          </div>
          : null
        }
        <div className={`secondLayer ${contentStyles.userProfilePic}`} style={{
          backgroundImage: prof ? `url(/MediaFiles/ProfilePic/${token}/${prof})` : 'none'
        }}></div>
        <div className={`secondLayer ${contentStyles.userContentData}`}
           onClick={() => { 
              window.history.pushState({}, document.title, `/?user=${name}&code=${code}`);
              socket.emit('OpenWindow',{
                window : 'Profile'
              })
            }}
        >
          <span className={`${contentStyles.userProfileName}`}>{name}
            <span className='code'>#
              {code.toString().length == 1 ? "000" : ""}
              {code.toString().length == 2 ? "00" : ""}
              {code.toString().length == 3 ? "0" : ""}
              {code}</span></span>
          <div className={`${contentStyles.userDateTime}`}>{moment(postDate).format('MMMM Do YYYY, hh:mm a')}</div>
        </div>
        {
          categoryID != 1 && categoryName && title != null && title != '' ? 
          <>
          {
            categoryID !== currentCategoryID ? <div className={`secondLayer ${contentStyles.postCategory}`} onClick={()=>{ socket.emit('getTopPosts',{ categoryID, name : null, code : null, page : 1 }) }} ><span>{`#`}</span>{categoryName}</div> : null
          }
            <div className={`${contentStyles.userProfileTitle}`}>{title}</div>
          </> 
          : null
        }
        {
          showUserBoxTools && !textBeingEdited ? <div className={`baseLayer ${contentStyles.userBoxToolContainer}`}>
            {
              name == myName && code == myCode ?
                <>
                  <input type="button" value="Edit" className={`secondLayer ${contentStyles.editContent}`}
                    onClick={() => { SetTextBeingEdited(true); SetShowUserBoxTools(false);}}
                  />
                  <input type="button" value="Delete" className={`secondLayer ${contentStyles.deleteContent}`}
                    onClick={() => {
                    if (itsComment || itsReply)
                      socket.emit('deleteContent', { postID: null, commentID: contentID })
                    else
                      socket.emit('deleteContent', { postID: contentID, commentID: null })
                    }}
                  />
                </>
                : <input type="button" value="Report" className={`secondLayer ${contentStyles.reportContent}`} />
            }
          </div> : null
        }
        {
          !textBeingEdited ? 
          <div className={`${contentStyles.userUploadedMedia}`}>
            {   
            mediaFiles ? 
            mediaFiles.map((media , index) => {
              return (media.endsWith(".png") || media.endsWith(".jpg") || media.endsWith(".jpeg")) ?
                <img key={index} className={`secondLayer`} src={`/MediaFiles/PostFiles/${token}/${mediaFolder}/${media}`} />
                : (
                  (media.endsWith(".mp4") || media.endsWith(".MP4") || media.endsWith(".mov")|| media.endsWith(".x-matroska")) ?
                    <video key={index} className={`secondLayer`} controls>
                      <source src={`/MediaFiles/PostFiles/${token}/${mediaFolder}/${media}`} />
                      Can't view video here
                    </video> : null)
              }) : null
            }
            {
              mediaUrl ? 
              <iframe className={`secondLayer`} src={`https://www.youtube.com/embed/${mediaUrl}?enablejsapi=1&modestbranding=1`} frameBorder={0} allowFullScreen></iframe>
              : null
            }
          </div> : null
        }
        {postText ? <>
          {!textBeingEdited?
          <div className={`${contentStyles.userProfileText}`}>
              {
                postText.trim().length > 0 ? 
                <>
                  <span className={`${contentStyles.shortTextContent}`}>{postText.trim().substr(0, 350)}</span>
                  {!showMoreText && postText >= 350 ? <>
                    <div className="showMoreDots">... </div>
                    <input type="button" className={`${contentStyles.readMoreButton}`} value="Read More"
                      onClick={() => { SetShowMoreText(true) }}
                    />
                  </>
                    : null
                  }
                  {showMoreText ? <span className={`${contentStyles.readMoreContent}`}>{postText.trim().substr(350, postText.trim().length)} </span> : null}
                </>
                  : <span className={`${contentStyles.shortTextContent}`}>{postText}</span> 
              }
          </div>
            : <textarea rows={6} className={`secondLayer ${contentStyles.userProfileText}`} defaultValue={postText} ref={EditedText}></textarea>
          }
        </>  : null }
          
        {
          textBeingEdited ? 
          <div className={`${contentStyles.confirmationDiv}`}>
            <input type="button" value="Discard" className={`secondLayer ${contentStyles.discardContent}`}
              onClick={() => { SetTextBeingEdited(false) }}
            />
            <input type="button" value="Save" className={`${contentStyles.saveContent} pickedInput`}
              onClick={() => {
                let text = EditedText.current.value;
                SetTextBeingEdited(false)
                if (itsComment || itsReply)
                  socket.emit('saveContent', { commentID : contentID, postID : null , text: text })
                else
                  socket.emit('saveContent', { commentID : null, postID : contentID , text: text })
              }}
            />
          </div> : null
        }
  
        {!textBeingEdited ? <div className={`${contentStyles.userBoxOptions}`}>
          {/* <div className={`borderColor ${contentStyles.contentCounterDiv}`}>
            <div>{postAgree} Likes</div>
            <div>{postDisagree} Dislikes</div>
            {
              !itsReply ?
                <div>{commentsCount}{!itsComment ? " Comment" : " Reply"}</div>
                : null
            }
            {
              !itsReply && !itsComment && postViews != null?
                <>
                  <div>{postViews - 1} Views</div>
                  <div>0 Shares</div>
                </> : null
            }
          </div> */}
          <div className={`${contentStyles.InteractionDiv}`}>
            <input type="button" value={`${postAgree} Like${postAgree > 1 ? 's':''}`} className={`agreeButton secondLayer ${userInteracted == 1 ? "pickedInput" : null}`}
              onClick={()=>{
                let postID = itsComment || itsReply ? null : contentID;
                let commentID = itsComment || itsReply ? contentID : null;
                let opinion = userInteracted == 1 ? 0 : 1
                socket.emit('setUserOpinion', {
                  postID,
                  commentID,
                  opinion,
                })
              }}
            />
            <input type="button" value={`${postDisagree} Dislike${postDisagree > 1 ? 's':''}`} className={`disagreeButton secondLayer ${userInteracted == 2 ? "pickedInput" : null}`}
              onClick={()=>{
                let postID = itsComment || itsReply ? null : contentID;
                let commentID = itsComment || itsReply ? contentID : null;
                let opinion = userInteracted == 2 ? 0 : 2
                socket.emit('setUserOpinion', {
                  postID,
                  commentID,
                  opinion,
                })
              }}
            />
            {
              !itsReply ?
              <input type="button" value={`${commentsCount} ${itsComment ? "Replies" : "Comments"}`} className={`secondLayer`}
              onClick={() =>  ShowCommentsFunc(socket, contentID, true, itsComment) }
              />
              : null
            }
            {
              !itsReply && !itsComment ?
                <>
                  <input type="button" value="Share" className={`secondLayer`} />
  
                </> : null
            }
            {/* {
              !itsReply ?
                <input className={`secondLayer ${contentStyles.createComment}`} type="button" value={`${itsComment ? "Reply" : "Comment"}${" here..."}`}
                  onClick={() => ShowCommentsFunc(socket, contentID, true, itsComment) }
                /> : null
            } */}
          </div>
        </div> : null}
      </div>
    )
    function ShowCommentsFunc(socket: any, id: number, onlyView: boolean, itsReply: boolean) {
      // if (!OnlyView) {
      //   //show createcomment textarea
      //   ShowCreateComment(true)
      // }else{
      //   ShowCreateComment(false)
      // }
  
      socket.emit('getTopComments', {
        contentID: id,
        page : 1,
        itsComment: !itsReply
      })
      //socket.emit('getProfileSpecificContent', data)
    }
  
  }
  
  export default PostForm;