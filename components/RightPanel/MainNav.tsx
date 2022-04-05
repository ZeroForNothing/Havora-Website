import styles from '../../styles/RightPanel/MainNav.module.css'
export default function MainNav(){
    return (
        <div  className={`${styles.RightPanel}`}>
            <div className={`${"baseLayer"} ${styles.UtilityTools}`}>
                <input type="button" id="Home" className={`${`pickedInput`} ${styles.home}`} />
                <input type="button" id="Settings" className={`${`WindowButton`} ${styles.Settings}`} />
                <input type="button" id="Notification" className={`${`WindowButton`} ${styles.Notification}`}  />
                <input type="button" id="FindPlayer" className={`${`WindowButton`} ${styles.FindPlayer}`}  />
                <input type="button" id="AccountLink" className={`${`WindowButton`} ${styles.AccountLink}`} />
                <input type="button" id="Community" className={`${`WindowButton`} ${styles.community}`} />
                <input type="button" id="Profile" className={`${`WindowButton`} ${styles.profile}`} />
                <input type="button" id="Post" className={`${`WindowButton`} ${styles.Post}`}  />
                <input type="button" id="MusicPlayer" className={`${`WindowButton`} ${styles.MusicPlayer}`} />
                <input type="button" id="Store" className={`${`WindowButton`} ${styles.store}`} />
                <input type="button" id="Lobby" className={`${`WindowButton`} ${styles.lobby}`} />
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
            {/* <div className={`${styles.onGoingCallContainer}`}>
            <div className={`${styles.callerUserPic}`}></div>
            <input type="button" className={`${styles.userHangupCall}`}/>
            </div> */}
            {/* <div className={`${styles.friendListCallContainer}`}>
            <div className={`${styles.callerUserPic}`}></div>
            <div className={`${styles.callerUserName}`}><span>username</span></div>
            <div className={`${styles.callButtonFriendDiv}`}>
                <input type="button" className={`${styles.callButtonFriend} ${styles.answerFriendCall}`}/>
            </div>
            <div className={`${styles.callButtonFriendDiv}`}>
                <input type="button" className={`${styles.callButtonFriend} ${styles.hangupFriendCall}`}/>
            </div>
            </div> */}
            {/* <div className={`${styles.friendListPanelContainer}`}>
            <div className={`${styles.friendPreview}`}></div>
            <div id="OnlineUsersList" className={`${styles.OnlineUsersList}`}></div>
            <div id="OfflineUsersList" className={`${styles.OfflineUsersList}`}></div>
            </div> */}
        </div>
    )
}

    
