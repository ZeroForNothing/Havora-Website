import { Field, Formik } from "formik"
import { InputField } from '../../fields/InputField'
import styles from '../../../styles/WindowTab/Profile.module.css'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ShowError } from "../../fields/error"
import axios from "axios"
import moment from "moment"
import Content from "../Content"

export default function ProfileTab({userEmail , ...props}) {
  
  const [mainNav, SetMainNav] = useState(true);
  const [postNav, SetPostNav] = useState(false);
  const [editProfileNav, SetEditProfileNav] = useState(false);

  const [editPassword, SetEditPassword] = useState(null);
  const [editInfo, SetEditInfo] = useState(null);
  const [editPic, SetEditPic] = useState(true);

  const [profilePercentage, SetProfilePercentage] = useState(null);
  const [wallpaperPercentage, SetWallpaperPercentage] = useState(null);

  const [oldPassword,SetOldPassword] = useState(false)
  const [newPassword,SetNewPassword] = useState(false)
  const [confPassword,SetConfPassword] = useState(false)
   
  let { user } = useSelector((state: any) => state.user)
  let { socket } = useSelector((state: any) => state.socket)
  
  let [CurrentProfile, SetCurrentProfile] = useState<Profile>(null)
  let [picToken, SetPicToken] = useState('')

  const [currentCategoryID, SetCurrentCategoryID] = useState<number>(1);

  //const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/;    
  //const strongPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  //const mediumPasswordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

  //const nameRegex = new RegExp("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$");

  let [UserInformation, SetUserInformation] = useState<UserInformation>(null)

  type UserInformation = {
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    gender: number,
    date: string
  }

  type Profile = {
    picToken: string,
    profilePicType: number,
    wallpaperPicType: number,
    code: number,
    name: string,
    friendRequest: number
  }

  useEffect(() => {
    if (!socket) return;
    const queryParams = new URLSearchParams(window.location.search);
    const userParam = queryParams.get('user');
    const codeParam = queryParams.get('code');
      socket.emit('showUserProfile',{
        username : userParam,
        userCode : codeParam
      })
      socket.on('setProfileData', (data) => {
        console.log(data)
        SetCurrentProfile({
          name: data.username,
          code: data.userCode,
          picToken: data.picToken,
          wallpaperPicType: data.wallpaperPicType,
          profilePicType: data.profilePicType,
          friendRequest: data.friendRequest
        });
        //SetWaitingForPost(true);
      })

      
      socket.on("editPassword", function(error) {
        SetOldPassword(false);
        SetNewPassword(false);
        SetConfPassword(false);
        if (error == null) {
          alert("Success changing password")
        } else {
          let text = '';
          if (error == 1){
            text = "All fields must be filled and at least 8 characters"
            SetOldPassword(false);
            SetNewPassword(false);
            SetConfPassword(false);
          }
          else if (error == 2) {
            text = "Old password is Incorrect"
            SetOldPassword(true)
          }
          else if (error == 3){
            text = "New Password must be different than old password"
            SetNewPassword(false)
          }
          else if (error == 4){
            text = "Confirmation Password doesn't match"
            SetConfPassword(false)
          }
          else {
            text = "Something went wrong. Try refreshing page";
          }
          ShowError(text)
        }
      })
      socket.on('editProfileInfo', function(data) {
        console.log(data)
        if (data.error == null) {
          alert("Profile edited successfully")
        } else {
          let text = ''
          if (data.error == 1) {
            text = "One of the fields is empty"
          } else {
            text = "Error connection. Check with support"
          }
          ShowError(text)
        }
      })
    
      socket.on('getUserInformation', function(data) {
        if (data != null) {
          SetUserInformation({
            firstName: data.firstname,
            lastName: data.lastname,
            username: data.username,
            email: data.email,
            gender: data.gender,
            date: moment(data.birthDate).format('YYYY-MM-DD')
          })
        } else {
          ShowError("Couldn't get user information")
        }
      })
      socket.on('manageFriendRequest', function(data) {
        if (CurrentProfile.name == data.username && CurrentProfile.code == data.userCode && data.relation == 1) {
          SetCurrentProfile({
            name: CurrentProfile.name,
            code: CurrentProfile.code,
            picToken: CurrentProfile.picToken,
            wallpaperPicType: CurrentProfile.wallpaperPicType,
            profilePicType: CurrentProfile.profilePicType,
            friendRequest: 1
          });
        }
      });
      SetPicToken(user.picToken);
  }, [socket]);


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
      ShowError("File type must be jpeg, jpg, png");
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
                <div className={`NavButton`} onClick={()=>{
                  window.history.pushState({}, document.title, `/?user=${user.name}&code=${user.code}`);
                  socket.emit('showUserProfile',{
                    username : user.name,
                    userCode : user.code
                  })
                 }}>
                    <span className={`returnBack`}></span>
                    <p>Back</p>
                </div>
                {
                  
                  <div className={`NavButton`} onClick={()=>{
                    socket.emit('manageFriendRequest')
                   }}>
                    <span className={`${styles.addFriendRelation}`}></span>
                    <p>
                      { CurrentProfile.friendRequest == null || CurrentProfile.friendRequest == 1 ? 'Add Friend':''}
                      { CurrentProfile.friendRequest == 1 ? 'Cancel Request':''}
                      { CurrentProfile.friendRequest == 2 ? 'Accept Request':''}
                      { CurrentProfile.friendRequest == 3 ? 'Unfriend':''}
                    </p>
                  </div>
                }
              </>
                : 
                <div className={`NavButton`} onClick={()=>{    
                  SetMainNav(false)
                  SetEditProfileNav(true)
                  socket.emit('getUserInformation');
                }}>
                    <span className={`${styles.editProfile}`}></span>
                    <p>Edit profile</p>
                </div>
            }
            <div className={`NavButton pickedInput`}>
                    <span className={`${styles.profilePosts}`}></span>
                    <p>Posts</p>
            </div>
          </> : null
        }
        {
          editProfileNav ? <>
            <div className={`NavButton`} onClick={()=>{    
                  SetEditProfileNav(false)
                  SetMainNav(true)
                }}>
                    <span className={`returnBack`}></span>
                    <p>Back</p>
            </div>
            <div className={`NavButton ${editPic ? "pickedInput" : ""}`} onClick={()=>{    
                  SetEditPassword(false)
                  SetEditInfo(false)
                  SetEditPic(true)
            }}>
                    <span className={`${styles.editPic}`}></span>
                    <p>Edit Picture</p>
            </div>
            <div className={`NavButton ${editInfo ? "pickedInput" : ""}`} onClick={()=>{    
              SetEditPassword(false)
              SetEditPic(false)
              SetEditInfo(true)
            }}>
                    <span className={`${styles.editInfo}`}></span>
                    <p>Edit Info</p>
            </div>
            <div className={`NavButton ${editPassword ? "pickedInput" : ""}`} onClick={()=>{    
              SetEditInfo(false)
              SetEditPic(false)
              SetEditPassword(true)
            }}>
                    <span className={`${styles.changePass}`}></span>
                    <p>Edit Password</p>
            </div>
          </> : null
        }

      </div>
        <div className={`MainDisplay`}>
        {
        mainNav ?             
        <div className={`${"secondLayer"} ${styles.headerView}`} style={{ backgroundImage: CurrentProfile.wallpaperPicType ? `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` : 'none'}}>
          <div className={`${"secondLayer"} ${styles.userDataPosition}`}>
            <div className={`${"secondLayer"} ${styles.profPic}`} style={{ backgroundImage: CurrentProfile.profilePicType ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` : 'none'}}></div>
            <div className={`${styles.userInfoContainer}`}>
              <div className={`${styles.profileUsername}`}>{CurrentProfile.name}</div>
              <div className={`${styles.profileUserCode}`}>{`#`}{CurrentProfile.code}</div>
            </div>
          </div>
        </div> : null
      }
        {
          !editProfileNav ? <Content socket={socket} user={user} currentCategoryID={currentCategoryID} SetCurrentCategoryID={SetCurrentCategoryID} CurrentProfile={CurrentProfile} mainNav={mainNav} postNav={postNav} SetMainNav={SetMainNav} SetPostNav={SetPostNav}/> : null
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
                <Formik onSubmit={(values) => {  }} initialValues={{
                  oldPassword: "",
                  newPassword: "",
                  confPassword: ""
                }}>{({ values }) => (
                  <form className={`${styles.formContainer}`}>
                    
                      
                        <label>Old Password</label>
                        <Field name="oldPassword" type="password" placeholder="Type your password..." maxLength={50} component={InputField}  errorState={oldPassword}/>
                      
                        <label>New Password</label>
                        <Field name="newPassword" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} errorState={newPassword}/>

                        <label>Confirm Password</label>
                        <Field name="confPassword" type="password" placeholder="Re-type your new password..." maxLength={50} component={InputField} disabled={false}  errorState={confPassword}/>
                        <div className={`NavButton pickedInput ${styles.saveButton}`} onClick={()=>{
                          socket.emit("editPassword", {
                            oldPassword: values.oldPassword,
                            confPassword: values.confPassword,
                            newPassword: values.newPassword
                          }); 
                        }}>
                            <span className={`${styles.saveProfileData}`}></span>
                            <p>Save</p>
                        </div>
                  </form>
                )}</Formik>
              </> : null
            }
            {
              editInfo ?
                <Formik onSubmit={(values) => {  }} initialValues={{
                  firstName: UserInformation.firstName,
                  lastName: UserInformation.lastName,
                  username: UserInformation.username,
                  email: UserInformation.email,
                  gender: UserInformation.gender,
                  date: UserInformation.date
                }}>{({ values }) => (
                  <form className={`${styles.formContainer}`}>

                        <label htmlFor="firstName">First Name</label>
                        <Field name="firstName" type="text" placeholder="ex. Axel" maxLength={26} component={InputField} />
                      
                        <label htmlFor="lastName">Last Name</label>
                        <Field name="lastName" type="text" placeholder="ex. Brock" maxLength={26} component={InputField} />

                        <label htmlFor="email">Email</label>
                        <Field name="email" type="email" placeholder="ex. whatever@whatever.com" maxLength={50} component={InputField} disabled />
                      
                        <label htmlFor="username">Username</label>
                        <Field name="username" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                      
                    
                      <label className="title">Gender</label>
                      <div  className={`${styles.radioContainer} `}>
                        <label htmlFor="male" className={`${"secondLayer"} ${values.gender == 1 ? "pickedInput" : null} ${styles.radioLabel} `}>Male</label>
                        <Field type="radio" id="male" name="gender" className={styles.radioInput} value={1} />
                        <label htmlFor="female" className={`${"secondLayer"} ${values.gender == 0 ? "pickedInput" : null} ${styles.radioLabel} `}>Female</label>
                        <Field type="radio" id="female" name="gender" className={styles.radioInput} value={0} />
                      </div>

                      <label>Birth Date</label>
                      <Field type="date" name="date" className={styles.dateList}></Field>
                      <div className={`NavButton pickedInput ${styles.saveButton}`} onClick={()=>{
                          socket.emit('editProfileInfo', values)
                        }}>
                            <span className={`${styles.saveProfileData}`}></span>
                            <p>Save</p>
                        </div>
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


