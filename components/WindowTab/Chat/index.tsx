import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styles from '../../../styles/WindowTab/Chat.module.css'
import { ShowError } from '../../fields/error'
import { checkAcceptedExtensions } from '../Post/PostData'
import MessageForm from './Message'
export default function ChatTab({WindowLoad}){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    let messageText = useRef(null)
    let [chatList , SetChatList] = useState([])
    let chatPrevListRef = useRef(chatList)
    let messagesEndRef = useRef(null)
    let mediaHolderRef = useRef(null)
    let [writtenMessagesCounter , SetWrittenMessagesCounter] = useState(0)
    let [mediaMessagesCounter , SetMediaMessagesCounter] = useState(0)
    let lastMsgFromUserNameRef = useRef(null)
    let lastMsgFromUserCodeRef = useRef(null)
    let [lastMsgFromUserName , SetLastMsgFromUserName] = useState(null)
    let [lastMsgFromUserCode , SetLastMsgFromUserCode] = useState(null)
    let mediaFileRef = useRef(null);
    let [mediaUploaded , SetMediaUploaded] = useState([])
    let mediaUploadedRef = useRef(mediaUploaded)

    let [fetchMoreMsgs , SetFetchMoreMsgs]  = useState(false);
    let [chatCurrentPage , SetChatPage]  = useState(1);

    const scrollToBottom = () => {
        setTimeout(()=>{ messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) },50)
    }

    useEffect(()=>{
        if(!socket) return;

        socket.emit('showChatHistory',{
            page : chatCurrentPage
        })
        socket.on('showChatHistory', function(data) {
            let chatlogHistory = JSON.parse(data.chatLog);
            if (chatlogHistory == null) return;
            chatlogHistory.reverse();
            let username = null;
            let userCode = null;
            chatlogHistory.forEach((msg) => {
                msg.showUser = true
                if(username === msg.User_Name && userCode === msg.User_Code) 
                msg.showUser = false
                else{
                    username = msg.User_Name
                    userCode = msg.User_Code
                }
            });
            chatlogHistory.reverse();
            chatlogHistory.forEach((msg , index) => {
                if(data.unSeenMsgsCount != null && data.unSeenMsgsCount > -1 && data.unSeenMsgsCount  === index)
                    msg.newMessages = data.unSeenMsgsCount;
            });
            SetChatPage(data.page);

            chatPrevListRef.current = chatPrevListRef.current ? [...chatPrevListRef.current].concat(chatlogHistory) : chatlogHistory
            SetChatList(chatPrevListRef.current)
            SetFetchMoreMsgs(true);
        })
        socket.on('sendMessage', function(data) {
            if (data.myself) {
                if(isNaN(data.textID) || isNaN(data.oldID)) return;
                let old_ID = data.isMedia ? "oldMedia_"+ data.oldID : "oldText_"+ data.oldID
                let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == old_ID)
                const index = [...chatPrevListRef.current].indexOf(message)
                if(!message)return;
                message.Text_ID = parseInt(data.textID);
                message.Text_Status = "sent"
                if(data.isMedia){
                    message.Text_MediaFolder = data.folderName;
                    message.Text_MediaFiles = data.tempFiles;
                    message.Text_TempMedia = null;
                }
                SetChatList(oldArray => {
                    let newArr = [
                        ...oldArray.slice(0, index),
                        message,
                        ...oldArray.slice(index + 1),
                    ];
                    chatPrevListRef.current = newArr
                    return newArr;
                })
            } else {

                if(!data.message && !data.folderName && !data.tempFiles) return;
                if(isNaN(data.textID) || !data.username || !data.userCode || !data.unSeenMsgsCount) return;
                if(data.username !== WindowLoad.username && data.userCode !== WindowLoad.userCode) return;
                let showUser = true;
                if(data.username === lastMsgFromUserNameRef.current && data.userCode=== lastMsgFromUserCodeRef.current)
                    showUser = false; 
                else{
                    lastMsgFromUserNameRef.current = (data.username);
                    lastMsgFromUserCodeRef.current = (data.userCode);
                }
                SetLastMsgFromUserName(null);
                SetLastMsgFromUserCode(null);
                CreateMessageHolder(parseInt(data.textID),data.message, null  , data.folderName , data.tempFiles ,data.username,data.userCode , showUser)
                socket.emit('msgsSeen')
            }
          })
          socket.on('msgsRecieved', function(data) {
            if(!data.username && !data.userCode && !chatPrevListRef.current) return;
            let arrlist = [...chatPrevListRef.current];
            arrlist.forEach(element => {
                element.Text_Status = 'recieved'
            });
            chatPrevListRef.current = arrlist;
            SetChatList(arrlist)
        })
        socket.on('msgsSeen', function(data) {
            if(!data.username && !data.userCode && !chatPrevListRef.current) return;
            
            let arrlist = [...chatPrevListRef.current];
            arrlist.forEach(element => {
                element.Text_View = 'seen'
            });
            chatPrevListRef.current = arrlist;
            SetChatList(arrlist)
          });
        socket.on('deleteMsg', function(data) {
            let message = [...chatPrevListRef.current].find(msg => msg.Text_ID == data.textID)
            const index = [...chatPrevListRef.current].indexOf(message)
            if(!message)return;
            SetChatList(oldArray => {
                let newArr = [
                    ...oldArray.slice(0, index),
                    ...oldArray.slice(index + 1),
                ];
                chatPrevListRef.current = newArr
                return newArr;
            })
          });
          socket.on('editMsg', function(data) {
            let message = [...chatPrevListRef.current].find(msg => msg.Text_ID == data.textID)
            const index = [...chatPrevListRef.current].indexOf(message)
            if(!message)return;
            message.Text_Message =data.message
            message.Text_Edit ='edited'
            SetChatList(oldArray => {
                let newArr = [
                    ...oldArray.slice(0, index),
                    message,
                    ...oldArray.slice(index + 1),
                ];
                chatPrevListRef.current = newArr
                return newArr;
            })
          })
    },[socket])
    function CreateMessageHolder(id,text , Text_TempMedia , Text_MediaFolder ,Text_MediaFiles ,username,userCode , showUser){

        let newArr = {Old_ID: id, Text_ID: null, User_Name:username, User_Code : userCode,Text_Message:text,Text_Date:new Date(),Text_Edit:'original', Text_Status:"waiting",Text_View : "unSeen" , showUser , Text_TempMedia  , Text_MediaFiles , Text_MediaFolder }

        chatPrevListRef.current = chatPrevListRef.current ? [newArr].concat([...chatPrevListRef.current]) : [newArr];
        SetChatList(chatPrevListRef.current)
        
        scrollToBottom()
        SetMediaMessagesCounter(mediaMessagesCounter + 1)
        SetWrittenMessagesCounter(writtenMessagesCounter + 1)

        if(Text_TempMedia) {
            let sendMedia = []
            Text_TempMedia.forEach(async (files , index) => {
               let tempIndex = 0;
               const mediaMessageResult = await uploadMediaWithMessage(Text_MediaFolder , files.file , index , Text_TempMedia);

               if(!mediaMessageResult) {
                let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == "oldMedia_"+ mediaMessagesCounter)
                const messageIndex = [...chatPrevListRef.current].indexOf(message)
                if(!message) return;
                    tempIndex = Text_TempMedia.indexOf(message.Text_TempMedia[index])
                if(tempIndex == -1) return;
                    message.Text_TempMedia[tempIndex].retry = true;
                SetChatList(oldArray => {
                    let newArr = [
                        ...oldArray.slice(0, messageIndex),
                        message,
                        ...oldArray.slice(messageIndex + 1),
                    ];
                    chatPrevListRef.current = newArr
                    return newArr;
                })
               }else{
                   let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == "oldMedia_"+ mediaMessagesCounter)
                   const messageIndex = [...chatPrevListRef.current].indexOf(message)
                   if(!message) return;
                       tempIndex = Text_TempMedia.indexOf(message.Text_TempMedia[index])
                   if(tempIndex == -1) return;
                       message.Text_TempMedia[tempIndex].finished = true;
                    SetChatList(oldArray => {
                        let newArr = [
                            ...oldArray.slice(0, messageIndex),
                            message,
                            ...oldArray.slice(messageIndex + 1),
                        ];
                        chatPrevListRef.current = newArr
                        return newArr;
                    })
               }
               sendMedia.push(mediaMessageResult);
               if(sendMedia.length == Text_TempMedia.length){
                   socket.emit('sendMessage', {id : mediaMessagesCounter , folderName : Text_MediaFolder})
               }
            });
        }
    }
    const handleInput = (e)=>{
        if(messageText.current.scrollHeight > 250) return;
        messageText.current.style.height = '';
        messageText.current.style.height =messageText.current.scrollHeight +'px';
    }
    const handleKeyDown = async (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            
            let showUser = true;
            let mediaAndText = false;

            if(user.name === lastMsgFromUserName && user.code=== lastMsgFromUserCode)
                showUser = false; 
            else{
                SetLastMsgFromUserName(user.name);
                SetLastMsgFromUserCode(user.code);
            }
            lastMsgFromUserNameRef.current = null;
            lastMsgFromUserCodeRef.current = null;
            if(messageText.current.value.trim().length != 0){
                if(mediaAndText) showUser = false
                let message = messageText.current.value.trim()
                CreateMessageHolder("oldText_"+writtenMessagesCounter, message,null, null , null , user.name, user.code , showUser)
                socket.emit('sendMessage', { message, id : writtenMessagesCounter})
                messageText.current.value = '';
                mediaAndText = true;
                messageText.current.style.height ='25px'
            }

            
            if(mediaUploaded && mediaUploaded.length != 0){ 
                let files = [...mediaUploadedRef.current];
                mediaFileRef.current.value = "";
                mediaUploadedRef.current = [];
                SetMediaUploaded([]);
                const folderName = await axios.post('/CreateTempDirectory',{
                    picToken : user.picToken,
                    directoryType : 'ChatFiles'
                  }).then(function (res : any) {
                      if(res && res.data && res.data.ok && res.data.folderName)
                        return res.data.folderName;
                      else
                        return false;
                  }).catch(function (error : any) {
                      if(error) 
                      ShowError("CreateTempDirectory: Encountered error no temp directory created")
                      return false;
                  });
                  if(folderName){
                      CreateMessageHolder("oldMedia_"+mediaMessagesCounter,null , files, folderName , null ,user.name,user.code , showUser)
                  }
            }
        }
      }

      const UploadMediaFile = async e => {
        const files = e.target.files
        for (let index = 0; index < files.length; index++) {
            if(files[index].size >= 10 * 1024 * 1024){
                e.target.value = "";
                ShowError("File size huge exceeds 10 MB");
                return;
              }
              if(!checkAcceptedExtensions(files[index])) {
                e.target.value = "";
                ShowError("File type must be jpeg/jpg/png/mp4/mp3/mov/avi/mkv");
                return;
              }
              let data = {
                  id : index,
                  file : files[index],
                  src : URL.createObjectURL(files[index]) ,
                  name : files[index].name ,
                  size: (files[index].size / 1024).toFixed(2),
                  itsImage : files[index].type.includes("image"),
                  percentage : 0,
                  finished : false,
                  cancel : null,
                  retry : false
                }
                URL.revokeObjectURL(files[index])  
                mediaUploadedRef.current = mediaUploadedRef.current ? [...mediaUploadedRef.current].concat([data]) : [data]
                SetMediaUploaded(mediaUploadedRef.current) 
            }
        messageText.current.focus();
        e.target.value = "";
      }
      async function uploadMediaWithMessage(folderName , file , indexArr , arr ){
        const form = new FormData();
        let tempIndex = 0;
        form.append('files',file)
        let cancelTokenSource = axios.CancelToken.source();

        let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == "oldMedia_"+ mediaMessagesCounter)
        const index = [...chatPrevListRef.current].indexOf(message)
        if(!message) return;
            tempIndex = arr.indexOf(message.Text_TempMedia[indexArr])
        if(tempIndex == -1) return;
            message.Text_TempMedia[tempIndex].cancel = () => { cancelTokenSource.cancel('Upload cancelled')};

        SetChatList(oldArray => {
            let newArr = [
                ...oldArray.slice(0, index),
                message,
                ...oldArray.slice(index + 1),
            ];
            chatPrevListRef.current = newArr
            return newArr;
        })

        try {
          return await axios.request({
              method: "post", 
              url: '/upload?picToken='+user.picToken+"&folderName="+ folderName+'&directoryFolder=ChatFiles', 
              data: form,
              cancelToken: cancelTokenSource.token,
              onUploadProgress: (progress) => {
                let ratio = progress.loaded / progress.total
                let percentage = (ratio * 100).toFixed(2);
                let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == "oldMedia_"+ mediaMessagesCounter)
                const index = [...chatPrevListRef.current].indexOf(message)
                if(!message) return;
                    tempIndex = arr.indexOf(message.Text_TempMedia[indexArr])
                if(tempIndex == -1) return;
                    message.Text_TempMedia[tempIndex].percentage = percentage

                SetChatList(oldArray => {
                    let newArr = [
                        ...oldArray.slice(0, index),
                        message,
                        ...oldArray.slice(index + 1),
                    ];
                    chatPrevListRef.current = newArr
                    return newArr;
                })
              }
            }).then( response => {
              if(response.data.ok){
                return true
              }else{
                ShowError(response.data.error);
              }
                return false;
            }).catch((error) => {
                ShowError(error);
                return false;
            })
           
          } catch (err) {
            ShowError('Error uploading the files')
            return false;
          }
         
      }
      
        const handleScroll = e => {
            const bottom = e.target.scrollHeight + e.target.scrollTop  <= e.target.clientHeight + 250;
            if(bottom && fetchMoreMsgs){
                SetFetchMoreMsgs(false);
                socket.emit('showChatHistory' , {
                    page : chatCurrentPage 
                })
            }
        } 
    return (
        <>
        <div className={` Nav`}> 
        </div>
        <div className={`MainDisplay ${styles.chat}`}>
            <div className={`borderColor ${styles.friendNameChat}`}>
               <div>
                     <p>{WindowLoad.username}</p>
                    <span className='userCode'>#
                    {WindowLoad.userCode && WindowLoad.userCode.toString().length == 1 ? "000" : ""}
                    {WindowLoad.userCode && WindowLoad.userCode.toString().length == 2 ? "00" : ""}
                    {WindowLoad.userCode && WindowLoad.userCode.toString().length == 3 ? "0" : ""}
                    {WindowLoad.userCode}
                    </span>
               </div>
            </div>
            <div className={`borderColor ${styles.textHolder} ${mediaUploaded && mediaUploaded.length > 0 ? styles.changeTextHolderHeight : ''}`} onScroll={handleScroll}>
                <div ref={messagesEndRef}/>
                {
                    chatList && chatList.length > 0 ? chatList.map( (msg , index , array) =>{
                        return <>
                            {
                                msg.newMessages ? <div className={`${styles.newMessages}`}>{`(${msg.newMessages}) new message${msg.newMessages > 1 ? 's' : ''}`}</div> : null
                            }
                             <MessageForm key={msg.Text_ID ? msg.Text_ID : msg.Old_ID} socket={socket} id={msg.Text_ID} myName={user.name} myCode={user.code} myPicToken={user.picToken} myPicType={user.profilePicType} msgWriterName={msg.User_Name} msgWriterCode={msg.User_Code} talkingWithPicToken={WindowLoad.picToken} talkingWithPicType={WindowLoad.picType} text={msg.Text_Message} date={msg.Text_Date} textEdited={msg.Text_Edit} status={msg.Text_Status} view={msg.Text_View}  tempMedia={msg.Text_TempMedia}  mediaFiles={msg.Text_MediaFiles} mediaFolder={msg.Text_MediaFolder} showUser={msg.showUser}/>
                        </>
                    })
                    :'Please dont share your information. We will never ask for your credentials.'
                }
            </div>
                {mediaUploaded && mediaUploaded.length > 0 ?
                    <div className={`borderColor ${styles.mediaHolder}`} ref={mediaHolderRef}>
                    {
                      mediaUploaded.map((data , index)=>{  
                        let name = data.name;
                        let src = data.src;
                        let size = data.size;
                        size > 1024 ? size = (size/1024).toFixed(2) + " MB" : size += " KB"
                        name.length > 20 ? name = name.substring(0, 20) : null;
                        const removeMedia = () => { 
                            let media = [...mediaUploadedRef.current].find(med => med.id == index)
                            const indexOf = [...mediaUploadedRef.current].indexOf(media)
                            if(!media)return;
                            SetMediaUploaded(oldArray => {
                                let newArr = [
                                    ...oldArray.slice(0, indexOf),
                                    ...oldArray.slice(indexOf + 1),
                                ];
                                mediaUploadedRef.current = newArr
                                return newArr;
                            })
                        };
                        return (
                          <div className={`secondLayer  ${styles.mediaDiv}`} key={`media_${index}_${ new Date().getTime()}`}>
                            <div className={`${styles.removeMediaDiv}`} onClick={removeMedia}>
                                <span className='bi bi-x'></span>
                            </div>
                            {
                                data.itsImage ? <img src={src}/> : 
                                <video controls>
                                    <source src={src}/> 
                                    Your browser does not support the video tag.
                                </video>
                            }
                          </div>
                        ) 
                      })}
                    </div> : null
                }
                <div className={`InputField ${styles.inputHolder}`}>
                    <textarea placeholder={`Type here...`} ref={messageText}  onKeyDown={handleKeyDown} maxLength={300} onInput={handleInput}/>
                    <div>
                        <label className={`bi bi-upload`} htmlFor="mediaFileInsertPost"></label>
                        <input type="file" id="mediaFileInsertPost" onChange={UploadMediaFile} style={{display:"none"}} ref={mediaFileRef} multiple/>
                    </div>
                </div>
            {/* <div id="leftSideChat">
                <input type="button" id="friendCallChat" />
                <input type="button" id="friendCloseChat" value="&times;" />
            </div> */}
        </div>
        </>
    )
}

    
