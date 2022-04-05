import { Field, Formik } from "formik"
import { InputField } from '../../fields/InputField'
import ProfileData, { checkAcceptedExtensions } from "./ProfileData"
import styles from '../../../styles/WindowTab/Profile.module.css'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ShowError } from "../../fields/error"
import axios from "axios"
import moment from "moment";

export default function ProfileTab() {
  const [mainNav, SetMainNav] = useState(true);
  const [editProfileNav, SetEditProfileNav] = useState(false);
  const [postNav, SetPostNav] = useState(false);

  const [editPassword, SetEditPassword] = useState(null);
  const [editInfo, SetEditInfo] = useState(null);
  const [editPic, SetEditPic] = useState(true);

  const [profilePercentage, SetProfilePercentage] = useState(null);
  const [wallpaperPercentage, SetWallpaperPercentage] = useState(null);

  const [PostsView, SetPosts] = useState(null);
  const [loadMorePosts, SetLoadMorePosts] = useState(true);
  const [loadMoreComments, SetLoadMoreComments] = useState(true);
  const [loadMoreReplies, SetLoadMoreReplies] = useState(true);
  const [CommentsView, SetComments] = useState(null);
  const [RepliesView, SetReplies] = useState(null);

  let [showComments, ShowComments] = useState(false)
  let [showReplies, ShowReplies] = useState(false)
  const [showCreateComment, ShowCreateComment] = useState(false)
  const CommentTextCreation = useRef(null)

  const [CreateComment, SetCreateComment] = useState(() => () => console.log("default"));

  let { user } = useSelector((state: any) => state.user)
  let { socket } = useSelector((state: any) => state.socket)
  type Profile = {
    picToken: string,
    profilePicType: number,
    wallpaperPicType: number,
    code: number,
    name: string,
    friendRequest: number,
    myRequest: number
  }
  let [CurrentProfile, SetCurrentProfile] = useState<Profile>(null)

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
      socket.on('getProfileTopPosts', function (data) {
        if (data.postsList != null) {
          let postsList = JSON.parse(data.postsList)
          SetPosts(postsList);
          SetLoadMorePosts(postsList.length > 4)
        } else {
          SetPosts(null);
          SetLoadMorePosts(false)
        }
      })
      socket.on('getProfileTopComments', function (data) {
        let postID = data.postID;
        let commentID = data.commentID;
        let commentsList = JSON.parse(data.commentsList);
        let count = 0;
        if (postID) {
          SetComments(commentsList);
          SetLoadMoreComments(count > 4)
        } else if (commentID) {
          SetReplies(commentsList);
          SetLoadMoreReplies(count > 4)
        }
      })
    }
  }, [socket]);
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
    ShowCreateComment(false)
    //SetCommentPage(1)
  }
  const BackFromReplies = e => {
    e.preventDefault();
    ShowCreateComment(false)
    ShowReplies(false)
    ShowComments(true)
    //SetReplyPage(1)
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
    let perc = "0%"
    let src = URL.createObjectURL(files[0])
    if (picType == 1) {
      //SetProfilePic(src)
      SetProfilePercentage(perc)
    }
    else if (picType == 2) {
      //SetWallpaperPic(src)
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
        url: "/profileUpload?picType=" + picType,
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
        } else
          ShowError(response.data.error);
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
              showReplies ? <input type="button" className={`${styles.ReturnBack}`}
                onClick={BackFromReplies}
              /> : null
            }
            {
              showComments ? <input type="button" className={`${styles.ReturnBack}`}
                onClick={BackFromComments}
              /> : null
            }
            {
              !showCreateComment ? <input type="button" className={`${styles.showCreateComment}`}
                onClick={() => ShowCreateComment(true)}
              /> : null
            }
          </> : null
        }
      </div>
      <>
        {
          mainNav ? <>
            <div className={`${"secondLayer"} ${styles.headerView}`} style={{ backgroundImage: `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` }}>
              <div className={`${"secondLayer"} ${styles.userDataPosition}`}>
                <div className={`${"secondLayer"} ${styles.profPic}`} style={{ backgroundImage: `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` }}></div>
                <div className={`${styles.userInfoContainer}`}>
                  <div className={`${styles.profileUsername}`}>{CurrentProfile.name}</div>
                  <div className={`${styles.profileUserCode}`}>{`#`}{CurrentProfile.code}</div>
                </div>
              </div>
            </div>
            {PostsView && PostsView.length > 0 ?
              PostsView.map(data => {
                return <PostForm socket={socket} postID={data.id} picToken={data.picToken} profilePicType={data.picType} categoryType={null} title={null} mediaFolder={data.folder} mediaFiles={data.file} mediaUrl={data.url} postText={data.text} username={data.username} userCode={data.userCode} myName={user.name} myCode={user.code} postDate={data.date} commentsCount={data.count} postAgree={data.agree} postDisagree={data.disagree} userInteracted={data.interact} postViews={data.views} itsComment={false} itsReply={false} />
              })
              : (
                loadMorePosts ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>Loading Posts ...</div> : null
              )
            }
          </> : null
        }
        {
          postNav ? <>
            {showComments ? (
              <>
                {/* {
                    CommentsView ?
                    CommentsView.map(data=>{  
                      return createPostForm(socket,data.id, data.picToken, data.picType, null, null, null, null, null, data.text, data.username, data.userCode,user.name , user.code, data.date, data.count, data.agree, data.disagree, data.interact,null , true , false,ShowComments,ShowReplies)      
                    }) 
                    : (
                      loadMoreComments ?  <div className={`${"secondLayer"} ${styles.loadingContent}`}>Loading Comments ...</div> :null
                    )
                  } */}
              </>
            ) : null}
            {showReplies ? (
              <>
                {/* {
                    RepliesView ?
                    RepliesView.map(data=>{  
                      return createPostForm(socket,data.id, data.picToken, data.picType, null, null, null, null, null, data.text, data.username, data.userCode,user.name , user.code,data.date, data.count, data.agree, data.disagree, data.interact,null , false , true,ShowComments,ShowReplies)      
                    }) 
                    : (
                      loadMoreReplies ? <div className={`${"secondLayer"} ${styles.loadingContent}`}>Loading Replies ...</div> : null
                    )
                  } */}
              </>
            ) : null}
            {
              showCreateComment ? <>
                <textarea rows={8} cols={80} ref={CommentTextCreation} className="secondLayer CommentTextCreation" placeholder="Type here..."></textarea>
                <input type="button" value="Discard" className={`secondLayer ${styles.DiscardComment}`}
                  onClick={() => { ShowCreateComment(false) }}
                />
                <input type="button" value="Send" className={`pickedInput ${styles.SendComment}`}
                  onClick={CreateComment}
                />
              </> : null
            }
          </> : null
        }
        {
          editProfileNav ? <>
            {
              editPic ? <>
                <div className={`${styles.divContainer}`}>
                  {
                    <div className={`secondLayer ${styles.displayPic}`} style={{ width: "120px", height: "120px", backgroundImage: `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` }} ></div>
                  }
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
                <div className={`${styles.divContainer}`}>
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
                  firstName: "",
                  lastName: "asd",
                  username: "asd",
                  email: "asd@asd.com",
                  gender: "1",
                  year: "",
                  month: "1",
                  day: "1"
                }}>{({ handleSubmit }) => (
                  <form id="myForm" onSubmit={handleSubmit}>
                    <div className={`${styles.divContainer}`} style={{ display: "block" }}>
                      <label htmlFor="firstName">First Name</label>
                      <Field name="firstName" type="text" placeholder="ex. Axel" maxLength={26} component={InputField} />
                      <label htmlFor="lastName">Last Name</label>
                      <Field name="lastName" type="text" placeholder="ex. Brock" maxLength={26} component={InputField} />
                    </div>

                    <div className={`${styles.divContainer}`}>
                      <label htmlFor="email">Email</label>
                      <Field name="email" type="email" placeholder="ex. whatever@whatever.com" maxLength={50} component={InputField} disabled />
                      <label htmlFor="username">Username</label>
                      <Field name="username" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                    </div>
                    {/* <div className={`${styles.divContainer}`}>
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} />
              <label htmlFor="confPassword">Confirm Password</label>
              <Field name="confPassword" type="password" placeholder="Re-type password..." maxLength={50} component={InputField} />
            </div> */}
                    <div className={`${styles.divContainer} ${styles.radioButtonDiv}`}>
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
                    </div>
                    <input type="button" value="Save" />
                  </form>
                )}</Formik>
                : null
            }
          </> : null
        }
      </>
    </>
  )
}
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
    <div key={`${postID}`} className="postContainer borderColor">
      {
        categoryType ? <div className="postCategory">{categoryType}</div> : null
      }
      {
        (title != null && title != '') ? <div className="userProfileTitle">{title}</div> : null
      }
      <div className="userProfilePic secondLayer" style={{
        backgroundImage: `url(/MediaFiles/ProfilePic/${picToken}/file.${profilePicType})`
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
          mediaFiles ? mediaFiles.map(media => {
            (/\.png$/.test(media) || /\.jpg$/.test(media)) ?
              <img className="secondLayer" src={`"https://localhost/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}"`} />
              : (
                (/\.mp4$/.test(media) || /\.mov$/.test(media)) ?
                  <video className="secondLayer" controls><source src={`"https://localhost/MediaFiles/PostFiles/${picToken}/${mediaFolder}/${media}"`} />Your browser does not support the video tag.</video> : null)
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
              <input type="button" value={`View ${itsComment ? " Comment" : " Reply"}`} className="secondLayer"
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
              <input className="createComment secondLayer" type="button" value={`${itsComment ? "Comment" : "Reply"}${" here..."}`}
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
    window.scrollTo(0, 0);

    // SetPostNav(true)
    // SetMainNav(false) 

    // if (element.find("video").length)
    //   element.find("video").get(0).pause();
    // $('.mediaUrlPost').each(function() {
    //   this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
    // })
    if (itsReply) {
      //ShowComments(false)
      //ShowReplies(true)
    } else {
      //ShowComments(true)
      //ShowReplies(false)
    }
    socket.emit('getProfileTopComments', {
      contentID: id,
      //page : contentPage,
      itsComment: !itsReply
    })
    //socket.emit('getProfileSpecificContent', data)
  }

}
