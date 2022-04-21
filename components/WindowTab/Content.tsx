import { useEffect, useRef, useState } from "react"
import { ShowError } from "../fields/error"
import PostForm from '../fields/PostForm'
import styles from '../../styles/WindowTab/Content.module.css'

const Content = ({ socket, user, currentCategoryID, SetCurrentCategoryID, CurrentProfile, mainNav, postNav, SetMainNav, SetPostNav }) =>{
    let [JustScrolledToBottomPost , SetJustScrolledToBottomPost] = useState(false)
    let [JustScrolledToBottomComment , SetJustScrolledToBottomComment] = useState(false)
    let [JustScrolledToBottomReply , SetJustScrolledToBottomReply] = useState(false)

    let [WaitingForPost,SetWaitingForPost] = useState(true)
    let [WaitingForComment,SetWaitingForComment] = useState(true)
    let [WaitingForReply,SetWaitingForReply] = useState(true)

    let [PostsView, SetPosts] = useState(null);
    let [CommentsView, SetComments] = useState(null);
    let [RepliesView, SetReplies] = useState(null);

    let [showComments, SetShowComments] = useState(true)
    let [showReplies, SetShowReplies] = useState(false)
    
    const [showCreateComment, ShowCreateComment] = useState(false)
    const CommentTextCreation = useRef(null)

    const postPrevListRef = useRef(null)
    const commentPrevListRef = useRef(null) 
    const replyPrevListRef = useRef(null)

    const [CurrentPostViewing, SetCurrentPostViewing] = useState(null)
    const [CurrentCommentViewing, SetCurrentCommentViewing] = useState(null)
    
    let [postCurrentPage , SetPostPage]  = useState(1);
    let [commentCurrentPage , SetCommentPage]  = useState(1);
    let [replyCurrentPage , SetReplyPage]  = useState(1);


    useEffect(()=>{
        if(!socket) return;
        socket.emit('getTopPosts',{
            categoryID : currentCategoryID,
            name : CurrentProfile ? CurrentProfile.name : null,
            code : CurrentProfile ? CurrentProfile.code : null,
            page : 1
          })
        socket.on('createComment', function(data) {
            let newArr = {socket, id: data.id, picToken : user.picToken, picType : user.profilePicType, text : data.text, username : user.name, userCode : user.code, name: user.name, code : user.code, date : data.date, count : 0, agree : 0, disagree : 0, interact : 0}
    
            if(data.itsComment){
              SetCommentPage(commentCurrentPage);
              commentPrevListRef.current = commentPrevListRef.current ? [newArr].concat(commentPrevListRef.current) : [newArr];
              commentPrevListRef.current.length > 1 ? SetComments(oldArray => [newArr, ...oldArray]) :  SetComments(commentPrevListRef.current);
            }
            else{
              SetReplyPage(commentCurrentPage);
              replyPrevListRef.current = replyPrevListRef.current ? [newArr].concat(replyPrevListRef.current) : [newArr];
              replyPrevListRef.current.length > 1 ? SetReplies(oldArray => [newArr, ...oldArray]) :  SetReplies(replyPrevListRef.current);
            }
              
            document.getElementsByClassName("WindowTab")[0].scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth"
            });
          })
          socket.on('getTopPosts', function (data) {
            SetWaitingForPost(false) 
            if (data == null || !data.postsList) return;
            
            let postsList = JSON.parse(data.postsList)
            SetPostPage(data.page)
            SetCurrentCategoryID(data.currentCategoryID)
              let contentList = data.page != 6 ? postPrevListRef.current : null
              postPrevListRef.current = contentList? contentList.concat(postsList) : postsList
              SetPosts(postPrevListRef.current);
              SetJustScrolledToBottomPost(false)
          })
          socket.on('getTopComments', function (data) {
            let postID = data.postID;
            let commentID = data.commentID;
            let commentsList = JSON.parse(data.commentsList);
    
            SetMainNav(false);
            SetPostNav(true);
            
            SetShowComments(postID ? true : false)
            SetShowReplies(commentID ? true : false)
    
            SetWaitingForComment(false) 
            SetWaitingForReply(false)
    
            if(!commentsList) return;
            if (postID) {
              SetCurrentPostViewing(postID ? postID : commentID);
              SetCommentPage(data.page)
              let contentList = data.page != 6 ? commentPrevListRef.current : null
              commentPrevListRef.current = contentList? contentList.concat(commentsList) : commentsList
              SetComments(commentPrevListRef.current)
              SetJustScrolledToBottomComment(false)
            } 
            else if (commentID) {
              SetCurrentCommentViewing(commentID)
              SetReplyPage(data.page)
              let contentList = data.page != 6 ? replyPrevListRef.current : null
              replyPrevListRef.current = contentList? contentList.concat(commentsList) : commentsList
              SetReplies(replyPrevListRef.current)
              SetJustScrolledToBottomReply(false)
            }
          })
          socket.on('saveContent', function(data) {
            if (data.answer == 1){
              if (data.postID) {
                let content = postPrevListRef.current.find(content => content.id == data.postID)
                const contentIndex = postPrevListRef.current.indexOf(content)
                content.text = data.text;
                SetPosts(oldArray => {
                  return [
                    ...oldArray.slice(0, contentIndex),
                    content,
                    ...oldArray.slice(contentIndex + 1),
                  ]
                })
              }
              else if(data.commentID){
                let contentComment = commentPrevListRef.current ? commentPrevListRef.current.find(content => content.id == data.commentID) : null
                let contentReply = replyPrevListRef.current ? replyPrevListRef.current.find(content => content.id == data.commentID) : null
                if(contentComment){
                  const contentIndex = commentPrevListRef.current.indexOf(contentComment)
                  contentComment.text = data.text;
                  SetComments(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      contentComment,
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
                }else if(contentReply){
                  const contentIndex = replyPrevListRef.current.indexOf(contentReply)
                  contentReply.text = data.text;
                  SetReplies(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      contentReply,
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
                }
              }
            }
            else 
              ShowError("Error editing post")
          })
          socket.on('deleteContent', function(data) {
            if(data.postID){
              let content = postPrevListRef.current.find(content => content.id == data.postID)
                const contentIndex = postPrevListRef.current.indexOf(content)
                SetPosts(oldArray => {
                  return [
                  ...oldArray.slice(0, contentIndex),
                  ...oldArray.slice(contentIndex + 1),
                      ]
                })
            }else if(data.commentID){
              let contentComment = commentPrevListRef.current.find(content => content.id == data.commentID)
                let contentReply = replyPrevListRef.current.find(content => content.id == data.commentID)
                if(contentComment){
                  const contentIndex = commentPrevListRef.current.indexOf(contentComment)
                  SetComments(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
                }else if(contentReply){
                  const contentIndex = replyPrevListRef.current.indexOf(contentReply)
                  SetReplies(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
                }
            } 
            
          })
          socket.on('setUserOpinion', function(data) {
            if (data != null) {
              if(data.postID){
                let content = postPrevListRef.current.find(content => content.id == data.postID)
                const contentIndex = postPrevListRef.current.indexOf(content)
                content.interact = data.opinion;
                content.agree = data.agree;
                content.disagree = data.disagree;
                SetPosts(oldArray => {
                  return [
                    ...oldArray.slice(0, contentIndex),
                    content,
                    ...oldArray.slice(contentIndex + 1),
                  ]
                })
              }
              else{
                let contentComment = commentPrevListRef.current ? commentPrevListRef.current.find(content => content.id == data.commentID) : null
                let contentReply = replyPrevListRef.current ? replyPrevListRef.current.find(content => content.id == data.commentID) : null
                let content = contentComment ? contentComment : contentReply
                let contentList = contentComment ? commentPrevListRef.current : replyPrevListRef.current
                const contentIndex = contentList.indexOf(content)
                content.interact = data.opinion;
                content.agree = data.agree;
                content.disagree = data.disagree;
                if(contentComment)
                  SetComments(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      content,
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
                else
                  SetReplies(oldArray => {
                    return [
                      ...oldArray.slice(0, contentIndex),
                      content,
                      ...oldArray.slice(contentIndex + 1),
                    ]
                  })
              }
            } else {
              ShowError("User not signed in")
            }
          })
    },[socket])

    function CreateCommentFunc(){
        if(socket == null) return;
        let text = CommentTextCreation.current.value
        ShowCreateComment(false)
        socket.emit("createComment",{
          text
        })
      }
    function Backward(){
        if(socket == null) return;
        if(showComments){
          SetPostNav(false)
          SetMainNav(true)
          SetShowComments(false)
          SetShowReplies(false)
        }else if(showReplies){
          ShowCreateComment(false)
          SetShowComments(true)
          SetShowReplies(false)
        }
      }
    const handleContentScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    
        if(!bottom) return;
        
        if(mainNav && !WaitingForPost && !JustScrolledToBottomPost) {
          SetWaitingForPost(true);
          SetJustScrolledToBottomPost(true)
            socket.emit('getTopPosts',{
              categoryID : currentCategoryID,
              name : CurrentProfile ? CurrentProfile.name : null,
              code : CurrentProfile ? CurrentProfile.code : null,
              page : postCurrentPage
            })
        } else if (postNav) {
          if(showComments && !WaitingForComment && !JustScrolledToBottomComment){
            SetWaitingForComment(true)
            SetJustScrolledToBottomComment(true)
            socket.emit('getTopComments', {
              contentID: CurrentPostViewing ,
              page : commentCurrentPage ,
              itsComment: showComments
            })
          }else if(showReplies && !WaitingForReply && !JustScrolledToBottomReply){
            SetWaitingForReply(true)
            SetJustScrolledToBottomReply(true)
            socket.emit('getTopComments', {
              contentID: CurrentCommentViewing,
              page : replyCurrentPage,
              itsComment: showComments
            })
          }
            
        }
      }


    return <>
          <div className={`Nav`}>
          {
                postNav ? 
                <div className={`NavButton`} onClick={()=>{ Backward() }}>
                      <span className={`bi bi-arrow-left`}></span>
                      <p>Back</p>
                </div>
              : null
            }
            {
              postNav && !showCreateComment ? 
              <div className={`NavButton`} onClick={() => {ShowCreateComment(true)}}>
                    <span className={`bi bi-plus-square`}></span>
                    <p>Create Comment</p>
              </div>
               : null
            }
            </div>
            {/* <div className=""> */}

            <div className={`${styles.contentContainer} ${currentCategoryID == 1 && mainNav ? styles.isProfile : ''} ${postNav ? "MainDisplayContent" : ''}`} onScroll={handleContentScroll}>
          {
            mainNav ? <>
              
                {PostsView && PostsView.length > 0 ?
                  PostsView.map(data => {
                    return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryName={data.categoryName} categoryID={data.categoryID} currentCategoryID={currentCategoryID} title={data.title} mediaFolder={data.folder} mediaFiles={data.file} mediaUrl={data.url} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={data.views} itsComment={false} itsReply={false} />
                  })
                  : (
                    <div className={`${"secondLayer"} ${styles.loadingContent}`}>{`No posts yet`}</div>
                  )
                }
                {
                WaitingForPost ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>{`Loading posts`}</div> : null
                }
            </> : null
          }
          {
            postNav ? <>
              {showComments ? 
                <>
                  {
                      CommentsView ?
                      CommentsView.map(data=>{  
                        return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryName={null} categoryID={null}  currentCategoryID={null} title={null} mediaFolder={null} mediaFiles={null} mediaUrl={null} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={null} itsComment={true} itsReply={false} />     
                      }) 
                      : 
                        <div className={`${"secondLayer"} ${styles.loadingContent}`}>{`No posts yet`}</div>
                    } 
                    {
                      WaitingForComment ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>{`Loading comments`}</div> : null
                    }
                </>
              : null}
              {
                showReplies ? <>
                {
                    RepliesView ?
                    RepliesView.map(data=>{  
                      return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryName={null} categoryID={null} currentCategoryID={null} title={null} mediaFolder={null} mediaFiles={null} mediaUrl={null} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={null} itsComment={false} itsReply={true} />  
                    }) 
                    : <div className={`${"secondLayer"} ${styles.loadingContent}`}>No replies yet</div>
                  }
                  {
                      WaitingForReply ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>{`Loading replies`}</div> : null
                    }
              </>  : null
              }
              {
                showCreateComment ? <>
                  <div className={`baseLayer ${styles.CommentTextCreation}`}>
                    <textarea rows={8} ref={CommentTextCreation} className="secondLayer" placeholder="Type here..."></textarea>
                    <div>
                      <input type="button" value="Discard" className={`secondLayer`}
                        onClick={() => { ShowCreateComment(false) }}
                      />
                      <input type="button" value="Send" className={`pickedInput`}
                        onClick={CreateCommentFunc}
                      />
                    </div>
                  </div>
                </> : null
              }
            </> : null
          }
          
        </div>
            {/* </div> */}
    </>
}

export default Content;