import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/RightPanel/FriendsList.module.css'
import { FriendSlot } from './FriendSlot';
import { GroupSlot } from './GroupSlot';
import { CallSlot } from './callSlot';
import Peer from 'simple-peer'
import { nanoid } from 'nanoid'

export default function FriendsList(){

    const { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)
  
    const [friendList,SetFriendList] = useState(null)
    let friendPrevListRef = useRef(null);
    interface inCallUser{
        id : string;
        muted : boolean ;
        stream  : any ;
        calling : boolean;
        name: string;
        code:number;
        prof : string;
        wall : string ;
        token : string;
    }
    interface callerInfo {
        name : string,
        code : number,
        token : string,
        prof ?: string,
        wall ?: string,
        doNotCall ?: boolean,
        private ?: boolean
        group ?: string
    }
    interface callerSignalInfo extends callerInfo{
        socketID : string
        signal : any,
        connectionID : string,
        silentCall : boolean,
        newMember : boolean,
        reJoin ?: boolean
    }
    interface messageInfo extends callerInfo{
        top : string,
        group ?: string
    }
    interface callTitle{
        name : string;
        code : number;
        group ?: string;
    }
    const [currentScreenShareStream , SetCurrentScreenShareStream] = useState(null);

	// const [ stream, setStream ] : any = useState()
	const [ callInChat, SetCallInChat ] = useState(false)
    
    // call state
	const [ calling, setCalling ] = useState(false)
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ inCall, setInCall ] = useState(false)


    const [callerSignalInfo , SetCallerSignalInfo] = useState<callerSignalInfo>(null)

    const [preview , SetPreview] = useState<messageInfo>(null)
    const previewRef = useRef(null)
    const friendsListSlots = useRef(null)
    const groupsListSlots = useRef(null)

    const maximizeScreenRef = useRef(null)

    const [biggerView , SetBiggerView] = useState(null);
    const [smallerView , SetSmallerView] = useState(false);

	const ringtone = useRef(null)
	const waitingTone = useRef(null)
	const connectionRef = useRef([])

    const [inviteToCall , SetInviteToCall] = useState(false)

    const [lobbyList , SetLobbyList] = useState([])

    const [callTitle , SetCallTitle] = useState<callTitle>()

    const [inCallUserList , SetInCallUserList] = useState<inCallUser[]>([])
    let inCallUserListRef = useRef(inCallUserList);

    const currentUser = useRef(user);
    useEffect(()=>{
        currentUser.current =  user;
    } , [user])
    function fullscreen(element) {
        if (
            document.fullscreenElement
          ) {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          } else {
            if (element.requestFullscreen) {
              element.requestFullscreen();
            }
          }
      }

    const callUser = async (userInfoList : callerInfo[], isGroupCall : boolean , silentCall : boolean, newMember : boolean ) => {
        if(!userInfoList || userInfoList.length == 0) return;

        const localStream = await fetchMediaStream();
        if(!localStream)return;

        if(inCallUserListRef.current.length == 0){
            SetInCallUserList(oldArr => { 
                let temp : inCallUser = {id:null,muted : true , stream  : localStream , calling : false, name: currentUser.current.name,code: currentUser.current.code, prof : currentUser.current.prof, wall : currentUser.current.wall , token : currentUser.current.token};
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr ] 
            });
        }

        if(!silentCall && !newMember){
            setCalling(true);
            manageWaitingTone(false);
        }

        userInfoList.forEach((userInfo : callerInfo)=>{
            if(userInfo.doNotCall) return;
            if(!isGroupCall){
                SetCallTitle({name : userInfo.name, code : userInfo.code , group : null})
            }
            const connectionID = nanoid();
            SetInCallUserList(oldArr => { 
                let temp = {id :connectionID, muted : false , stream  : null , calling : !silentCall || !newMember, name: userInfo.name,code: userInfo.code, prof : userInfo.prof, wall : userInfo.wall , token : userInfo.token};
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr ];
            });
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: localStream
            })
    
            peer.on("signal", (signal) => {
                socket.emit("callUser", {
                    signal,
                    name : userInfo.name,
                    code : userInfo.code,
                    connectionID,
                    silentCall,
                    newMember,
                    private : userInfo.private
                })
            })
            peer.on('connect', () => { })
            peer.on('track', (track, stream) => {
                manageTrack(track, stream);
            })
            peer.on("stream", (stream) => {
                if(stream.getAudioTracks().length){
                    let value = [...inCallUserListRef.current].find(call => call.id ==  connectionID)
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
                        let temp : inCallUser = {id: null,muted : false , stream , prof : userInfo.prof, wall : userInfo.wall , token : userInfo.token , calling :false , name : userInfo.name , code : userInfo.code };
                        inCallUserListRef.current = [temp , ...oldArr ];
                        return [temp , ...oldArr ] 
                    });
                }
            })
            peer.on('close', () => { })
            peer.on('error', (err) => {
                console.error(err) 
            })
            connectionRef.current = [...connectionRef.current , { peer , connectionID }];
        })
	}

    const answerCall = async (info  : callerSignalInfo) =>  {

        const localStream = await fetchMediaStream();
        if(!localStream)return;

        if(inCallUserListRef.current.length == 0){
            SetInCallUserList(oldArr => { 
                let temp = {id: info.connectionID, muted : true , stream  : localStream , calling : false, name: user.name,code: user.code, prof : user.prof, wall : user.wall , token : user.token};
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr ] 
            });
        }else if(info.reJoin){
            let value = [...inCallUserListRef.current].find(call => call.name == user.name && call.code == user.code)
            const index = [...inCallUserListRef.current].indexOf(value)
            if(index < 0) return;
            SetInCallUserList(oldArr => { 
                let temp = [...oldArr];
                temp[index].id = info.connectionID;
                inCallUserListRef.current = [...temp];
                return [...temp]
            });
        }
            if(!info.silentCall){
                setInCall(true)
                setReceivingCall(false);
                manageCallRingtone(true);
            }
            
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: localStream
            })
            
            peer.on("signal", (signal) => {
                socket.emit("answerCall", { 
                    signal,
                    socketID : info.socketID,
                    connectionID : info.connectionID,
                    silentCall: info.silentCall,
                    newMember : info.newMember
                })
            })
            peer.on('connect', () => { })
            peer.on('track', (track, stream) => {
                manageTrack(track, stream);
            })
            peer.on("stream", (stream) => {
                SetInCallUserList(oldArr => { 
                    let temp : inCallUser = {id: null, muted : false, stream, name: info.name,code: info.code, prof : info.prof , wall : info.wall , token : info.token , calling : false }
                    inCallUserListRef.current = [temp , ...oldArr ];
                    return [temp , ...oldArr]
                 });
            })
            peer.on('close', () => { })
            peer.on('error', (err) => {
                console.error(err)      
            })
            peer.signal(info.signal)
            connectionRef.current = [...connectionRef.current , { peer , connectionID : info.connectionID}];
	}
  
    function restoreCallToDefault(){
        setCalling(false);
        setReceivingCall(false);
        setInCall(false);
        SetCallerSignalInfo(null);
        inCallUserListRef.current = [];
        SetInCallUserList([]);
        SetCallInChat(false)

        SetCurrentScreenShareStream(null)

        if(waitingTone.current){
            manageWaitingTone(true)
        }
        if(ringtone.current){
            manageCallRingtone(true);
        }
    }
    const manageCallRingtone = (muted) => {
        ringtone.current.muted = muted;
        muted ?  ringtone.current.pause() : ringtone.current.play().catch(function() { });
        ringtone.current.currentTime = 0;
    }
    const manageWaitingTone = (muted) => {
        waitingTone.current.muted = muted;
        waitingTone.current.volume = 0.1;
        muted ?  waitingTone.current.pause() : waitingTone.current.play().catch(function() { });
        waitingTone.current.currentTime = 0;
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

        if(value.stream) value.stream.getTracks().forEach(track => track.stop());

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
            let supports = navigator.mediaDevices.getSupportedConstraints();
            if (!supports["width"] || !supports["height"] || !supports["frameRate"]) {
                // We're missing needed properties, so handle that error.
            } else {
            let constraints = {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 400, ideal: 1080 },
                aspectRatio: 1.777777778,
                frameRate: { max: 30 }
            };
            SetInCallUserList(oldArr => {
                let temp : inCallUser = {id : null , name : null,calling : false,code: null,prof : null, wall:null, token:null , muted : false , stream}; 
                inCallUserListRef.current = [temp , ...oldArr ];
                return [temp , ...oldArr]
            });
            for (const track of stream.getTracks()) {
                track.applyConstraints(constraints).then(() => {
                    /* do stuff if constraints applied successfully */          
                    connectionRef.current.forEach(conn => {
                        conn.peer.addTrack(track, stream);
                    });
                    manageTrack(track,stream)
                }).catch(function(reason) {
                    /* failed to apply constraints; reason is why */
                    console.error(reason)
                });
            }
            SetCurrentScreenShareStream(stream);
            }
        } catch(err) {
          console.error("Error: " + err);
        }
    }
    // function volumeActivity(id , stream){
    //     // detect voice activity
    //     const audioContext = new AudioContext();
    //     const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    //     const analyserNode = audioContext.createAnalyser();
    //     mediaStreamAudioSourceNode.connect(analyserNode);
    //     const pcmData = new Float32Array(analyserNode.fftSize);
        
    //     let interval = setInterval(()=>{
    //         analyserNode.getFloatTimeDomainData(pcmData);
    //         let sumSquares = 0.0;
    //         for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
    //         let volume = Math.sqrt(sumSquares / pcmData.length) * 30;
    //         volume = volume > 1 ? 1 : volume;
    //         volume = parseFloat(volume.toFixed(2));
    //         SetInCallUserList(oldArray => {
    //             let temp = [...oldArray];
    //             temp.forEach(element => {
    //                 if(element.id == id) element.volume = volume;
    //             });
    //             inCallUserListRef.current = temp;
    //             return temp;
    //         })
    //         socket.emit('updateVoiceActivity' ,{id , volume})
    //     }, 500);

    // }
    async function fetchMediaStream(){
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        //EXPERIMENTAL buggy and takes performance
        // volumeActivity(id , stream);
        return stream;
    }
    useEffect(()=>{
        document.addEventListener('click', function(event) {
            if(!previewRef.current) return;
            var isClickInsideElement = previewRef.current.contains((event as any).target);
            var isClickInsideElement2 = friendsListSlots.current.contains((event as any).target);
            var isClickInsideElement3 = groupsListSlots.current.contains((event as any).target);
            if (!isClickInsideElement && !isClickInsideElement2 && !isClickInsideElement3) {
                //Do something click is outside specified element
                SetPreview(null)
            }
        });
    },[])
    useEffect(()=>{
        if(socket?.id == undefined) return;
        socket.emit('tellFriendsImOnline');

        socket.on('startGroupCall', (data) => {
            if(data && data.members && data.members.length != 0){
                SetCallTitle({name : null, code : null , group : data.group})
                let members : callerInfo[] = data.members;
                callUser(members,true, data.silent, data.newMember)
            }
        })

        socket.on('SetCallTitle',(data)=>{
            SetCallTitle({name : data.name, code : data.code , group : data.group})
        })
        socket.on('validateCall',(data)=>{
            callUser([{group: data.group , name : data.name, code : data.code , prof : data.prof , wall : data.wall , token : data.token , private : true}] , false , false, false)
        })
        socket.on('updateGroupList',(data)=>{
            if(data.lobbies) SetLobbyList([...data.lobbies])
            if(data.lobby) SetLobbyList(oldArr =>{ return [...oldArr , data.lobby]; })
        })

        socket.on("updateVoiceActivity", (data) => {
            // SetInCallUserList(oldArray => {
            //     oldArray.forEach(element => {
            //         if(element.id == data.id) element.volume = data.volume;
            //     });
            //     inCallUserListRef.current = [...oldArray];
            //     return [...oldArray];
            // })
		})
        socket.on("SetCallFromRightPanel", (data) => {
            SetCallInChat(data.callerChatOpened);
		})
        socket.on("callAccepted", (data : callerSignalInfo) => {
            if(connectionRef.current.length != 0) {          
                let value = [...connectionRef.current].find(content => content.connectionID == data.connectionID)
                const index = [...connectionRef.current].indexOf(value)

                if(index < 0) return;
                connectionRef.current[index].peer.signal(data.signal)
                // SetCallerInfo(data); //make it stop ringing in the ui
                if(!data.silentCall || !data.newMember){
                    setCalling(false)
                    setInCall(true)
                    manageWaitingTone(true);
                }
            }
		})
        socket.on('hangupCall',(data)=>{
            if(data){
                let value = [...inCallUserListRef.current].find(call => call.name == data.name && call.code == data.code)
                const index = [...inCallUserListRef.current].indexOf(value)
                if(index < 0) return;
                if(value.stream) value.stream.getTracks().forEach(track => track.stop());
                SetBiggerView(null);
                SetInCallUserList(oldArray => {
                    let newArr = [
                        ...oldArray.slice(0, index),
                        ...oldArray.slice(index + 1),
                    ];
                    inCallUserListRef.current = newArr
                    return newArr;
                })
            }else{
                connectionRef.current.forEach(conn => {
                    conn.peer.destroy();
                });
                connectionRef.current = [];
                restoreCallToDefault();
            }
        })
        socket.on('callRinging',()=>{

        })
		socket.on("callUser", (data : callerSignalInfo) => {
            if(data.silentCall){
                answerCall(data)
            }else if(data.newMember || (!data.silentCall && connectionRef.current.length == 0)){
                socket.emit("callRinging")
                setReceivingCall(true);
                manageCallRingtone(false)
                SetCallerSignalInfo(data)
            }else if(connectionRef.current.length != 0){
                if(data.reJoin){
                    answerCall(data)
                }else{
                    let content = [...connectionRef.current].find(content => content.connectionID == data.connectionID)
                    const index = [...connectionRef.current].indexOf(content)
                    if(index < 0) return;
                    connectionRef.current[index].peer.signal(data.signal)
                }
            }
		})


        socket.on('updateFriendList', (data) => {
            if (data == null) return;
            let friendList = JSON.parse(data.friendListJson)
            friendPrevListRef.current = friendList
            SetFriendList(friendList)
            //console.log(friendList)
        })
        socket.on('msgsRecievedWhileNotTalkingWithUser', (data) => {
            if (!data || !data.message || !data.textID || !data.name || !data.code || !data.unSeenMsgsCount) return;
            if(!data.showUnreadMsgs){
                data.showUnreadMsgs = false;
                socket.emit("msgsRecievedWhileNotTalkingWithUser" , data)
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
    },[socket?.id])

    return (
        <div  className={`borderColor ${styles.FriendsList}`}>

                
            { (receivingCall || inCall || calling) &&
                <div  ref={maximizeScreenRef} className={`${styles.callOverlay} ${callInChat ? styles.callInChat : ''}`}>
                    <div className={`${styles.callContainer} ${callInChat ? styles.callContainerInChat : ''}`}>
                        {
                            callTitle && <div className={`${styles.callUserTitle}`}>
                                <div className='unInteractiveLayer'>
                                    {   callTitle.group ? <p>{callTitle.group}</p> :
                                        <>
                                            <p>{callTitle.name}</p>
                                            <span className='hyphen'>#
                                            {callTitle.code && callTitle.code.toString().length == 1 ? "000" : ""}
                                            {callTitle.code && callTitle.code.toString().length == 2 ? "00" : ""}
                                            {callTitle.code && callTitle.code.toString().length == 3 ? "0" : ""}
                                            {callTitle.code}
                                            </span>
                                        </>
                                    }
                                </div>
                            </div>
                        }
                        <div className={`${styles.callUserProfile}`}>
                                {
                                    inCallUserList && inCallUserList.length != 0 && <>
                                        <div className={`${styles.inCallImages} ${biggerView !== null ? styles.keepOnlyBiggerView : ''}`}>
                                                <div className={`${styles.HoldImagesRight} ${smallerView ? styles.smallerView : ''}`}>
                                                {
                                                    inCallUserList && inCallUserList.map((callUser , index , array) =>{
                                                        let amount = array.length;
                                                        return <CallSlot key={index} index={index} stream={callUser.stream} calling={callUser.calling} biggerView={biggerView} volume={0} prof={callUser.prof} wall={callUser.wall} token={callUser.token} muted={callUser.muted} callInChat={callInChat} SetBiggerView={SetBiggerView} SetSmallerView={SetSmallerView} amount={amount} />
                                                    })
                                                }
                                                {
                                                    callInChat && <div className={`${styles.toggleCallersDisplay}`}>
                                                        <div className={`secondLayer bi ${smallerView ? 'bi-chevron-left' : 'bi-chevron-right'}`} onClick={()=>{ SetSmallerView(!smallerView) }} />
                                                        <div className={`secondLayer bi bi-grid`} onClick={()=>{ SetSmallerView(false); SetBiggerView(null) }} />
                                                    </div>
                                                }
                                                </div>
                                        </div>
                                    </>
                                }
                                {
                                    callerSignalInfo && receivingCall && <CallSlot index={null} stream={null} calling={null} biggerView={biggerView} volume={0} prof={callerSignalInfo.prof} wall={callerSignalInfo.wall} token={callerSignalInfo.token} muted={true} callInChat={callInChat} SetBiggerView={SetBiggerView} SetSmallerView={SetSmallerView} amount={1} />
                                }
                            </div>
                            {/* <div className={`${styles.callStatus}`}>
                                {receivingCall ? 'Calling...' : calling ? 'Calling' : inCall && 'In-Call' }
                            </div> */}
                            <div className={`${styles.callHandle}`}>
                                {inCall && <div className={` ${!inviteToCall ? 'secondLayer bi bi-person-plus' : 'pickedInput bi bi-x-lg' }`} onClick={()=>{ SetInviteToCall(!inviteToCall) }} /> }
                                {inCall && <div className={`secondLayer bi ${currentScreenShareStream ? 'pickedInput bi-x-square' : ' bi-tv'}`} onClick={()=>{ currentScreenShareStream  ? stopScreenShare() : startScreenCapture() }} />}
                                {!callInChat && <div className='secondLayer bi bi-box-arrow-left' onClick={()=>{ 
                                    socket.emit('OpenWindow', { 
                                        window : "Chat" ,
                                        load : {
                                            name : callTitle.name,
                                            code : callTitle.code,
                                            group : callTitle.group
                                        }
                                    }); 
                                }} />}
                                <div className={`secondLayer bi bi-telephone pickedInput`} onClick={()=>{ socket.emit('hangupCall') }} />
                                { receivingCall && !inCall && <div className={`secondLayer bi bi-telephone ${styles.callerAccept}`} onClick={()=>{ answerCall(callerSignalInfo) }} />}
                                {inCall && callInChat && <div className={`secondLayer bi bi-fullscreen`} onClick={()=>{ 
                                    fullscreen(maximizeScreenRef.current);
                                 }} /> }
                            </div>
                    </div>
                </div>
                }
                
                <div>
                    
                    
                    <audio loop muted ref={ringtone} autoPlay >
                        <source src="Audio/ringtone.mp3" type="audio/mpeg" />
                    </audio>
                    <audio muted ref={waitingTone} autoPlay >
                        <source src="Audio/waitingTone.wav"/>
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
                <div ref={groupsListSlots}>
                {
                    lobbyList && lobbyList.length > 0 ? lobbyList.map((name,index) => {
                        return <GroupSlot key={index} socket={socket} name={name}  SetPreview={SetPreview}/>
                    }) : 'No groups yet'
                }
                </div>
                </> 
                {
                    preview ? 
                    <div id="preview" ref={previewRef} className={`unInteractiveLayer ${styles.previewContainer}`} style={{top : preview.top}}>
                        {
                            preview.token && <div className={`${styles.previewProfile}`}>
                                {
                                    preview.wall && <div className='unInteractiveLayer'>
                                        <img src={`/MediaFiles/WallpaperPic/${preview.token}/${preview.wall}`} />
                                    </div>
                                }
                                {
                                    preview.prof && <img className={`${styles.previewProfileImg}`} src={`/MediaFiles/ProfilePic/${preview.token}/${preview.prof}`} />
                                }
                            </div>
                        }
                        <div className={`${styles.previewInteract}`}>
                            <div className="secondLayer" onClick={()=>{ 
                                const temp = {group: preview.group , name : preview.name, code : preview.code , prof : preview.prof , wall : preview.wall , token : preview.token , private : true}
                                SetPreview(null); 
                                socket.emit("validateCall", { name : temp.name, code : temp.code , group : temp.group ,token : preview.token, prof : preview.prof , wall : preview.wall})
                            }}>
                                <span className="bi bi-telephone-fill" />Call
                            </div>
                            <div className="secondLayer" onClick={()=>{  
                                socket.emit('OpenWindow', { 
                                    window : "Chat" ,
                                    load : {
                                        name : preview.name,
                                        code : preview.code,
                                        group : preview.group
                                    }
                                });
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

