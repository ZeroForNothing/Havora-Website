import { Field, Formik } from "formik"
import { InputField } from '../../fields/InputField'
import profileStyles from '../../../styles/WindowTab/Profile.module.css'
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

  const [currentCategoryID, SetCurrentCategoryID] = useState<number>(null);

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
    friendRequest: number,
    myRequest: number
  }
  useEffect(() => {
      if (!socket) return;
      socket.emit('showUserProfile')
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
      SetPicToken(user.picToken)
    
  }, [socket]);

  const ShowEditProfile = e => {
    e.preventDefault();
    SetMainNav(false)
    SetEditProfileNav(true)
    socket.emit('getUserInformation');
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
                <input type="button" className={`secondLayer returnBack`} />
                <input type="button" className={`secondLayer ${profileStyles.RelationWithCurrentUser}`} />
              </>
                : <input type="button" className={`secondLayer ${profileStyles.editProfile}`}
                  onClick={ShowEditProfile}
                />
            }
            <input type="button" className={`secondLayer ${profileStyles.profilePosts} pickedInput`} />
          </> : null
        }
        {
          editProfileNav ? <>
            <input type="button" className={`secondLayer returnBack`}
              onClick={ReturnToProfile}
            />
            <input type="button" className={`secondLayer ${profileStyles.editPic} ${editPic ? "pickedInput" : null}`}
              onClick={ShowEditPic}
            />
            <input type="button" className={`secondLayer ${profileStyles.editInfo} ${editInfo ? "pickedInput" : null}`}
              onClick={ShowEditInfo}
            />
            <input type="button" className={`secondLayer ${profileStyles.changePass} ${editPassword ? "pickedInput" : null}`}
              onClick={ShowEditPassword}
            />
          </> : null
        }

      </div>
      {
        mainNav ?             
        <div className={`${"secondLayer"} ${profileStyles.headerView}`} style={{ backgroundImage: CurrentProfile.wallpaperPicType ? `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` : 'none'}}>
          <div className={`${"secondLayer"} ${profileStyles.userDataPosition}`}>
            <div className={`${"secondLayer"} ${profileStyles.profPic}`} style={{ backgroundImage: CurrentProfile.profilePicType ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` : 'none'}}></div>
            <div className={`${profileStyles.userInfoContainer}`}>
              <div className={`${profileStyles.profileUsername}`}>{CurrentProfile.name}</div>
              <div className={`${profileStyles.profileUserCode}`}>{`#`}{CurrentProfile.code}</div>
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
               <div className={`${profileStyles.editPicContainer}`} >
                <div className={`secondLayer ${profileStyles.displayPic}`} style={{ width: "120px", height: "120px", backgroundImage: CurrentProfile.profilePicType ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.picToken + "/file." + CurrentProfile.profilePicType + "?ver=" + Date.now()})` : 'none'}} ></div>
                    
                    {
                      profilePercentage ? <>
                        <span className={`${profileStyles.picPercent}`}>{profilePercentage}</span>
                        {/* <input type="button" value="Cancel"  className={`pickedInput`}/> */}
                      </> : <label htmlFor="EditUserProfilePic" className={`secondLayer`}>Change My Profile Picture</label>
                    }
                    <input type="file" accept="image/*" name="image" id="EditUserProfilePic"
                      onChange={uploadImage(1)} style={{ display: "none" }}
                    />
               </div>
               
               
                  <div className={`${profileStyles.editPicContainer}`}>
                    <div className={`secondLayer ${profileStyles.displayPic}`} style={{ backgroundImage: `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.picToken + "/file." + CurrentProfile.wallpaperPicType + "?ver=" + Date.now()})` }}></div>
                    {
                      wallpaperPercentage ? <>
                        <span className={`${profileStyles.picPercent}`}>{wallpaperPercentage}</span>
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
                  <form className={`${profileStyles.formContainer}`}>
                    
                      
                        <label>Old Password</label>
                        <Field name="oldPassword" type="password" placeholder="Type your password..." maxLength={50} component={InputField}  errorState={oldPassword}/>
                      
                        <label>New Password</label>
                        <Field name="newPassword" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} errorState={newPassword}/>

                        <label>Confirm Password</label>
                        <Field name="confPassword" type="password" placeholder="Re-type your new password..." maxLength={50} component={InputField} disabled={false}  errorState={confPassword}/>

                        <input type="button" value=""  className={`mainButton pickedInput ${profileStyles.saveProfileData}`} onClick={()=>{ 
                          socket.emit("editPassword", {
                            oldPassword: values.oldPassword,
                            confPassword: values.confPassword,
                            newPassword: values.newPassword
                          }); 
                      }}/>
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
                  <form className={`${profileStyles.formContainer}`}>

                        <label htmlFor="firstName">First Name</label>
                        <Field name="firstName" type="text" placeholder="ex. Axel" maxLength={26} component={InputField} />
                      
                        <label htmlFor="lastName">Last Name</label>
                        <Field name="lastName" type="text" placeholder="ex. Brock" maxLength={26} component={InputField} />

                        <label htmlFor="email">Email</label>
                        <Field name="email" type="email" placeholder="ex. whatever@whatever.com" maxLength={50} component={InputField} disabled />
                      
                        <label htmlFor="username">Username</label>
                        <Field name="username" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                      
                    
                      <label className="title">Gender</label>
                      <div  className={`${profileStyles.radioContainer} `}>
                        <label htmlFor="male" className={`${"secondLayer"} ${values.gender == 1 ? "pickedInput" : null} ${profileStyles.radioLabel} `}>Male</label>
                        <Field type="radio" id="male" name="gender" className={profileStyles.radioInput} value={1} />
                        <label htmlFor="female" className={`${"secondLayer"} ${values.gender == 0 ? "pickedInput" : null} ${profileStyles.radioLabel} `}>Female</label>
                        <Field type="radio" id="female" name="gender" className={profileStyles.radioInput} value={0} />
                      </div>

                      <label>Birth Date</label>
                      <Field type="date" name="date" className={profileStyles.dateList}></Field>

                    <input type="button" value=""  className={`mainButton pickedInput ${profileStyles.saveProfileData}`} onClick={()=>{socket.emit('editProfileInfo', values)}}/>
                  </form>
                )}</Formik>
                : null
            }
          </> : null
        }




    </>
  )
}


