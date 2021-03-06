import React, { useRef, useState } from "react"
import styles from '../../styles/RightPanel/FriendsList.module.css'

export const FriendSlot = ({ socket, name, code, unReadMsg, userClientAvability, userWebAvability, userMobileAvability, userGameAvability, prof, wall, token, SetPreview, inviteToCall, callUser })=>{
    const slotRef = useRef(null);
    return (
    <div className={`WindowButton ${styles.friendStatus} ${unReadMsg > 0 ? styles.gotMsgFromFriend: '' } ${userClientAvability == 1 || userWebAvability == 1 || userMobileAvability == 1 || userGameAvability == 1 ? styles.userStatusOnline: '' }`}
        onClick={() => { SetPreview({name, code , prof , wall , token : token , top : slotRef.current.offsetTop}) }} ref={slotRef}>

            <div className={`secondLayer ${styles.friendIcon}`} style={{ backgroundImage: prof ? `url(/MediaFiles/ProfilePic/${token}/${prof})` : 'none' }} ></div>
            {/* <div className={`${styles.currentPlatform} ${userGameAvability == 1 ? styles.GamePlatform : ""} ${userClientAvability == 1 ? styles.ClientPlatform : ""} ${userWebAvability == 1 ? styles.WebPlatform : ""} ${userMobileAvability == 1 ? styles.MobilePlatform : ""}`}></div> */}
            <div className={`${styles.friendText}`}>
                <span>{name}</span>
                <span className={`hyphen`}>#
                    {code && code.toString().length == 1 ? "000" : ""}
                    {code && code.toString().length == 2 ? "00" : ""}
                    {code && code.toString().length == 3 ? "0" : ""}
                    {code}
                </span>
            </div>
            {
                inviteToCall ? <div className={`pickedInput ${styles.inviteToCall}`} onClick={(e)=>{ 
                    socket.emit("inviteToLobby" , {name, code})
                }}>
                    <span>{`Invite`}</span>
                </div> : <>
                    {
                        unReadMsg > 0  ? 
                        <div className={`${styles.unreadMsgAlert}`} >
                            <span>{unReadMsg}{` msg${unReadMsg > 1? 's' : ''}`}</span>
                        </div> : null
                    }
                </>
            }
            
            
    </div>
    )
}