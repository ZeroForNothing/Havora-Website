import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/RightPanel/FriendsList.module.css'
import { FriendSlot } from './FriendSlot';
import { GroupSlot } from './GroupSlot';
import Peer from 'simple-peer'
import { ShowError } from '../fields/error';
import { nanoid } from 'nanoid'

export default function FriendsList(){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    const [friendList,SetFriendList] = useState(null)
    let friendPrevListRef = useRef(null);

    interface callerInfo {
        name : string,
        code : number,
        token : string,
        prof ?: string,
        wall ?: string,
        socketID ?: string
    }
    interface callerSignalInfo extends callerInfo{
        signalList : any[],
        connectionID : string
    }
    interface messageInfo extends callerInfo{
        top : string
    }
    interface callerSignalInfoOnly{
        signalList : any[],
        connectionID : string
    }

    const [currentScreenShareStream , SetCurrentScreenShareStream] = useState(null);

	// const [ stream, setStream ] : any = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ calling, setCalling ] = useState(false)
	const [ callInChat, SetCallInChat ] = useState(false)

	const [ callAccepted, setCallAccepted ] = useState(false)


    const [callerSignalInfo , SetCallerSignalInfo] = useState<callerSignalInfoOnly>(null)
    const [callerInfo , SetCallerInfo] = useState<callerInfo>(null)
    const callAnotherInfoRef = useRef<callerInfo>(null)
    const [preview , SetPreview] = useState<messageInfo>(null)
    const previewRef = useRef(null)
    const friendsListSlots = useRef(null)

    const maximizeScreenRef = useRef(null)

    const [biggerView , SetBiggerView] = useState(null);
    const [smallerView , SetSmallerView] = useState(false);
	// const myAudio : any = useRef()

	const ringtone : any = useRef()
	const connectionRef = useRef([])

    const [callStatus , SetCallStatus] = useState(null)
    const [inviteToCall , SetInviteToCall] = useState(false)

    const [lobbyList , SetLobbyList] = useState([])

    const [inCallUserList , SetInCallUserList] = useState([])
    let inCallUserListRef = useRef(inCallUserList);

    function openFullscreen(elem) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
      }
      
      /* Close fullscreen */
      function closeFullscreen(document) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      }

    const callUser = async (userInfo : callerInfo , addPeopleToConnectionID : string) => {

        if(!addPeopleToConnectionID && connectionRef.current.length != 0) {
            //call another person while on call
            callAnotherInfoRef.current = userInfo;
            leaveCall();
            return;
        }
        // else if(!addPeopleToCall){
        //     leaveCall();
        // }
        const localStream = await fetchMediaStream();
        if(!localStream)return;
        
        if(inCallUserListRef.current.length == 0){
            SetInCallUserList(oldArr => { 
                let temp = {muted : false , stream  : localStream , calling : true, prof : user.prof, wall : user.wall , token : user.token};
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr ] 
            });
        }

        SetInCallUserList(oldArr => { 
            let temp = {muted : false , stream  : null , calling : true, prof : userInfo.prof, wall : userInfo.wall , token : userInfo.token};
            inCallUserListRef.current = [temp , ...oldArr ];
            return [temp , ...oldArr ] 
        });
        
        setCalling(true);
        SetCallStatus("Connecting...")
		const peer = new Peer({
            initiator: true,
			trickle: false,
			stream: localStream
		})
        const connectionID = nanoid();

		peer.on("signal", (signal) => {
            SetCallStatus("Calling...")
			socket.emit("callUser", {
				signal,
                name : userInfo.name,
                code : userInfo.code,
                connectionID
			})
		})
        peer.on('track', (track, stream) => {
            manageTrack(track, stream);
        })
		peer.on("stream", (stream) => {
            if(stream.getAudioTracks().length){
                let value = [...inCallUserListRef.current].find(call => call.stream ==  stream)
                const index = [...inCallUserListRef.current].indexOf(value)
                if(index < 0) return;
                SetInCallUserList(oldArr => { 
                    let temp = [...oldArr];
                    temp[index].stream = stream;
                    temp[index].calling = false;
                    inCallUserListRef.current = [...temp];
                    return [...temp]
                });
            }else{
                SetInCallUserList(oldArr => { 
                    let temp = {muted : false , stream , prof : userInfo.prof, wall : userInfo.wall , token : userInfo.token};
                    inCallUserListRef.current = [temp , ...oldArr ];
                    return [temp , ...oldArr ] 
                });
            }
		})
        peer.on('close', () => {
            leaveCall();
        })
        peer.on('error', (err) => {
            console.error(err)
        })
		connectionRef.current = [...connectionRef.current , { peer , connectionID }];
	}

    const answerCall = async () =>  {

        const localStream = await fetchMediaStream();
        if(!localStream)return;

        if(inCallUserListRef.current.length == 0){
            SetInCallUserList(oldArr => { 
                let temp = {muted : false , stream  : localStream , calling : true, prof : user.prof, wall : user.wall , token : user.token};
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr ] 
            });
        }

		setCallAccepted(true)
        setReceivingCall(false);
        SetCallStatus("Answering...")
        manageCallRingtone(true);
        

        callerSignalInfo.signalList.forEach(localSignal => {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: localStream
            })
    
            peer.on("signal", (signal) => {
                SetCallStatus(`In-Call`);
                socket.emit("answerCall", { 
                    signal,
                    socketID : callerInfo.socketID,
                    connectionID : callerSignalInfo.connectionID,
                })
            })
            peer.on('track', (track, stream) => {
                manageTrack(track, stream);
            })
    
            peer.on("stream", (stream) => {
                SetInCallUserList(oldArr => { 
                    let temp = {muted : false , stream , prof : callerInfo.prof , wall : callerInfo.wall , token : callerInfo.token}
                    inCallUserListRef.current = [temp , ...oldArr ];
                    return [temp , ...oldArr]
                 });
            })
            peer.on('close', () => {
                leaveCall();
            })
            peer.on('error', (err) => {
                leaveCall();
                console.error(err)
            })
            peer.signal(localSignal)
            connectionRef.current = [...connectionRef.current , { peer , connectionID : callerSignalInfo.connectionID}];
        });
	}

    function onCloseCall(){
        SetCallerInfo(null);
        SetCallStatus("Call ended");
        setCalling(false);
        setReceivingCall(false);
        setCallAccepted(false);
        SetCallerSignalInfo(null);
        inCallUserListRef.current = [];
        SetInCallUserList([]);
        SetCallInChat(false)

        SetCurrentScreenShareStream(null)

        if(ringtone.current){
            manageCallRingtone(true);
        }
    }
    const manageCallRingtone = (muted) => {
        ringtone.current.muted = muted;
        muted ?  ringtone.current.pause() : ringtone.current.play()
        ringtone.current.currentTime = 0;
    }
	const leaveCall = () => {
        if(connectionRef.current.length != 0){
            connectionRef.current.forEach(conn => {
                conn.peer.destroy();
            });
            connectionRef.current = [];
            onCloseCall();
            if(callAnotherInfoRef.current){
                const temp = callAnotherInfoRef.current;
                callAnotherInfoRef.current = null;
                callUser(temp, null);
            }
        }else{
            onCloseCall();
        }
        socket.emit('hangupCall');
	}
    function manageTrack(track,stream){
        track.addEventListener('mute', () => {
            // track was removed by remote
            if(stream.getVideoTracks().length){
                RemoveShareScreen(stream);
            }
        })
    }
    function RemoveShareScreen(stream){
        let value = [...inCallUserListRef.current].find(call => call.stream ==  stream)
        const index = [...inCallUserListRef.current].indexOf(value)
        if(index < 0) return

        value.stream.getTracks().forEach(track => track.stop());

        SetBiggerView(null);
        
        SetInCallUserList(oldArray => {
            let newArr = [
                ...oldArray.slice(0, index),
                ...oldArray.slice(index + 1),
            ];
            inCallUserListRef.current = newArr
            return newArr;
        })
    }
    function stopScreenShare(){
        if(currentScreenShareStream){
            for (const track of currentScreenShareStream.getTracks()) {
                connectionRef.current.forEach(conn => {
                    conn.peer.removeTrack(track, currentScreenShareStream);
                });
            }
            RemoveShareScreen(currentScreenShareStream);
            SetCurrentScreenShareStream(null);
        }
    }
    async function startScreenCapture() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia();
            SetInCallUserList(oldArr => {
                let temp = {muted : false , stream}; 
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr]
             });
            for (const track of stream.getTracks()) {
                connectionRef.current.forEach(conn => {
                    conn.peer.addTrack(track, stream);
                });
                manageTrack(track,stream)
            }
            SetCurrentScreenShareStream(stream);
        } catch(err) {
          console.error("Error: " + err);
        }
    }
    function volumeActivity(id , stream){
        // detect voice activity
        const audioContext = new AudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        mediaStreamAudioSourceNode.connect(analyserNode);
        const pcmData = new Float32Array(analyserNode.fftSize);
        
        let interval = setInterval(()=>{
            analyserNode.getFloatTimeDomainData(pcmData);
            let sumSquares = 0.0;
            for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
            let volume = Math.sqrt(sumSquares / pcmData.length) * 30;
            volume = volume > 1 ? 1 : volume;
            volume = parseFloat(volume.toFixed(2));
            SetInCallUserList(oldArray => {
                let temp = [...oldArray];
                temp.forEach(element => {
                    if(element.id == id) element.volume = volume;
                });
                inCallUserListRef.current = temp;
                return temp;
            })
            socket.emit('updateVoiceActivity' ,{id , volume})
        }, 500);

    }
    async function fetchMediaStream(){
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        // const id = (Math.random() + 1).toString(36).substring(7);
        // const temp  = {id , muted : true , stream , prof : user.prof , wall : user.wall , token : user.token , volume : 0}
        // SetInCallUserList(oldArr => { 
        //     inCallUserListRef.current = [ temp , ...oldArr ]
        //     return [ temp , ...oldArr ]
        //  });
        //EXPERIMENTAL buggy and takes performance
        // volumeActivity(id , stream);
        return stream;
    }
    useEffect(()=>{
        if(!socket) return;

        socket.on('onEnterLobby',(data)=>{
            SetLobbyList([{ name : data.name }])
        })
        socket.on('startGroupCall', (data) => {
            if(data && data.memberAdded){
                callUser(data.memberAdded , data.connectionID)
            }
        })

        document.addEventListener('click', function(event) {
            if(!previewRef.current) return;
            var isClickInsideElement = previewRef.current.contains((event as any).target);
            var isClickInsideElement2 = friendsListSlots.current.contains((event as any).target);
            if (!isClickInsideElement && !isClickInsideElement2) {
                //Do something click is outside specified element
                SetPreview(null)
            }
        });
        socket.on("updateVoiceActivity", (data) => {
            SetInCallUserList(oldArray => {
                oldArray.forEach(element => {
                    if(element.id == data.id) element.volume = data.volume;
                });
                inCallUserListRef.current = [...oldArray];
                return [...oldArray];
            })
		})
        socket.on("SetCallFromRightPanel", (data) => {
            SetCallInChat(data.callerChatOpened);
		})
        socket.on("callAccepted", (data : callerSignalInfo) => {
            if(connectionRef.current.length != 0) {          
                let content = [...connectionRef.current].find(content => content.connectionID == data.connectionID)
                const index = [...connectionRef.current].indexOf(content)

                if(index < 0) return;
                connectionRef.current[index].peer.signal(data.signalList[0])
                // SetCallerInfo(data); //make it stop ringing in the ui
                SetCallStatus(`In-Call`)
                setCallAccepted(true)
            }
		})
        socket.on("hangupCall", () => {
            onCloseCall();
            ShowError("Hangup: User hanged up");
		})
        socket.on('callRinging',()=>{
            SetCallStatus("Ringing...");
        })
        socket.on('alreadyInCall',()=>{
            leaveCall();
            ShowError("Hangup: User already In-call");
        })
		socket.on("callUser", (data : callerSignalInfo) => {
            if(connectionRef.current.length != 0){
                let content = [...connectionRef.current].find(content => content.connectionID == data.connectionID)
                const index = [...connectionRef.current].indexOf(content)
                if(index < 0) return;
                connectionRef.current[index].peer.signal(data.signalList[0])
                SetCallerSignalInfo({signalList : data.signalList , connectionID : data.connectionID})
            }else{
                // onCloseCall();
                socket.emit("callRinging")
                SetCallStatus(`is calling...`);
                setReceivingCall(true);
                manageCallRingtone(false)
                SetCallerInfo(data);
                SetCallerSignalInfo({signalList : data.signalList , connectionID : data.connectionID})
            }
		})


        socket.on('updateFriendList', (data) => {
            if (data == null) return;
            let friendList = JSON.parse(data.friendListJson)
            friendPrevListRef.current = friendList
            SetFriendList(friendList)
            //console.log(friendList)
        })
        socket.on('msgsRecievedWhileNotTaklingWithUser', (data) => {
            if (!data || !data.message || !data.textID || !data.name || !data.code || !data.unSeenMsgsCount) return;
            if(!data.showUnreadMsgs){
                data.showUnreadMsgs = false;
                socket.emit("msgsRecievedWhileNotTaklingWithUser" , data)
            }else{
                let friend = [...friendPrevListRef.current].find(slot => slot.name == data.name && slot.code == data.code)
                const index = [...friendPrevListRef.current].indexOf(friend)
                if(index < 0) return
                friend.unReadMsg = data.unSeenMsgsCount
                SetFriendList(oldArray => {
                  return [
                    ...oldArray.slice(0, index),
                    friend,
                    ...oldArray.slice(index + 1),
                  ]
                })
            }
        })
        socket.on('removeMsgsRecievedAlert', (data) => {
            if (!data || !data.name || !data.code) return;
            let friend = [...friendPrevListRef.current].find(slot => slot.name == data.name && slot.code == data.code)
            const index = [...friendPrevListRef.current].indexOf(friend)
            if(index < 0) return
            friend.unReadMsg = 0
            SetFriendList(oldArray => {
              return [
                ...oldArray.slice(0, index),
                friend,
                ...oldArray.slice(index + 1),
              ]
            })
        })
        // socket.on('getFriendRequest', function(data) {
        //     if (data == null) return;
        //     if (data.friendRequests != null) {
        //       let friendRequests = JSON.parse(data.friendRequests);
        //       let form = '';
        //       for (let x in friendRequests)
        //         form += friendRequest(friendRequests[x].name, friendRequests[x].code)
        //       $("#NotificationTab #RelationRequestList").empty().append(form)
        //     }
        //   })
        // socket.on('friendIsOnline', function(data) {
        //     let friendname = "FriendName_" + data.name + '-' + data.code;
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
        //     if (data.code == null || data.code == null) return;
        //     let form = friendRequest(data.name, data.code);
        //     $("#NotificationTab #RelationRequestList").prepend(form);
        //     $("#Notification").addClass
        //   })
        // socket.on('TellFriendDisconnected', function(data) {
        //     $("#FriendName_" + data.name).find(".friendStatus").removeClass("userStatusOnline");
        //     if (data.clientDevice == 1)
        //       $("#FriendName_" + data.name).find(".currentPlatform").removeClass("GamePlatform")
        //     else if (data.clientDevice == 2)
        //       $("#FriendName_" + data.name).find(".currentPlatform").removeClass("ClientPlatform")
        //     else if (data.clientDevice == 3)
        //       $("#FriendName_" + data.name).find(".currentPlatform").removeClass("WebPlatform")
        //     else if (data.clientDevice == 4)
        //       $("#FriendName_" + data.name).find(".currentPlatform").removeClass("MobilePlatform")
        //     else
        //       $("#FriendName_" + data.name).children(".currentPlatform").removeClass("WebPlatform").removeClass("MobilePlatform").removeClass("ClientPlatform").removeClass("GamePlatform")
        
        //     $("#FriendName_" + data.name).appendTo("#OfflineUsersList");
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
        <div  className={`borderColor ${styles.FriendsList}`}>

                
            { receivingCall || callAccepted || calling || callerInfo ?
                <div  ref={maximizeScreenRef} className={`${styles.callOverlay} ${receivingCall ? styles.recievingPositon : ''} ${callInChat ? styles.callInChat : ''}`}>
                    <div className={`${styles.callContainer} ${callInChat ? styles.callContainerInChat : ''}`}>
                        {
                            callInChat && inCallUserList.length != 0 ? <div className={`${styles.callUserTitle}`}>
                                <p>{callerInfo.name}</p>
                                <span className='code'>#
                                {callerInfo.code && callerInfo.code.toString().length == 1 ? "000" : ""}
                                {callerInfo.code && callerInfo.code.toString().length == 2 ? "00" : ""}
                                {callerInfo.code && callerInfo.code.toString().length == 3 ? "0" : ""}
                                {callerInfo.code}
                                </span>
                            </div>: null
                        }
                        <div className={`${styles.callUserProfile}`}>
                                {
                                    inCallUserList && inCallUserList.length != 0 ? <>
                                        <div className={`${styles.inCallImages} ${biggerView !== null ? styles.keepOnlyBiggerView : ''}`}>
                                                <div className={`${styles.HoldImagesRight} ${smallerView ? styles.smallerView : ''}`}>
                                                {
                                                    inCallUserList ? inCallUserList.map((callUser , index) =>{
                                                        let isAudio = false;
                                                        let isVideo = false;
                                                        if(!callUser.calling){
                                                            if(callUser.stream.getAudioTracks().length)// checking audio presence
                                                                isAudio=true;
                                                            if(callUser.stream.getVideoTracks().length)// checking video presence
                                                                isVideo=true;
                                                        }
                                                        return <div key={index} className={`secondLayer ${styles.callerHolder} ${biggerView != null && biggerView === index ? styles.biggerView : ''}`} style={{borderColor : `rgba(0,150,0, ${callUser.volume ? callUser.volume : 0})`, 
                                                        backgroundImage: callUser.wall ? `url(${"/MediaFiles/WallpaperPic/" + callUser.token + "/" + callUser.wall })` : 'none' }}  onClick={()=>{ 
                                                            if(!callInChat) return;
                                                            if(biggerView != null && biggerView === index){
                                                                SetBiggerView(null);
                                                                SetSmallerView(false);
                                                            }else{
                                                                SetBiggerView(index);
                                                                SetSmallerView(true);
                                                            }
                                                         }}>
                                                            {
                                                                biggerView != null && biggerView === index &&  isVideo ? <video ref={video => {if(video){ video.srcObject = callUser.stream; }}} muted={callUser.muted} autoPlay></video> : isVideo ? <span>{`Watch stream`}</span> : null
                                                            }
                                                            {
                                                                isAudio ? <audio ref={audio => {if(audio){ audio.srcObject = callUser.stream; }}} muted={callUser.muted} autoPlay></audio> : null
                                                            }
                                                            {
                                                                !isVideo ? <img className='unInteractiveLayer' src={`/MediaFiles/ProfilePic/${callUser.token}/${callUser.prof}`} /> : null
                                                            }
                                                        </div>
                                                    }) : null
                                                }
                                                <div className={`${styles.toggleCallersDisplay}`}>
                                                    <div className={`secondLayer bi ${smallerView ? 'bi-chevron-left' : 'bi-chevron-right'}`} onClick={()=>{ SetSmallerView(!smallerView) }} />
                                                    <div className={`secondLayer bi bi-grid`} onClick={()=>{ SetSmallerView(false); SetBiggerView(null) }} />
                                                </div>
                                                </div>
                                        </div>
                                    </>
                                    : null
                                }
                                {
                                    callerInfo && receivingCall ?  <>
                                    <div className={`secondLayer ${styles.callerImage}`} style={{ backgroundImage: callerInfo.prof ? `url(${"/MediaFiles/ProfilePic/" + callerInfo.token + "/" + callerInfo.prof })` : 'none'}} />

                                    <div>
                                        <p>{callerInfo.name}</p>
                                        <span className='code'>#
                                        {callerInfo.code && callerInfo.code.toString().length == 1 ? "000" : ""}
                                        {callerInfo.code && callerInfo.code.toString().length == 2 ? "00" : ""}
                                        {callerInfo.code && callerInfo.code.toString().length == 3 ? "0" : ""}
                                        {callerInfo.code}
                                        </span>
                                    </div>
                                    <div className={`${styles.callStatus}`}>
                                        {callStatus}
                                    </div>
                                    </> : null
                                }
                            </div>
                            <div className={`${styles.callHandle}`}>
                                {callAccepted ?  <div className={` ${!inviteToCall ? 'secondLayer bi bi-plus-lg' : 'pickedInput bi bi-x-lg' }`} onClick={()=>{ SetInviteToCall(!inviteToCall) }} />  : null}
                                {callAccepted ?  <div className={`secondLayer bi ${currentScreenShareStream ? 'pickedInput bi-x-square' : ' bi-tv'}`} onClick={()=>{ currentScreenShareStream  ? stopScreenShare() : startScreenCapture() }} />  : null}
                                {/* {callAccepted && !callInChat ? <div className='secondLayer bi bi-arrows-angle-expand' onClick={()=>{ 
                                    socket.emit('OpenWindow',{
                                        window : "Chat",
                                        name : callerInfo.name,
                                        code: callerInfo.code
                                    }); 
                                }} /> : null} */}
                                { receivingCall || callAccepted || calling ? <div className={`secondLayer bi bi-telephone pickedInput`} onClick={()=>{ leaveCall() }} /> : null }
                                { receivingCall && !callAccepted ? <div className={`secondLayer bi bi-telephone ${styles.callerAccept}`} onClick={()=>{ answerCall() }} /> : null}
                                {callAccepted ?  <div className={`secondLayer bi bi-fullscreen`} onClick={()=>{ 
                                    if(screen.availWidth === window.innerWidth){
                                        closeFullscreen(document);
                                    }else{
                                        openFullscreen(maximizeScreenRef.current)
                                    }
                                 }} />  : null}
                            </div>
                    </div>
                </div> : null
                }
                
                <div>
                    
                    
                    <audio loop muted ref={ringtone} autoPlay >
                        <source src="Audio/ringtone.mp3" type="audio/mpeg" />
                    </audio>
                </div>
            
                <>
                <div className={`${styles.friendListTitle} ${ !callInChat && inCallUserList.length != 0 ? styles.callAboveTitle : ''}`}>Friends</div>
                <div ref={friendsListSlots}>
                {
                    friendList && friendList.length > 0 ? friendList.map((friend,index) => {
                        return <FriendSlot key={index} socket={socket} name={friend.name} code={friend.code} unReadMsg={friend.unReadMsg} userClientAvability={friend.userClientAvability} userWebAvability={friend.userWebAvability} userMobileAvability={friend.userMobileAvability} userGameAvability={friend.userGameAvability} prof={friend.prof} wall={friend.wall} token={friend.token} SetPreview={SetPreview} inviteToCall={inviteToCall} callUser={callUser}/>
                    }) : 'No friends yet'
                }
                </div>
                <div className={`${styles.friendListTitle}`}>Groups</div>
                <div>
                {
                    lobbyList && lobbyList.length > 0 ? lobbyList.map((group,index) => {
                        return <GroupSlot key={index} socket={socket} name={group.name} />
                    }) : 'No groups yet'
                }
                </div>
                </> 
                {
                    preview ? 
                    <div id="preview" ref={previewRef} className={`unInteractiveLayer ${styles.previewContainer}`} style={{top : preview.top}}>
                        <div className={`${styles.previewProfile}`}>
                            <div className='unInteractiveLayer'>
                                <img src={`/MediaFiles/WallpaperPic/${preview.token}/${preview.wall}`} />
                            </div>
                            <img className={`${styles.previewProfileImg}`} src={`/MediaFiles/ProfilePic/${preview.token}/${preview.prof}`} />
                        </div>
                        <div className={`${styles.previewInteract}`}>
                            <div className="secondLayer" onClick={()=>{ 
                                callUser({name : preview.name, code : preview.code , prof : preview.prof , wall : preview.wall , token : preview.token} , null);
                                SetPreview(null); 
                            }}>
                                <span className="bi bi-telephone-fill" />Call
                            </div>
                            <div className="secondLayer" onClick={()=>{  
                                socket.emit('OpenWindow', { window : "Chat" ,name : preview.name , code : preview.code });
                                SetPreview(null); 
                            }}>
                                <span className="bi bi-chat-left-fill" />Message
                            </div>
                        </div>
                    </div> : null
                }
        </div>
    )
}

