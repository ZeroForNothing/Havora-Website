import styles from '../../styles/RightPanel/FriendsList.module.css'
export default function FriendsList(){
    return (
        <>
        {/* <div className={`Nav`}> 
            <input type="button" className={`${styles.discard}`}
            />
            <input type="button" className={`${styles.discard}`}
            />
        </div>  */}
        <div  className={`${"baseLayer"} ${styles.FriendsList}`}>

        </div>
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
        </>
    )
}

    
