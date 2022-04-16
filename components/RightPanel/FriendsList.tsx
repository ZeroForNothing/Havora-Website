import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/RightPanel/FriendsList.module.css'
import { FriendSlot } from './FriendSlot';

export default function FriendsList(){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    const [friendList,SetFriendList] = useState(null)

    useEffect(()=>{
        if(!socket) return;
        socket.on('updateFriendList', (data) => {
            if (data == null) return;
            let friendList = data.friendListJson
            SetFriendList(friendList)
            console.log(friendList)
          })
    },[socket])

    return (
        <div  className={`${"baseLayer"} ${styles.FriendsList}`}>

            <div id="EasyAccessButtons" className="friendListContainer">
                <input type="button" id="Settings" />
                <input type="button" id="Notification" />
                <input type="button" id="FindPlayer" />
            </div>
            <div id="AccountLink">
                <div className="">
                    <span id="CurrentUserName">username</span>
                    <span id="CurrentUserCode">#0000</span>
                </div>
            </div>
            <div id="quickUserInfo">
            <div id="balanceHolder"><span>1.00 $</span></div>
            </div>
            <div className="friendListPanelContainer">
                <div className="friendPreview"></div>
                {
                    friendList ? friendList.map(friend => {
                        <FriendSlot username={friend.username} userCode={friend.userCode} unReadMsg={friend.unReadMsg} userClientAvability={friend.userClientAvability} userWebAvability={friend.userWebAvability} userMobileAvability={friend.userMobileAvability} userGameAvability={friend.userGameAvability} profilePicType={friend.profilePicType} picToken={friend.picToken} />
                    }) : 'No friends yet'
                }
            </div>
        </div>
    )
}
{/* <div className="onGoingCallContainer">
    <div className="callerUserPic"></div>
    <input type="button" className="userHangupCall" />
</div> */}
{/* <div className="friendListCallContainer">
<div className="callerUserPic"></div>
<div className="callerUserName"><span>username</span></div>
<div className="callButtonFriendDiv">
    <input type="button" className="callButtonFriend answerFriendCall" />
</div>
<div className="callButtonFriendDiv">
    <input type="button" className="callButtonFriend hangupFriendCall" />
</div>
</div> */}

        {/* <div classNameName={`${styles.onGoingCallContainer}`}>
            <div classNameName={`${styles.callerUserPic}`}></div>
            <input type="button" classNameName={`${styles.userHangupCall}`}/>
            </div>
            <div classNameName={`${styles.friendListCallContainer}`}>
            <div classNameName={`${styles.callerUserPic}`}></div>
            <div classNameName={`${styles.callerUserName}`}><span>username</span></div>
            <div classNameName={`${styles.callButtonFriendDiv}`}>
                <input type="button" classNameName={`${styles.callButtonFriend} ${styles.answerFriendCall}`}/>
            </div>
            <div classNameName={`${styles.callButtonFriendDiv}`}>
                <input type="button" classNameName={`${styles.callButtonFriend} ${styles.hangupFriendCall}`}/>
            </div>
            </div>
            <div classNameName={`${styles.friendListPanelContainer}`}>
            <div classNameName={`${styles.friendPreview}`}></div>
            <div id="OnlineUsersList" classNameName={`${styles.OnlineUsersList}`}></div>
            <div id="OfflineUsersList" classNameName={`${styles.OfflineUsersList}`}></div>
            </div> */}
    
