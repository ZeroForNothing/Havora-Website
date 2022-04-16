import React from "react"

export const FriendSlot = ({ username,userCode, unReadMsg ,userClientAvability , userWebAvability ,userMobileAvability ,userGameAvability , profilePicType , picToken }: any)=>{
    return (
    <div className={`friendStatusContainer`}>
        <div className={`friendStatus ${unReadMsg > 0 ? 'gotMsgFromFriend': ' ' } ${userClientAvability == 1 || userWebAvability == 1 || userMobileAvability == 1 || userGameAvability == 1 ? 'userStatusOnline': ' ' }`}>
            <div className={`friendIcon`} style={{ backgroundImage: profilePicType ? `url(/MediaFiles/ProfilePic/${picToken}/file.${profilePicType})` : 'none' }} ></div>
            <div className={`currentPlatform ${userGameAvability == 1 ? "GamePlatform" : " "} ${userClientAvability == 1 ? "ClientPlatform" : " "} ${userWebAvability == 1 ? "WebPlatform" : " "} ${userMobileAvability == 1 ? "MobilePlatform" : " "}`}></div>
            <div className={`friendText friendName`}>
                <span>{username}</span>
            </div>
            <div className={`friendText friendOpinion`}>
                <span>{userCode}</span>
            </div>
            <div className={`unreadMsgAlert ${unReadMsg < 1 ? 'hideMsgAlert' : ' '}`} >
                <span>{unReadMsg}{` msg${unReadMsg > 1? 's' : ''}`}</span>
            </div>
        </div>
    </div>
    )
}