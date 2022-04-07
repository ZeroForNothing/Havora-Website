import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import styles from '../../styles/MainNav.module.css'
export default function MainNav(){
    let { socket } = useSelector((state: any) => state.socket)

    useEffect(() => {
        if(!socket) return;
    }, [socket]);

    const OpenWindow = e => {
        e.preventDefault();
        if(!socket) return;
        socket.emit('OpenWindow',{
            window : e.target.id
        })
    };
    return (
        <div  className={`${styles.RightPanel}`}>
            <div className={`${"baseLayer"} ${styles.UtilityTools}`}>
                <input type="button" id="Home" className={`${`pickedInput WindowButton`} ${styles.home}`} onClick={OpenWindow} />
                <input type="button" id="Settings" className={`${`WindowButton`} ${styles.Settings}`} onClick={OpenWindow} />
                <input type="button" id="Notification" className={`${`WindowButton`} ${styles.Notification}`} onClick={OpenWindow}  />
                <input type="button" id="FindPlayer" className={`${`WindowButton`} ${styles.FindPlayer}`} onClick={OpenWindow} />
                <input type="button" id="AccountLink" className={`${`WindowButton`} ${styles.AccountLink}`} onClick={OpenWindow} />
                <input type="button" id="Community" className={`${`WindowButton`} ${styles.community}`} onClick={OpenWindow} />
                <input type="button" id="Profile" className={`${`WindowButton`} ${styles.profile}`} onClick={OpenWindow} />
                <input type="button" id="Post" className={`${`WindowButton`} ${styles.Post}`} onClick={OpenWindow} />
                <input type="button" id="MusicPlayer" className={`${`WindowButton`} ${styles.MusicPlayer}`} onClick={OpenWindow} />
                <input type="button" id="Store" className={`${`WindowButton`} ${styles.store}`} onClick={OpenWindow} />
                <input type="button" id="Lobby" className={`${`WindowButton`} ${styles.lobby}`} onClick={OpenWindow} />
                {/* <input type="button" id="Inventory" className={`${`WindowButton`} ${styles.inventory}`} /> */}
                {/* <input type="button" id="Clan" className={`${`WindowButton`} ${styles.clan}`} /> */}
                {/* <input type="button" id="PartyGroup" className={`${`WindowButton`} ${styles.partyGroup}`} /> */}
                {/* <input type="button" id="Friends" className={`${`WindowButton`} ${styles.friends}`} /> */}
            </div>
            {/* <div id="Profile" className={`${"baseLayer"} ${`WindowButton`} ${styles.Profile}`} >
                <input type="button" className={`${"secondLayer"} ${"outsideShadow"}`}/>
                <div>
                    <span id="CurrentUserName" className={`${styles.CurrentUserName}`}>username</span>
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

    
