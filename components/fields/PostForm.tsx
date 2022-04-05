import { useState } from 'react'
import moment from "moment";

const PostForm = ({socket, postID, picToken, profilePicType, categoryType, title, mediaFolder, mediaFiles, mediaUrl, postText, username, userCode, myName, myCode, postDate, commentsCount, postAgree, postDisagree, userInteracted, postViews, itsComment, itsReply, ...props})=> {
    let [textBeingEdited,TextBeingEdited] = useState(false);
    let [showMoreText,ShowMoreText] = useState(false);
    let [showUserBoxTools,ShowUserBoxTools] = useState(false);
  
    itsComment || itsReply ? null : mediaFiles = mediaFiles.split(",")
    categoryType == 1 ? categoryType = "General"
      : categoryType == 2 ? categoryType = "Ability"
        : categoryType == 3 ? categoryType = "Character"
          : categoryType == 4 ? categoryType = "Skin"
            : categoryType == 5 ? categoryType = "Story"
              : categoryType == 6 ? categoryType = "In-Game"
                : categoryType == 7 ? categoryType = "Feature Request"
                  : null
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
        <div className="userContentData secondLayer">
          <span className="userProfileName"
            onClick={() => { socket.emit('showUserProfile', { username, userCode }) }}
          >{username}
            <span>#{userCode}</span></span>
          <div className="userDateTime">{moment(postDate).format('MMMM Do YYYY, hh:mm a')}</div>
        </div>
        <input type="button" className="userBoxTools secondLayer"
          onClick={() => { ShowUserBoxTools(!showUserBoxTools) }}
        />
        {
          showUserBoxTools ? <div className="userBoxToolContainer baseLayer">
            {
              username == myName && userCode == myCode ?
                <>
                  <input type="button" value="Edit" className="editContent secondLayer"
                    onClick={() => { TextBeingEdited(true) }}
                  />
                  <input type="button" value="Delete" className="deleteContent secondLayer"
                    onClick={() => {
                    if (itsComment)
                      socket.emit('deleteContent', { postID: null, commentID: postID })
                    else
                      socket.emit('deleteContent', { postID: postID, commentID: null })
                    }}
                  />
                </>
                : <input type="button" value="Report" className="reportContent secondLayer" />
            }
          </div> : null
        }
        {
          !textBeingEdited ? <div className="userUploadedMedia">{
            
            mediaFiles ? mediaFiles.map((media,indexMedia) => {
              
              (/\.png$/.test(media) || /\.jpg$/.test(media)) ?
                <img key={indexMedia} className="secondLayer" src={`"/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}"`} />
                : (
                  (/\.mp4$/.test(media) || /\.mov$/.test(media)) ?
                    <video key={indexMedia} className="secondLayer" controls><source src={`"/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}"`} />Your browser does not support the video tag.</video> : null)
            }) : null
          }
            {
              mediaUrl ? <iframe className="secondLayer" src={`https://www.youtube.com/embed/${mediaUrl}?enablejsapi=1&modestbranding=1`} frameBorder={0} allowFullScreen></iframe> : null
            }
          </div> : null
        }
        <div className={`${"userProfileText"} ${textBeingEdited ? "textBeingEdited" : "secondLayer"}`} contentEditable={textBeingEdited}>
          {!textBeingEdited ?
            postText.trim().length > 0 ? <>
              <span className="shortTextContent">{postText.trim().substr(0, 350)}</span>
              {!showMoreText && postText >= 350 ? <>
                <div className="showMoreDots">... </div>
                <input type="button" className="readMoreButton" value="Read More"
                  onClick={() => { ShowMoreText(true) }}
                />
              </>
                : null
              }
              {showMoreText ? <span className="readMoreContent">{postText.trim().substr(350, postText.trim().length)} </span> : null}
            </>
              : <span className="shortTextContent">{postText}</span> : <span>
              postText
            </span>
          }
        </div>
        {
          textBeingEdited ? <div className="confirmationDiv">
            <input type="button" value="Save" className="saveContent secondLayer"
            onClick={() => {
              let text = postText;
              TextBeingEdited(false)
              let postID = null;
              let commentID = null;
              if (itsComment)
                socket.emit('saveContent', { commentID: commentID, postID: null, text: text })
              else
                socket.emit('saveContent', { commentID: null, postID: postID, text: text })
            }}
            />
            <input type="button" value="Discard" className="discardContent secondLayer"
              onClick={() => { TextBeingEdited(false) }}
            />
          </div> : null
        }
  
        {!textBeingEdited ? <div className="userBoxOptions">
          <div className="contentCounterDiv borderColor">
            <div className="numberOfAgree">{postAgree} Agrees</div>
            <div className="numberOfDisagree">{postDisagree} Disagrees</div>
            {
              !itsReply ?
                <div className="numberOfComments">{commentsCount}{itsComment ? " Comment" : " Reply"}</div>
                : null
            }
            {
              !itsReply && !itsComment ?
                <>
                  <div className="numberOfViewers">{postViews - 1} Views</div>
                  <div className="numberOfShare">0 Shares</div>
                </> : null
            }
          </div>
          <div className="InteractionDiv">
            <input type="button" value="Agree" className={`"agreeButton secondLayer ${userInteracted == 1 ? "userInteracted" : null}"`} />
            <input type="button" value="Disagree" className={`"disagreeButton secondLayer ${userInteracted == 2 ? "userInteracted" : null}"`} />
            {
              !itsReply ?
                <input type="button" value={`View ${itsComment ? "Reply" : "Comment"}`} className="secondLayer"
                  onClick={() =>  ShowCommentsFunc(socket, postID, true, itsComment) }
                />
                : null
            }
            {
              !itsReply && !itsComment ?
                <>
                  <input type="button" value="Share" className="secondLayer" />
  
                </> : null
            }
            {
              !itsReply ?
                <input className="createComment secondLayer" type="button" value={`${itsComment ? "Reply" : "Comment"}${" here..."}`}
                  onClick={() => ShowCommentsFunc(socket, postID, false, itsComment) }
                /> : null
            }
          </div>
        </div> : null}
      </div>
    )
    function ShowCommentsFunc(socket: any, id: number, OnlyView: boolean, itsReply: boolean) {
      // if (!OnlyView) {
      //   //show createcomment textarea
      //   ShowCreateComment(true)
      // }else{
      //   ShowCreateComment(false)
      // }
      //window.scrollTo(0, 0);
  
      // SetPostNav(true)
      // SetMainNav(false) 
  
      // if (element.find("video").length)
      //   element.find("video").get(0).pause();
      // $('.mediaUrlPost').each(function() {
      //   this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
      // })

      socket.emit('getProfileTopComments', {
        contentID: id,
        page : 1,
        itsComment: !itsReply
      })
      //socket.emit('getProfileSpecificContent', data)
    }
  
  }
  
  export default PostForm;