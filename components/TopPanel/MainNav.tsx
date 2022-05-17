import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import styles from '../../styles/TopPanel/Nav.module.css'
import { ShowError } from '../fields/error';

export default function MainNav(){
    let { socket } = useSelector((state: any) => state.socket)
    let { user } = useSelector((state: any) => state.user)
    let [ShowDropdown,SetShowDropdown] = useState(false)
    useEffect(() => {
        if(!socket) return;
    }, [socket]);

    const OpenWindow = (window) => {
        if(!socket) return;
        socket.emit('OpenWindow',{
            window
        })
    };
    return (
        <div  className={`baseLayer ${styles.TopPanel}`}>
            <div className={`${styles.UtilityTools}`}>
                <div id="Home" onClick={()=> OpenWindow("Home")} className={`WindowButton pickedInput NavButton`}>
                    <span className={`bi bi-house`}></span>
                    <p>Home</p>
                </div>
                <div id="Community" onClick={()=> OpenWindow("Community")} className={`WindowButton NavButton`}>
                    <span className={`bi bi-people`}></span>
                    <p>Community</p>
                </div>
                <div id="Store" onClick={()=> OpenWindow("Store")} className={`WindowButton NavButton`}>
                    <span className={`bi bi-bag`}></span>
                    <p>Store</p>
                </div>
                <div id="Library" onClick={()=> OpenWindow("Library")} className={`WindowButton NavButton`}>
                    <span className={`bi bi-collection`}></span>
                    <p>Library</p>
                </div>
                {/* <input type="button" id="Settings" className={`${styles.Settings}`} onClick={OpenWindow} /> */}
                {/* <input type="button" id="Notification" className={`${styles.Notification}`} onClick={OpenWindow}  /> */}
                {/* <input type="button" id="FindPlayer" className={`${styles.FindPlayer}`} onClick={OpenWindow} /> */}
                {/* <input type="button" id="AccountLink" className={`${styles.AccountLink}`} onClick={OpenWindow} /> */}
                {/* <input type="button" id="Profile" className={` ${styles.profile}`} onClick={OpenWindow} /> */}
                {/* <input type="button" id="MusicPlayer" className={` ${styles.MusicPlayer}`} onClick={OpenWindow} /> */}
                {/* <input type="button" id="Inventory" className={` ${styles.inventory}`} /> */}
                {/* <input type="button" id="Clan" className={` ${styles.clan}`} /> */}
                {/* <input type="button" id="PartyGroup" className={` ${styles.partyGroup}`} /> */}
                {/* <input type="button" id="Friends" className={` ${styles.friends}`} /> */}
            </div>
            <div className={`${styles.profileHolder}`}>

                <div className={`${styles.profileButton}`} onClick={()=> {
                    window.history.pushState({}, document.title, `/?user=${user.name}&code=${user.code}`);
                    OpenWindow("Profile")
                }} >
                <span className={`${"secondLayer"} ${styles.image}`} style={{ backgroundImage: user.prof ? `url(${"/MediaFiles/ProfilePic/" + user.token + "/" + user.prof })` : 'none'}} ></span>
                    <div>
                        <p>{user.name}</p>
                        <span className='hyphen'>#
                        {user.code && user.code.toString().length == 1 ? "000" : ""}
                        {user.code && user.code.toString().length == 2 ? "00" : ""}
                        {user.code && user.code.toString().length == 3 ? "0" : ""}
                        {user.code}
                        </span>
                    </div>
                </div>
                <div className={`${styles.dropdown}`} onClick={()=>{SetShowDropdown(!ShowDropdown)}}>
                    <span className={`dropdownIcon bi ${ShowDropdown ? 'bi bi-chevron-up' : 'bi-chevron-down'}`}></span>
                </div>
                {
                    ShowDropdown ?  
                    <div className={`baseLayer ${styles.dropdownContainer}`}>
                        <div onClick={()=> {
                            SetShowDropdown(false);
                            OpenWindow("Settings")
                        }} className={`NavButton secondLayer`}>
                            <span className={`bi bi-gear`}></span>
                            <p>Settings</p>
                        </div>
                        <div onClick={async ()=> {  
                            SetShowDropdown(false)      
                            const response = await fetch("/api/logout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                            });
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                ShowError("Signout failed")
                            }
                        }} className={`NavButton secondLayer pickedInput`}>
                            <span className={`bi bi-box-arrow-right`}></span>
                            <p>Sign Out</p>
                        </div>
                    </div> : null
                }
               
               
            </div>
            {/* <div id="Profile" className={`${"baseLayer"}  ${styles.Profile}`} >
                <input type="button" className={`${"secondLayer"} ${"outsideShadow"}`}/>
                <div>
                    <span id="CurrentUserName" className={`${styles.CurrentUserName}`}>name</span>
                    <span id="CurrentUserCode" className={`${styles.CurrentUserCode}`}>#0000</span>
                </div>
            </div> */}
            {/* <div id="quickUserInfo" className={`${"baseLayer"} ${styles.quickUserInfo} ${styles.container}`}>
                <div id="ZeroCoinHolder" className={`${"secondLayer"} ${"borderColor"} ${styles.ZeroCoinHolder}`}>
                    <span>0</span>
                    <input type="button" className={`${styles.ZeroCoin} ${styles.CoinImage}`}  />
                </div>
                <div id="NormalCoinHolder" className={`${"secondLayer"} ${"borderColor"} ${styles.NormalCoinHolder}`}>
                    <span>0</span>
                    <input type="button" className={`${styles.NormalCoin} ${styles.CoinImage}`}  />
                </div>
            </div> */}
            
        </div>
    )
    
}