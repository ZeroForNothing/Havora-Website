import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/RightPanel/FriendsList.module.css'
import { FriendSlot } from './FriendSlot';

export default function FriendsList(){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    const [friendList,SetFriendList] = useState(null)
    let friendPrevListRef = useRef(null);
    useEffect(()=>{
        if(!socket) return;
        socket.on('updateFriendList', (data) => {
            if (data == null) return;
            let friendList = data.friendListJson
            friendPrevListRef.current = friendList
            SetFriendList(friendList)
            //console.log(friendList)
        })
        // socket.on('getFriendRequest', function(data) {
        //     if (data == null) return;
        //     if (data.friendRequests != null) {
        //       let friendRequests = JSON.parse(data.friendRequests);
        //       let form = '';
        //       for (let x in friendRequests)
        //         form += friendRequest(friendRequests[x].username, friendRequests[x].userCode)
        //       $("#NotificationTab #RelationRequestList").empty().append(form)
        //     }
        //   })
        // socket.on('friendIsOnline', function(data) {
        //     let friendname = "FriendName_" + data.username + '-' + data.userCode;
        //     $('#' + friendname).find(".friendStatus").addClass("userStatusOnline");
        //     if (data.clientDevice == 1)
        //       $('#' + friendname).find(".currentPlatform").addClass("GamePlatform")
        //     else if (data.clientDevice == 2)
        //       $('#' + friendname).find(".currentPlatform").addClass("ClientPlatform")
        //     else if (data.clientDevice == 3)
        //       $('#' + friendname).find(".currentPlatform").addClass("WebPlatform")
        //     else if (data.clientDevice == 4)
        //       $('#' + friendname).find(".currentPlatform").addClass("MobilePlatform")
        
        //     $('#' + friendname).appendTo("#OnlineUsersList");
        //     //msgsRecieved(friendname)
        //   });
        // socket.on('appendRequestToNotification', (data) => {
        //     if (data.userCode == null || data.userCode == null) return;
        //     let form = friendRequest(data.username, data.userCode);
        //     $("#NotificationTab #RelationRequestList").prepend(form);
        //     $("#Notification").addClass
        //   })
        // socket.on('TellFriendDisconnected', function(data) {
        //     $("#FriendName_" + data.username).find(".friendStatus").removeClass("userStatusOnline");
        //     if (data.clientDevice == 1)
        //       $("#FriendName_" + data.username).find(".currentPlatform").removeClass("GamePlatform")
        //     else if (data.clientDevice == 2)
        //       $("#FriendName_" + data.username).find(".currentPlatform").removeClass("ClientPlatform")
        //     else if (data.clientDevice == 3)
        //       $("#FriendName_" + data.username).find(".currentPlatform").removeClass("WebPlatform")
        //     else if (data.clientDevice == 4)
        //       $("#FriendName_" + data.username).find(".currentPlatform").removeClass("MobilePlatform")
        //     else
        //       $("#FriendName_" + data.username).children(".currentPlatform").removeClass("WebPlatform").removeClass("MobilePlatform").removeClass("ClientPlatform").removeClass("GamePlatform")
        
        //     $("#FriendName_" + data.username).appendTo("#OfflineUsersList");
        //     arrangeFriendList()
        //   });
        
        //   function arrangeFriendList() {
        //     $('#OfflineUsersList .friendStatusContainer').sort(function(firstElement, secondElement) {
        //       if ($(firstElement).find(".friendName").text() < $(secondElement).find(".friendName").text()) {
        //         return -1;
        //       } else {
        //         return 1;
        //       }
        //     }).appendTo('#OfflineUsersList');
        //     $('#OnlineUsersList .friendStatusContainer').sort(function(firstElement, secondElement) {
        //       if ($(firstElement).find(".friendName").text() < $(secondElement).find(".friendName").text()) {
        //         return -1;
        //       } else {
        //         return 1;
        //       }
        //     }).appendTo('#OnlineUsersList');
        //   }
    },[socket])

    return (
        <div  className={`${styles.FriendsList}`}>

            {/* <div id="EasyAccessButtons" className="friendListContainer">
                <input type="button" id="Settings" />
                <input type="button" id="Notification" />
                <input type="button" id="FindPlayer" />
            </div> */}
            {/* <div id="AccountLink">
                <div className="">
                    <span id="CurrentUserName">username</span>
                    <span id="CurrentUserCode">#0000</span>
                </div>
            </div> */}
            {/* <div id="quickUserInfo">
            <div id="balanceHolder"><span>1.00 $</span></div>
            </div> */}
            <div className="friendListPanelContainer">
                <div className="friendPreview"></div>
                {
                    friendList && friendList.length > 0 ? friendList.map((friend,index) => {
                        return <FriendSlot key={index} socket={socket} username={friend.username} userCode={friend.userCode} unReadMsg={friend.unReadMsg} userClientAvability={friend.userClientAvability} userWebAvability={friend.userWebAvability} userMobileAvability={friend.userMobileAvability} userGameAvability={friend.userGameAvability} profilePicType={friend.profilePicType} picToken={friend.picToken} />
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
    
