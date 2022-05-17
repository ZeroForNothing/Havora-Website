import { useState } from "react";
import { useSelector } from "react-redux";
import Appearance from "./Appearance";
import ProfileTab from "./Profile";
import Security from "./Security";

export default function SettingsTab({ userEmail, ...props }) {
  const [mainNav, SetMainNav] = useState(true);
  const [editProfileNav, SetEditProfileNav] = useState(false);
  const [editSecurityNav, SetEditSecurityNav] = useState(false);
  const [editAppearanceNav, SetEditAppearanceNav] = useState(false);
  // const [editOverviewNav, SetEditOverviewNav] = useState(true);
  const [editInfo, SetEditInfo] = useState(null);
  const [editPic, SetEditPic] = useState(true);
  const [editPassword, SetEditPassword] = useState(true);
  const [editTheme, SetEditTheme] = useState(true);

  let { socket } = useSelector((state: any) => state.socket);

  function selectNav(parentId : number) {
    // SetEditOverviewNav(false);    // - Overview :   0
    SetEditAppearanceNav(false);  // - Appearance : 1
    SetEditProfileNav(false);     // - Profile :    2
    SetEditSecurityNav(false);    // - Security :   3
    SetMainNav(false);            // - MainNav :    Default

    switch (parentId) {
      case 1:
        SetEditAppearanceNav(true);
        selectNavChild(parentId, 0);
        break;
      case 2:
        SetEditProfileNav(true);
        selectNavChild(parentId, 0);
        break;
      case 3:
        SetEditSecurityNav(true);
        selectNavChild(parentId, 0);
        break;
    
      default:
        SetMainNav(true);
        break;
    }
    
  }
  function selectNavChild(parentId : number, childId: number) {
    
    SetEditTheme(false);      // EditTheme :    parentId = 1, childId = Default or -1 or 1
    SetEditPic(false);        // EditPic :      parentId = 2, childId = Default or -1
    SetEditInfo(false);       // EditInfo :     parentId = 2, childId = 1
    SetEditPassword(false);   // EditPassword : parentId = 3, childId = Default or -1 or 1

    if (parentId == 1) 
      switch (childId) {
        case 1:
          SetEditTheme(true);
          break;
      
        default:
          SetEditTheme(true);
          break;
      }
    
    if (parentId == 2) 
      switch (childId) {
        case 1:
          SetEditInfo(true);
          break;
      
        default:
          SetEditPic(true);
          break;
      }
    
    if (parentId == 3) 
      switch (childId) {
        case 1:
          SetEditPassword(true)
          break;
      
        default:
          SetEditPassword(true)
          break;
      }
    
  }

  return (
    <>
      {
        <div className={`Nav`}>
          {mainNav ? (
            <>
              <div className={`NavButton`} onClick={()=>{
                socket.emit('OpenWindow',{
                  window : "Home"
                })
              }}>
                <span className={`bi bi-arrow-left`}></span>
                <p>Back</p>
              </div>
              <div
                className={`NavButton`}
                onClick={() => {
                  selectNav(1);
                }}
              >
                <span className={`bi bi-brush`}></span>
                <p>Appearance</p>
              </div>
              <div
                className={`NavButton`}
                onClick={() => {
                  selectNav(2);
                  socket.emit("getUserInformation");
                }}
                >
                <span className={`bi bi-person`}></span>
                <p>Profile</p>
              </div>
              <div
                className={`NavButton`}
                onClick={() => {
                  selectNav(3);
                }}
              >
                <span className={`bi bi-shield-check`}></span>
                <p>Security</p>
              </div>
            </>
          ) : null}

          {editAppearanceNav ? (
            <>
              <div 
                className={`NavButton`}
                onClick={()=>{
                  selectNav(-1);
                }}
              >
               <span className={`bi bi-arrow-left`}></span>
                <p>Back</p> 
              </div>
              <div 
                className={`NavButton ${editTheme ? "pickedInput" : ""}`}
                onClick={()=>{
                  selectNavChild(1, -1);
                }}
              >
               <span className={`bi bi-circle-half`}></span>
                <p>Theme</p> 
              </div>
            </>
          ) : null}

          {editSecurityNav ? (
              <>
                <div
                    className={`NavButton`}
                        onClick={()=>{
                            selectNav(-1);
                        }}
                    >
                        <span className={`bi bi-arrow-left`}></span>
                        <p>Back</p>
                    </div>
                <div
                    className={`NavButton ${editPassword ? "pickedInput" : ""}`}
                    onClick={() => {
                    selectNavChild(3, -1)
                    }}
                >
                    <span className={`bi bi-shield-lock`}></span>
                    <p>Edit Password</p>
                </div>
              </>
          ) : null}

          {editProfileNav ? (
            <>
              <div
                className={`NavButton`}
                onClick={() => {
                  selectNav(-1);
                }}
              >
                <span className={`bi bi-arrow-left`}></span>
                <p>Back</p>
              </div>
              <div
                className={`NavButton ${editPic ? "pickedInput" : ""}`}
                onClick={() => {
                  selectNavChild(2, -1);
                }}
                >
                <span className={`bi bi-image`}></span>
                <p>Edit Picture</p>
              </div>
              <div
                className={`NavButton ${editInfo ? "pickedInput" : ""}`}
                onClick={() => {
                  selectNavChild(2, 1);
                }}
              >
                <span className={`bi bi-pencil-square`}></span>
                <p>Edit Info</p>
              </div>
            </>
          ) : null}
        </div>
      }
      <ProfileTab
        SetEditPic={SetEditPic}
        SetEditProfileNav={SetEditProfileNav}
        editInfo={editInfo}
        SetEditInfo={SetEditInfo}
        editPic={editPic}
        editProfileNav={editProfileNav}
        userEmail={userEmail}
      />

      <Security 
        socket={socket}
        SetEditPassword={SetEditPassword}
        editPassword={editPassword}
        editSecurityNav={editSecurityNav}
      />

      <Appearance
        editAppearanceNav={editAppearanceNav}
      />

    </>
  );
}
