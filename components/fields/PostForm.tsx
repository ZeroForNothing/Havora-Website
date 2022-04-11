import { useRef, useState } from 'react'
import moment from "moment";

const PostForm = ({socket, contentID, picToken, profilePicType, categoryType, title, mediaFolder, mediaFiles, mediaUrl, postText, username, userCode, myName, myCode, postDate, commentsCount, postAgree, postDisagree, userInteracted, postViews, itsComment, itsReply, ...props})=> {
    let [textBeingEdited,SetTextBeingEdited] = useState(false);
    let [showMoreText,SetShowMoreText] = useState(false);
    let [showUserBoxTools,SetShowUserBoxTools] = useState(false);
    let EditedText = useRef(null);
    itsComment || itsReply ? null : mediaFiles = mediaFiles.split(",")
    categoryType == 1 ? categoryType = "General"
      : categoryType == 2 ? categoryType = "Ability"
        : categoryType == 3 ? categoryType = "Character"
          : categoryType == 4 ? categoryType = "Skin"
            : categoryType == 5 ? categoryType = "Story"
              : categoryType == 6 ? categoryType = "In-Game"
                : categoryType == 7 ? categoryType = "Feature Request"
                  : null

    console.log(mediaFiles)
    return (
      <div className="postContainer borderColor">
        {
          categoryType ? <div className="postCategory">{categoryType}</div> : null
        }
        {
          (title != null && title != '') ? <div className="userProfileTitle">{title}</div> : null
        }
        <div className="userProfilePic secondLayer" style={{
          backgroundImage: profilePicType ? `url(/MediaFiles/ProfilePic/${picToken}/file.${profilePicType})` : 'none'
        }}></div>
        <div className="userContentData secondLayer"
           onClick={() => { socket.emit('showUserProfile', { username, userCode }) }}
        >
          <span className="userProfileName">{username}
            <span>#{userCode}</span></span>
          <div className="userDateTime">{moment(postDate).format('MMMM Do YYYY, hh:mm a')}</div>
        </div>
        {
          !textBeingEdited ? <input type="button" className="userBoxTools secondLayer"
            onClick={() => { SetShowUserBoxTools(!showUserBoxTools) }}
          /> : null
        }
        {
          showUserBoxTools && !textBeingEdited ? <div className="userBoxToolContainer baseLayer">
            {
              username == myName && userCode == myCode ?
                <>
                  <input type="button" value="Edit" className="editContent secondLayer"
                    onClick={() => { SetTextBeingEdited(true); SetShowUserBoxTools(false);}}
                  />
                  <input type="button" value="Delete" className="deleteContent secondLayer"
                    onClick={() => {
                    if (itsComment || itsReply)
                      socket.emit('deleteContent', { postID: null, commentID: contentID })
                    else
                      socket.emit('deleteContent', { postID: contentID, commentID: null })
                    }}
                  />
                </>
                : <input type="button" value="Report" className="reportContent secondLayer" />
            }
          </div> : null
        }
        {
          !textBeingEdited ? 
          <div className="userUploadedMedia">
            {   
            mediaFiles ? 
            mediaFiles.map((media) => {
              return (media.endsWith(".png") || media.endsWith(".jpg")) ?
                <img key={1} className="secondLayer" src={`/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}`} />
                : (
                  (media.endsWith(".mp4") || media.endsWith(".MP4") || media.endsWith(".mov")) ?
                    <video key={1} className="secondLayer" controls>
                      <source src={`/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}`} />
                    </video> : "Your browser does not support showing this")
              }) : null
            }
            {
              mediaUrl ? 
              <iframe className="secondLayer" src={`https://www.youtube.com/embed/${mediaUrl}?enablejsapi=1&modestbranding=1`} frameBorder={0} allowFullScreen></iframe>
              : null
            }
          </div> : null
        }
        {postText ? <>
          {!textBeingEdited?
          <div className={`${"userProfileText"} ${"secondLayer"}`}>
              {
                postText.trim().length > 0 ? 
                <>
                  <span className="shortTextContent">{postText.trim().substr(0, 350)}</span>
                  {!showMoreText && postText >= 350 ? <>
                    <div className="showMoreDots">... </div>
                    <input type="button" className="readMoreButton" value="Read More"
                      onClick={() => { SetShowMoreText(true) }}
                    />
                  </>
                    : null
                  }
                  {showMoreText ? <span className="readMoreContent">{postText.trim().substr(350, postText.trim().length)} </span> : null}
                </>
                  : <span className="shortTextContent">{postText}</span> 
              }
          </div>
            : <textarea rows={6} className={`${"userProfileText"} ${"secondLayer"}`} defaultValue={postText} ref={EditedText}></textarea>
          }
        </>  : null }
          
        {
          textBeingEdited ? 
          <div className="confirmationDiv">
            <input type="button" value="Discard" className="discardContent secondLayer"
              onClick={() => { SetTextBeingEdited(false) }}
            />
            <input type="button" value="Save" className="saveContent pickedInput"
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
  
        {!textBeingEdited ? <div className="userBoxOptions">
          <div className="contentCounterDiv borderColor">
            <div className="numberOfAgree">{postAgree} Likes</div>
            <div className="numberOfDisagree">{postDisagree} Dislikes</div>
            {
              !itsReply ?
                <div className="numberOfComments">{commentsCount}{!itsComment ? " Comment" : " Reply"}</div>
                : null
            }
            {
              !itsReply && !itsComment && postViews != null?
                <>
                  <div className="numberOfViewers">{postViews - 1} Views</div>
                  <div className="numberOfShare">0 Shares</div>
                </> : null
            }
          </div>
          <div className="InteractionDiv">
            <input type="button" value="Like" className={`agreeButton secondLayer ${userInteracted == 1 ? "pickedInput" : null}`}
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
            <input type="button" value="Dislike" className={`disagreeButton secondLayer ${userInteracted == 2 ? "pickedInput" : null}`}
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
                !itsReply && !itsComment ?
                  <>
                    <input type="button" value="Share" className="secondLayer" />
    
                  </> : null
              }
            {
              !itsReply ?
                <input type="button" value={`View ${itsComment ? "Replies" : "Comments"}`} className="secondLayer"
                  onClick={() =>  ShowCommentsFunc(socket, contentID, true, itsComment) }
                />
                : null
            }
            {
              !itsReply ?
                <input className="createComment secondLayer" type="button" value={`${itsComment ? "Reply" : "Comment"}${" here..."}`}
                  onClick={() => ShowCommentsFunc(socket, contentID, false, itsComment) }
                /> : null
            }
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
  
      socket.emit('getProfileTopComments', {
        contentID: id,
        page : 1,
        itsComment: !itsReply,
        onlyView
      })
      //socket.emit('getProfileSpecificContent', data)
    }
  
  }
  
  export default PostForm;