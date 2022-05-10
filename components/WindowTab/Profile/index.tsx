import styles from '../../../styles/WindowTab/Profile.module.css'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Content from "../../Components/Content"

export default function ProfileTab({userEmail , ...props}) {
  
  const [mainNav, SetMainNav] = useState(true);
  const [postNav, SetPostNav] = useState(false);
   
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
    prof: number,
    wall: number,
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

      
      socket.on('manageFriendRequest', function(data) {
        console.log(data.relation)
        if(data.name == user.name && data.code == user.code) return;
        if (CurrentProfileRef.current.name == data.name 
          && CurrentProfileRef.current.code == data.code 
          && (data.relation == 3 || data.relation == 2 || data.relation == 1 || data.relation == 0)) {
          SetCurrentProfile(prevState => ({ ...prevState, friendRequest: data.relation }));
        }
      });
  }, [socket]);

  

  if (CurrentProfile == null) return null
  else return (
    <>
      {!postNav ?
              <div className={`Nav`}>
              {
                mainNav ? <>
                  {
                    (user.name != CurrentProfile.name || user.code != CurrentProfile.code) ? <>
                      <div className={`NavButton`} onClick={()=>{
                        window.history.pushState({}, document.title, `/?user=${user.name}&code=${user.code}`);
                        socket.emit('showUserProfile',{
                          name : user.name,
                          code : user.code
                        })
                        socket.emit('getTopPosts',{
                          categoryID : currentCategoryID,
                          name : user.name,
                          code : user.code,
                          page : 1
                        })
                       }}>
                          <span className={`bi bi-arrow-left`}></span>
                          <p>Back to My Profile</p>
                      </div>
                      
                        {
                          CurrentProfile.friendRequest == 1 || CurrentProfile.friendRequest == -1 ? 
                          <>
                            { CurrentProfile.friendRequest == -1 ?
                              <div className={`NavButton`} onClick={()=>{
                                socket.emit('manageFriendRequest', { response: 1 })
                                }}>
                                  <span className={`bi bi-person-check`}></span>
                                  <p>Accept Request</p>
                                </div> : null
                            }
                            <div className={`NavButton`} onClick={()=>{
                              socket.emit('manageFriendRequest')
                            }}>
                              <span className={`bi bi-person-x`}></span>
                              <p>Cancel Request</p>
                            </div>
                            </> 
                            : <div className={`NavButton`} onClick={()=>{
                              socket.emit('manageFriendRequest')
                             }}>
                              <span className={`${CurrentProfile.friendRequest == 2 ? 'bi bi-person-dash' : 'bi bi-person-plus'}`}></span>
                              <p>
                                { CurrentProfile.friendRequest == null || CurrentProfile.friendRequest == 0 ? 'Add Friend'
                                : CurrentProfile.friendRequest == 2 ? 'Remove Friend' : null}
                              </p>
                            </div> 
                        }
                      
                    </>
                      : 
                        null
                  }

                  <div className={`NavButton pickedInput`}>
                          <span className={`bi bi-list-nested`}></span>
                          <p>Posts</p>
                  </div>
                  <div className={`NavButton`} onClick={()=>{    
                    socket.emit("startCreatingPost", { 
                        type : user.name === CurrentProfile.name && user.code === CurrentProfile.code ? 1 : 3,
                        name : CurrentProfile ? CurrentProfile.name : null,
                        code : CurrentProfile ? CurrentProfile.code : null
                      })
                  }}>
                        <span className={`bi bi-plus-square`}></span>
                        <p>Create Post</p>
                  </div>
                </> : null
              }
      
            </div> : null
      }
        <div className={`${ postNav ? "MainDisplayContentContainer" :"MainDisplay"}`}>
        {
        mainNav ?             
        <div className={`${"secondLayer"} ${styles.headerView}`} style={{ backgroundImage: CurrentProfile.wall ? `url(${"/MediaFiles/WallpaperPic/" + CurrentProfile.token + "/" + CurrentProfile.wall + "?ver=" + Date.now()})` : 'none'}}>
          <div className={`${"secondLayer"} ${styles.userDataPosition}`}>
            <div className={`${"secondLayer"} ${styles.profPic}`} style={{ backgroundImage: CurrentProfile.prof ? `url(${"/MediaFiles/ProfilePic/" + CurrentProfile.token + "/" + CurrentProfile.prof + "?ver=" + Date.now()})` : 'none'}}></div>
            <div className={`${styles.userInfoContainer}`}>
              <div className={`${styles.profileUsername}`}>{CurrentProfile.name}</div>
              <div className={`${styles.profileUserCode}`}>{`#`}{CurrentProfile.code}</div>
            </div>
          </div>
        </div> : null
      }
        {
          <Content socket={socket} user={user} currentCategoryID={currentCategoryID} SetCurrentCategoryID={SetCurrentCategoryID} CurrentProfile={CurrentProfile} mainNav={mainNav} postNav={postNav} SetMainNav={SetMainNav} SetPostNav={SetPostNav}/>
        }
      
      </div>

    </>
  )
}


