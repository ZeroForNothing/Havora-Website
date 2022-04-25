import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styles from '../../../styles/WindowTab/Chat.module.css'
import MessageForm from './Message'
export default function ChatTab({WindowLoad}){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    let messageText = useRef(null)
    let [chatList , SetChatList] = useState(null)
    let chatPrevListRef = useRef(null)
    let messagesEndRef = useRef(null)
    let [writtenMessagesCounter , SetWrittenMessagesCounter] = useState(0)
    let lastMsgFromUserNameRef = useRef(null)
    let lastMsgFromUserCodeRef = useRef(null)
    let [lastMsgFromUserName , SetLastMsgFromUserName] = useState(null)
    let [lastMsgFromUserCode , SetLastMsgFromUserCode] = useState(null)
    const scrollToBottom = () => {
        setTimeout(()=>{ messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) },50)
    }
    useEffect(()=>{
        if(!socket) return;
        socket.emit('showChatHistory')
        socket.on('showChatHistory', function(data) {
            let chatlogHistory = JSON.parse(data.chatLog);
            if (chatlogHistory == null) return;
            chatlogHistory.reverse();
            let username = null;
            let userCode = null;
            chatlogHistory.forEach(msg => {
                if(username === msg.User_Name && userCode === msg.User_Code) 
                    msg.alreadyWritten = true
                else{
                    username = msg.User_Name
                    userCode = msg.User_Code
                    msg.alreadyWritten = false
                }
            });
            console.log(chatlogHistory)
            chatPrevListRef.current = chatlogHistory
            SetChatList(chatlogHistory)
            scrollToBottom()
        })
        socket.on('sendMessage', function(data) {
            if (data.myself) {
                if(isNaN(data.textID) || isNaN(data.oldID)) return;
                let message = [...chatPrevListRef.current].find(msg => msg.Old_ID == data.oldID)
                const index = [...chatPrevListRef.current].indexOf(message)
                if(!message)return;
                message.Text_ID = parseInt(data.textID);
                message.Text_Status = "sent"
                SetChatList(oldArray => {
                    return [
                        ...oldArray.slice(0, index),
                        message,
                        ...oldArray.slice(index + 1),
                    ]
                })
            } else {
                if(!data.message || isNaN(data.textID) || !data.username || !data.userCode || !data.unSeenMsgsCount) return;
                let alreadyWritten = false;
                if(data.username === lastMsgFromUserNameRef && data.userCode=== lastMsgFromUserCodeRef)
                    alreadyWritten = true; 
                else{
                    lastMsgFromUserNameRef = (data.username);
                    lastMsgFromUserCodeRef = (data.userCode);
                }
                CreateMessageHolder(parseInt(data.textID),data.message,data.username,data.userCode , alreadyWritten)
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
    },[socket])
    function CreateMessageHolder(id,text , username,userCode , alreadyWritten){
        let newArr = {Old_ID: id, Text_ID: null, User_Name:username, User_Code : userCode,Text_Message:text,Text_Date:new Date(),Text_Edit:'original', Text_Status:"waiting",Text_View : "unSeen" , alreadyWritten}
        SetWrittenMessagesCounter(id + 1)
        chatPrevListRef.current = [...chatPrevListRef.current] ? ([...chatPrevListRef.current]).concat([newArr]) : [newArr];
        SetChatList(chatPrevListRef.current)
        scrollToBottom()
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && messageText.current.value.trim().length != 0) {
            event.preventDefault();
            let id = writtenMessagesCounter;
            let alreadyWritten = false;

            if(user.name === lastMsgFromUserName && user.code=== lastMsgFromUserCode)
                alreadyWritten = true; 
            else{
                SetLastMsgFromUserName(user.name);
                SetLastMsgFromUserCode(user.code);
            }
            CreateMessageHolder(id,messageText.current.value.trim(),user.name,user.code , alreadyWritten)

            let message = messageText.current.value.trim()
            socket.emit('sendMessage', {
                message,
                id,
                randomString: ""
            })
            messageText.current.value = '';
        }
      }

    return (
        <>
        <div className={` Nav`}> 

        </div>
        <div className={`MainDisplay ${styles.chat}`}>
            <div className={`${styles.friendNameChat}`}>
                <span>{WindowLoad.username}#{WindowLoad.userCode}</span>
            </div>
            <div className={`${styles.textHolder}`} id="message-container" >
                {
                    chatList && chatList.length > 0 ? chatList.map( msg =>{
                        return <MessageForm key={msg.Text_ID ? msg.Text_ID : msg.Old_ID} id={msg.Text_ID} myName={user.name} myCode={user.code} myPicToken={user.picToken} myPicType={user.profilePicType} msgWriterName={msg.User_Name} msgWriterCode={msg.User_Code} talkingWithPicToken={WindowLoad.picToken} talkingWithPicType={WindowLoad.picType} text={msg.Text_Message} date={msg.Text_Date} textEdited={msg.Text_Edit} status={msg.Text_Status} view={msg.Text_View} alreadyWritten={msg.alreadyWritten}/>
                    })
                    :'Please dont share your information. We will never ask for your credentials.'
                }
                <div ref={messagesEndRef}/>
            </div>
            <textarea className={`secondLayer InputField ${styles.inputHolder}`} placeholder={`Type here...`} maxLength={300} ref={messageText} id="message-input" 
                   onKeyDown={handleKeyDown}
            ></textarea>
            {/* <div id="leftSideChat">
                <input type="button" id="friendCallChat" />
                <input type="button" id="friendCloseChat" value="&times;" />
            </div> */}
            {/* <script type="text/javascript">
            $('#message-container').on('scroll', function() {
            if ($(this).scrollTop() < 250 && FetchChat) {
            console.log("pass")
            FetchChat = false
            socket.emit('showChatHistory')
            }
            });
            </script> */}
        </div>
        </>
    )
}

    
