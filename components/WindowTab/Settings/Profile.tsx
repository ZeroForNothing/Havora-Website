import { Field, Formik } from "formik"
import { InputField } from '../../fields/InputField'
import styles from '../../../styles/WindowTab/Profile.module.css'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ShowError } from "../../fields/error"
import axios from "axios"
import moment from "moment"
import Content from "../../Components/Content"

export default function ProfileTab({userEmail , editInfo, SetEditInfo, editPic, SetEditPic, editProfileNav, SetEditProfileNav, ...props}) {

  const [profilePercentage, SetProfilePercentage] = useState(null);
  const [wallpaperPercentage, SetWallpaperPercentage] = useState(null);
   
  let { user } = useSelector((state: any) => state.user)
  let { socket } = useSelector((state: any) => state.socket)
  
  let [CurrentProfile, SetCurrentProfile] = useState<Profile>(null)
  const CurrentProfileRef = useRef<Profile>(CurrentProfile)

  const [currentCategoryID, SetCurrentCategoryID] = useState<number>(1);

  //const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/;    
  //const strongPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  //const mediumPasswordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

  //const nameRegex = new RegExp("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$");

  let [UserInformation, SetUserInformation] = useState<UserInformation>(null)

  type UserInformation = {
    firstName: string,
    lastName: string,
    name: string,
    email: string,
    gender: number,
    date: string
  }

  type Profile = {
    token: string,
    prof: string,
    wall: string,
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
        name : userParam,
        code : codeParam
      })
      socket.on('setProfileData', (data) => {
        let jsonData = {
          name: data.name,
          code: data.code,
          token: data.token,
          wall: data.wall,
          prof: data.prof
        } as Profile
        SetCurrentProfile({
          name: data.name,
          code: data.code,
          token: data.token,
          wall: data.wall,
          prof: data.prof,
          friendRequest : data.friendRequest
        });
        CurrentProfileRef.current = jsonData;
        //SetWaitingForPost(true);
      })

      
      
      socket.on('editProfileInfo', function(data) {
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
      });
    
      socket.on('getUserInformation', function(data) {
        if (data != null) {
          SetUserInformation({
            firstName: data.firstname,
            lastName: data.lastname,
            name: data.name,
            email: data.email,
            gender: data.gender,
            date: moment(data.birthDate).format('YYYY-MM-DD')
          })
        } else {
          ShowError("Couldn't get user information")
        }
      });
      socket.on('manageFriendRequest', function(data) {
        console.log(data.relation)
        if(data.name == user.name && data.code == user.code) return;
        if (CurrentProfileRef.current.name == data.name 
          && CurrentProfileRef.current.code == data.code 
          && (data.relation == 3 || data.relation == 2 || data.relation == 1 || data.relation == 0)) {
          SetCurrentProfile(prevState => ({ ...prevState, friendRequest: data.relation }));
        }
      });
      socket.on('updateUserPicture', function(data) {
        if (data.prof == "Profile"){
          SetProfilePercentage(null)
          SetCurrentProfile(prevState => ({ ...prevState, prof: data.fileName }));
        }
        else {
          SetWallpaperPercentage(null)
          SetCurrentProfile(prevState => ({ ...prevState, wall: data.fileName }));
        }
      });
  }, [socket]);


  function checkAcceptedExtensions (file) {
    const type = file.type.split('/').pop()
    const accepted = ['jpeg', 'jpg', 'png']
    if (accepted.indexOf(type) == -1) {
      return false
    }
    return true
  }
  const uploadImage = prof => async e => {
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
    if (prof == "Profile") {
      // SetProfilePic(src)
      SetProfilePercentage(perc)
    }
    else if (prof == "Wallpaper") {
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
        url: "/profileUpload?token=" + user.token+'&prof='+prof,
        data: form,
        onUploadProgress: (progress) => {
          let ratio = progress.loaded / progress.total
          let percentage = (ratio * 100).toFixed(2) + "%";

          if (prof == "Profile") SetProfilePercentage(percentage)
          else SetWallpaperPercentage(percentage)
        }
      }).then(response => {
        if (response.data.ok) {
          socket.emit('updateUserPicture' , {
            prof,
            fileName : response.data.fileName
          })
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
      <div className={`${"MainDisplay"}`}>
      
        

      {
        editProfileNav ? <>
            {
              editPic ? <>
               <div className={`${styles.editPicContainer}`} >
                <div className={`secondLayer ${styles.displayPic}`} style={{ width: "120px", height: "120px", backgroundImage: CurrentProfile.prof ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.token + "/" + CurrentProfile.prof + "?ver=" + Date.now()})` : 'none'}} ></div>
                    
                    {
                      profilePercentage ? <>
                        <span className={`${styles.picPercent}`}>{profilePercentage}</span>
                        {/* <input type="button" value="Cancel"  className={`pickedInput`}/> */}
                      </> : <label htmlFor="EditUserProfilePic" className={`secondLayer`}>Change My Profile Picture</label>
                    }
                    <input type="file" accept="image/*" name="image" id="EditUserProfilePic"
                      onChange={uploadImage('Profile')} style={{ display: "none" }}
                    />
               </div>
               
               
                  <div className={`${styles.editPicContainer}`}>
                    <div className={`secondLayer ${styles.displayPic}`} style={{ backgroundImage: `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.token + "/" + CurrentProfile.wall + "?ver=" + Date.now()})` }}></div>
                    {
                      wallpaperPercentage ? <>
                        <span className={`${styles.picPercent}`}>{wallpaperPercentage}</span>
                        {/* <input type="button" value="Cancel" className={`pickedInput`}/> */}
                      </> : <label htmlFor="EditUserWallpaperPic" className={`secondLayer`}>Change My Wallpaper Picture</label>
                    }
                    <input type="file" accept="image/*" name="image" id="EditUserWallpaperPic"
                      onChange={uploadImage('Wallpaper')} style={{ display: "none" }}
                    />
                  </div>
                
              </> : null
            }
            
            {
              editInfo ?
                <Formik onSubmit={(values) => {  }} initialValues={{
                  firstName: UserInformation.firstName,
                  lastName: UserInformation.lastName,
                  name: UserInformation.name,
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
                      
                        <label htmlFor="name">Username</label>
                        <Field name="name" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                      
                    
                      <label className="title">Gender</label>
                      <div  className={`${styles.radioContainer} `}>
                        <label htmlFor="male" className={`${"secondLayer"} ${values.gender == 1 ? "pickedInput" : null} ${styles.radioLabel} `}>Male</label>
                        <Field type="radio" id="male" name="gender" className={styles.radioInput} value={1} />
                        <label htmlFor="female" className={`${"secondLayer"} ${values.gender == 0 ? "pickedInput" : null} ${styles.radioLabel} `}>Female</label>
                        <Field type="radio" id="female" name="gender" className={styles.radioInput} value={0} />
                      </div>

                      <label>Birth Date</label>
                      <Field type="date" name="date" className={styles.dateList}></Field>
                      <div className={`NavButton pickedInput`} onClick={()=>{
                          socket.emit('editProfileInfo', values)
                        }}>
                            <span className={`bi bi-save`}></span>
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


