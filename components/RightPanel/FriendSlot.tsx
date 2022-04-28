import React from "react"
import styles from '../../styles/RightPanel/FriendsList.module.css'

export const FriendSlot = ({ socket,username,userCode, unReadMsg ,userClientAvability , userWebAvability ,userMobileAvability ,userGameAvability , profilePicType , picToken }: any)=>{
    return (
    <div className={`borderColor WindowButton ${styles.friendStatus} ${unReadMsg > 0 ? styles.gotMsgFromFriend: '' } ${userClientAvability == 1 || userWebAvability == 1 || userMobileAvability == 1 || userGameAvability == 1 ? styles.userStatusOnline: '' }`}
    onClick={()=> {
        socket.emit('showChatWindow',{
            username,
            userCode
        }); 
    }}>
            <div className={`secondLayer ${styles.friendIcon}`} style={{ backgroundImage: profilePicType ? `url(/MediaFiles/ProfilePic/${picToken}/${profilePicType})` : 'none' }} ></div>
            <div className={`${styles.currentPlatform} ${userGameAvability == 1 ? styles.GamePlatform : ""} ${userClientAvability == 1 ? styles.ClientPlatform : ""} ${userWebAvability == 1 ? styles.WebPlatform : ""} ${userMobileAvability == 1 ? styles.MobilePlatform : ""}`}></div>
            <div className={`${styles.friendText}`}>
                <span>{username}</span>
                <span className={`userCode`}>#
                {userCode && userCode.toString().length == 1 ? "000" : ""}
                {userCode && userCode.toString().length == 2 ? "00" : ""}
                {userCode && userCode.toString().length == 3 ? "0" : ""}
                {userCode}
                </span>
            </div>
            <div className={`${styles.unreadMsgAlert} ${unReadMsg < 1 ? styles.hideMsgAlert : ''}`} >
                <span>{unReadMsg}{` msg${unReadMsg > 1? 's' : ''}`}</span>
            </div>
    </div>
    )
}