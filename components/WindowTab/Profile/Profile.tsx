import { Field, Formik } from "formik"
import { InputField } from '../../fields/InputField'
import styles from '../../../styles/WindowTab/Profile.module.css'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShowError } from "../../fields/error"
import axios from "axios"
import PostForm from '../../fields/PostForm'

export default function ProfileTab({userEmail , ...props}) {
  
  const dispatch = useDispatch();

  const [mainNav, SetMainNav] = useState(true);
  const [postNav, SetPostNav] = useState(false);
  const [editProfileNav, SetEditProfileNav] = useState(false);

  const [editPassword, SetEditPassword] = useState(null);
  const [editInfo, SetEditInfo] = useState(null);
  const [editPic, SetEditPic] = useState(true);

  const [profilePercentage, SetProfilePercentage] = useState(null);
  const [wallpaperPercentage, SetWallpaperPercentage] = useState(null);

  let [PostsView, SetPosts] = useState(null);
  let [CommentsView, SetComments] = useState(null);
  let [RepliesView, SetReplies] = useState(null);
  
  const [loadMorePosts, SetLoadMorePosts] = useState(true);
  const [loadMoreComments, SetLoadMoreComments] = useState(true);
  const [loadMoreReplies, SetLoadMoreReplies] = useState(true);

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
  
  let { user } = useSelector((state: any) => state.user)
  let { socket } = useSelector((state: any) => state.socket)
  
  let [CurrentProfile, SetCurrentProfile] = useState<Profile>(null)
  let [picToken, SetPicToken] = useState('')

  let [WaitingForPost , SetWaitingForPost] = useState(true)
  let [WaitingForComment , SetWaitingForComment] = useState(true)
  let [WaitingForReply , SetWaitingForReply] = useState(true)
  let WaitingForPostRef = useRef(WaitingForPost)
  let WaitingForCommentRef = useRef(WaitingForComment)
  let WaitingForReplyRef = useRef(WaitingForReply)


  type Profile = {
    picToken: string,
    profilePicType: number,
    wallpaperPicType: number,
    code: number,
    name: string,
    friendRequest: number,
    myRequest: number
  }

  useEffect(() => {
    if (socket) {
      socket.on('setProfileData', (data) => {
        SetCurrentProfile({
          name: data.username,
          code: data.userCode,
          picToken: data.picToken,
          wallpaperPicType: data.wallpaperPicType,
          profilePicType: data.profilePicType,
          friendRequest: data.friendRequest,
          myRequest: data.myRequest
        });
      })
      socket.on('createProfileComment', function(data) {
        let newArr = {socket, id: data.id, picToken : user.picToken, picType : user.profilePicType, text : data.text, username : user.name, userCode : user.code, name: user.name, code : user.name, date : data.date, count : 0, agree : 0, disagree : 0, interact : 0}
          SetReplies(oldArray => [newArr, ...oldArray]);
        document.getElementsByClassName("WindowTab")[0].scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      })
      socket.on('getProfileTopPosts', function (data) {
        if (data.postsList != null) {
          let postsList = JSON.parse(data.postsList)

          SetPostPage(data.page)
          
          SetWaitingForPost(false)
          WaitingForPostRef.current = false;
          
          let contentList = data.page != 6 ? postPrevListRef.current : null
          postPrevListRef.current = contentList? contentList.concat(postsList) : postsList
          SetPosts(postPrevListRef.current);
          SetLoadMorePosts(postsList.length > 4)
        } else {
          postPrevListRef.current = null;
          SetPosts(null);
          SetLoadMorePosts(false)
        }
      })
      socket.on('getProfileTopComments', function (data) {
        let postID = data.postID;
        let commentID = data.commentID;
        let commentsList = JSON.parse(data.commentsList);
        let count = commentsList ? commentsList.length : 0;
        console.log(data)
        SetMainNav(false);
        SetPostNav(true);
        ShowCreateComment(!data.onlyView)
        
        SetShowComments(postID ? true : false)
        SetShowReplies(commentID ? true : false)

        if(!commentsList) return;
        if (postID) {
          SetCurrentPostViewing(postID ? postID : commentID);
          SetCommentPage(data.page)
          SetWaitingForComment(false)
          WaitingForCommentRef.current = false

          let contentList = data.page != 6 ? commentPrevListRef.current : null
          commentPrevListRef.current = contentList? contentList.concat(commentsList) : commentsList
          SetComments(commentPrevListRef.current)
          SetLoadMoreComments(count > 4)
        } 
        else if (commentID) {
          SetCurrentCommentViewing(commentID)
          SetReplyPage(data.page)
          SetWaitingForReply(false)
          WaitingForReplyRef.current = false;
          let contentList = data.page != 6 ? replyPrevListRef.current : null
          replyPrevListRef.current = contentList? contentList.concat(commentsList) : commentsList
          SetReplies(replyPrevListRef.current)
          SetLoadMoreReplies(count > 4)
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
            let contentComment = commentPrevListRef.current.find(content => content.id == data.commentID)
            let contentReply = replyPrevListRef.current.find(content => content.id == data.commentID)
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
      SetPicToken(user.picToken)
    }
  }, [socket]);

  const handleContentScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if(!bottom) return; 
    if(mainNav && WaitingForPostRef) {
      SetWaitingForPost(true)
      WaitingForPostRef.current = true;
      socket.emit('getProfileTopPosts',{
        profileName : CurrentProfile.name,
        profileCode : CurrentProfile.code,
        page : postCurrentPage
      })
    } else if (postNav) {
      if(showComments && WaitingForCommentRef){
        SetWaitingForComment(true)
        WaitingForCommentRef.current = true;
        socket.emit('getProfileTopComments', {
          contentID: CurrentPostViewing ,
          page : commentCurrentPage ,
          itsComment: showComments,
          onlyView : true
        })
      }else if(showReplies && WaitingForReplyRef){
        SetWaitingForReply(true);
        WaitingForReplyRef.current = true;
        socket.emit('getProfileTopComments', {
          contentID: CurrentCommentViewing,
          page : replyCurrentPage,
          itsComment: showComments,
          onlyView : true
        })
      }
        
    }
  }

  const ShowEditProfile = e => {
    e.preventDefault();
    SetMainNav(false)
    SetEditProfileNav(true)
  };
  const ShowEditPassword = e => {
    e.preventDefault();
    SetEditInfo(false)
    SetEditPic(false)
    SetEditPassword(true)
  };
  const ShowEditInfo = e => {
    e.preventDefault();
    SetEditPassword(false)
    SetEditPic(false)
    SetEditInfo(true)
  };
  const ShowEditPic = e => {
    e.preventDefault();
    SetEditPassword(false)
    SetEditInfo(false)
    SetEditPic(true)
  };
  const ReturnToProfile = e => {
    e.preventDefault();
    SetEditProfileNav(false)
    SetMainNav(true)
  };
  const BackFromComments = e => {
    e.preventDefault();
    SetPostNav(false)
    SetMainNav(true)
    SetShowComments(false)
    SetShowReplies(false)
  }
  const BackFromReplies = e => {
    e.preventDefault();
    ShowCreateComment(false)
    SetShowComments(true)
    SetShowReplies(false)
  }
  function CreateCommentFunc(){
    if(socket == null) return;
    let text = CommentTextCreation.current.value
    ShowCreateComment(false)
    socket.emit("createProfileComment",{
      text
    })
  }
  function checkAcceptedExtensions (file) {
    const type = file.type.split('/').pop()
    const accepted = ['jpeg', 'jpg', 'png']
    if (accepted.indexOf(type) == -1) {
      return false
    }
    return true
  }
  const uploadImage = picType => async e => {
    const files = e.target.files
    const form = new FormData()
    if (files[0].size >= 2 * 1024 * 1024) {
      e.target.value = "";
      ShowError("File size huge exceeds 100 MB");
      return;
    }

    if (!checkAcceptedExtensions(files[0])) {
      e.target.value = "";
      ShowError("File type must be jpeg/jpg/png/mp4/mp3/mov/avi/mkv");
      return;
    }
    form.append('files', files[0], files[0].name)
    form.append(`email`, userEmail);
    let perc = "0%"
    let src = URL.createObjectURL(files[0])
    if (picType == 1) {
      // SetProfilePic(src)
      SetProfilePercentage(perc)
    }
    else if (picType == 2) {
      // SetWallpaperPic(src)
      SetWallpaperPercentage(perc)
    } else {
      e.target.value = "";
      ShowError("Picture param invalid");
      return;
    }
    URL.revokeObjectURL(files[0])
    try {
      await axios.request({
        method: "post",
        url: "/profileUpload?picType=" + picType + "&picToken=" + picToken,
        data: form,
        onUploadProgress: (progress) => {
          let ratio = progress.loaded / progress.total
          let percentage = (ratio * 100).toFixed(2) + "%";

          if (picType == 1) SetProfilePercentage(percentage)
          else SetWallpaperPercentage(percentage)
        }
      }).then(response => {
        if (response.data.msg) {
          if (picType == 1) SetProfilePercentage(null)
          else SetWallpaperPercentage(null)
          socket.emit('registerUser')
        }
        else ShowError(response.data.error);
        e.target.value = "";
      }).catch((error) => {
        if (error.toString().includes("413")) {
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

  if (CurrentProfile == null) return null
  else return (
    <>
      <div className={`Nav`}>
        {
          mainNav ? <>
            {
              (user.name != CurrentProfile.name || user.code != CurrentProfile.code) ? <>
                <input type="button" className={`${styles.ReturnBack}`} />
                <input type="button" className={`${styles.RelationWithCurrentUser}`} />
              </>
                : <input type="button" className={`${styles.editProfile}`}
                  onClick={ShowEditProfile}
                />
            }
            <input type="button" className={`${styles.matchHistory}`} />
            <input type="button" className={`${styles.profilePosts} pickedInput`} />
          </> : null
        }
        {
          editProfileNav ? <>
            <input type="button" className={`${styles.ReturnBack}`}
              onClick={ReturnToProfile}
            />
            <input type="button" className={`${styles.editPic}`}
              onClick={ShowEditPic}
            />
            <input type="button" className={`${styles.editInfo}`}
              onClick={ShowEditInfo}
            />
            <input type="button" className={`${styles.changePass}`}
              onClick={ShowEditPassword}
            />
          </> : null
        }
        {
          postNav ? <>
            {
              showComments ? <input type="button" className={`${styles.ReturnBack}`}
                onClick={BackFromComments}
              /> : null
            }
            {
              showReplies ? <input type="button" className={`${styles.ReturnBack}`}
                onClick={ BackFromReplies}
              /> : null
            }
            {
              !showCreateComment ? <input type="button" className={`${styles.showCreateComment}`}
                onClick={() => {ShowCreateComment(true)}}
              /> : null
            }
          </> : null
        }
      </div>
      <div className={`contentContainer`} onScroll={handleContentScroll}>
        {
          mainNav ? <>
            <div className={`${"secondLayer"} ${styles.headerView}`} style={{ backgroundImage: CurrentProfile.wallpaperPicType ? `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` : 'none'}}>
              <div className={`${"secondLayer"} ${styles.userDataPosition}`}>
                <div className={`${"secondLayer"} ${styles.profPic}`} style={{ backgroundImage: CurrentProfile.profilePicType ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` : 'none'}}></div>
                <div className={`${styles.userInfoContainer}`}>
                  <div className={`${styles.profileUsername}`}>{CurrentProfile.name}</div>
                  <div className={`${styles.profileUserCode}`}>{`#`}{CurrentProfile.code}</div>
                </div>
              </div>
            </div>
            <div>
              {PostsView && PostsView.length > 0 ?
                PostsView.map(data => {
                  return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryType={null} title={null} mediaFolder={data.folder} mediaFiles={data.file} mediaUrl={data.url} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={data.views} itsComment={false} itsReply={false} />
                })
                : (
                  loadMorePosts ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>No posts yet</div> : "loading content"
                )
              }
            </div>
          </> : null
        }
        {
          postNav ? <>
            {showComments ? 
              <>
                 {
                    CommentsView ?
                    CommentsView.map(data=>{  
                      return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryType={null} title={null} mediaFolder={null} mediaFiles={null} mediaUrl={null} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={null} itsComment={true} itsReply={false} />     
                    }) 
                    : 
                      loadMoreComments ?  <div className={`${"secondLayer"} ${styles.loadingContent}`}>No comments yet</div> : "loading content"
                  } 
              </>
             : null}
            {
              showReplies ? <>
              {
                  RepliesView ?
                  RepliesView.map(data=>{  
                    return <PostForm key={data.id} socket={socket} contentID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryType={null} title={null} mediaFolder={null} mediaFiles={null} mediaUrl={null} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={null} itsComment={false} itsReply={true} />  
                  }) 
                  : (
                    loadMoreReplies ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>No replies yet</div> : "loading content"
                  )
                }
            </>  : null
            }
            {
              showCreateComment ? <>
                <div className="baseLayer CommentTextCreation">
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
        {
          editProfileNav ? <>
            {
              editPic ? <>
               <div className={`${styles.editPicContainer}`} >
                <div className={`secondLayer ${styles.displayPic}`} style={{ width: "120px", height: "120px", backgroundImage: CurrentProfile.profilePicType ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` : 'none'}} ></div>
                    
                    {
                      profilePercentage ? <>
                        <span className={`${styles.picPercent}`}>{profilePercentage}</span>
                        {/* <input type="button" value="Cancel"  className={`pickedInput`}/> */}
                      </> : <label htmlFor="EditUserProfilePic" className={`secondLayer`}>Change My Profile Picture</label>
                    }
                    <input type="file" accept="image/*" name="image" id="EditUserProfilePic"
                      onChange={uploadImage(1)} style={{ display: "none" }}
                    />
               </div>
               
               
                  <div className={`${styles.editPicContainer}`}>
                    <div className={`secondLayer ${styles.displayPic}`} style={{ backgroundImage: `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` }}></div>
                    {
                      wallpaperPercentage ? <>
                        <span className={`${styles.picPercent}`}>{wallpaperPercentage}</span>
                        {/* <input type="button" value="Cancel" className={`pickedInput`}/> */}
                      </> : <label htmlFor="EditUserWallpaperPic" className={`secondLayer`}>Change My Wallpaper Picture</label>
                    }
                    <input type="file" accept="image/*" name="image" id="EditUserWallpaperPic"
                      onChange={uploadImage(2)} style={{ display: "none" }}
                    />
                  </div>
                
              </> : null
            }
            {
              editPassword ? <>
                <div>
                  <label htmlFor="oldPassword">Old Password</label>
                  <input type="password" placeholder="Type your password..." id="oldPasswordEditProfile" />
                </div>
                <div>
                  <label htmlFor="newPassword">New Password</label>
                  <input type="password" placeholder="ex. bG0J5GW2g^16%klm" id="newPasswordEditProfile" />
                </div>
                <div>
                  <label htmlFor="confPassword">Confirm Password</label>
                  <input type="password" placeholder="Re-type your password..." id="confPasswordEditProfile" />
                </div>
                <input type="button" value="Save" />
              </> : null
            }
            {
              editInfo ?
                <Formik onSubmit={(values) => { {/*EditUser(values) */ } }} initialValues={{
                  firstName: "asd",
                  lastName: "asd",
                  username: "asd",
                  email: userEmail,
                  gender: "1",
                  year: "",
                  month: "1",
                  day: "1"
                }}>{({ handleSubmit }) => (
                  <form id="myForm"  className={`${styles.formContainer}`} onSubmit={handleSubmit}>
                    
                      
                        <label htmlFor="firstName">First Name</label>
                        <Field name="firstName" type="text" placeholder="ex. Axel" maxLength={26} component={InputField} />
                      
                        <label htmlFor="lastName">Last Name</label>
                        <Field name="lastName" type="text" placeholder="ex. Brock" maxLength={26} component={InputField} />
                      
                   

                    
                        <label htmlFor="email">Email</label>
                        <Field name="email" type="email" placeholder="ex. whatever@whatever.com" maxLength={50} component={InputField} disabled />
                      
                        <label htmlFor="username">Username</label>
                        <Field name="username" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                      
                    
                    {/* <div className={`${styles.divContainer}`}>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} />
              <label htmlFor="confPassword">Confirm Password</label>
              <Field name="confPassword" type="password" placeholder="Re-type password..." maxLength={50} component={InputField} />
            </div> */}
                    
                      <label className="title">Pick your Gender</label>
                      <div>
                        
                          <label id="maleLabel" htmlFor="male" className={`${"secondLayer"} ${"pickedInput"} ${styles.radioLabel} `}>Male</label>
                          <Field type="radio" id="male" name="gender" onClick={() => { {/*SetGender(false) */ } }} className={styles.radioInput} value={1} />
                     
                        
                          <label id="femaleLabel" htmlFor="female" className={`${"secondLayer"} ${styles.radioLabel} `} style={{ float: "right" }}>Female</label>
                          <Field type="radio" id="female" name="gender" onClick={() => { {/*SetGender(true) */ } }} className={styles.radioInput} value={0} />
                        
                      </div>
                      <label>Birth Date</label>
                      <div className={styles.dateDiv}>
                        <Field as="select" name="year" className={styles.dateList} id="year" >
                          <option hidden>Year</option>
                        </Field>
                        <Field as="select" name="month" className={styles.dateList} id="month">
                          <option value="1">Jan</option>
                          <option value="2">Feb</option>
                          <option value="3">Mar</option>
                          <option value="4">Apr</option>
                          <option value="5">May</option>
                          <option value="6">Jun</option>
                          <option value="7">Jul</option>
                          <option value="8">Aug</option>
                          <option value="9">Sep</option>
                          <option value="10">oct</option>
                          <option value="11">Nov</option>
                          <option value="12">Dec</option>
                        </Field>
                        <Field as="select" name="day" className={styles.dateList} id="day" >
                          <option hidden>Day</option>
                        </Field>
                      </div>
                    
                    <input type="button" value="Save"  className={`pickedInput ${styles.saveProfileData}`}/>
                  </form>
                )}</Formik>
                : null
            }
          </> : null
        }
      </div>
    </>
  )
}


