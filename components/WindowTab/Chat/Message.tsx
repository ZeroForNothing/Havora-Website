import { useRef, useState } from 'react'
import moment from "moment";
import styles from '../../../styles/WindowTab/Chat.module.css'


const MessageForm = ({id,myName,myCode,myPicToken,myPicType, msgWriterName,msgWriterCode ,talkingWithPicToken, talkingWithPicType, text, date, textEdited, status, view,alreadyWritten })=> {

    let [myMsg,SetMyMSg] = useState( myName === msgWriterName && myCode === msgWriterCode);
    let [picToken , SetPicToken] = useState(myMsg ? myPicToken : talkingWithPicToken)
    let [picType , SetPicType] = useState(myMsg ? myPicType : talkingWithPicType)
    return (
        <div className={`${styles.msgContainer}`}>
            <div className={`${styles.msgUserInfo}`}>
                {
                    !alreadyWritten ?  <div className={`secondLayer ${styles.msgUserImage}`} style={{ backgroundImage:  picType ? `url(${"/MediaFiles/ProfilePic/" + picToken + "/" + picType })` : 'none'}}></div> : null
                }   
                {
                    alreadyWritten? <div className={`userCode ${styles.shortTime}`}>{moment(date).format('hh:mm')}</div> : null
                }
                
            </div>
            <div className={`${styles.textDiv}`}>
                {/* <div className={`${styles.recieverListDiv}`}>
                    <input type="button" className={`${styles.DeleteUserMsg}`} value="Delete" />
                    <input type="button" className={`${styles.EditUserMsg}`} value="Edit"/>
                </div> */}
                {
                   !alreadyWritten? <div className={`${styles.msgUserName}`}>
                       <p>{myName}</p>
                        <span className='userCode'>#
                        {myCode && myCode.toString().length == 1 ? "000" : ""}
                        {myCode && myCode.toString().length == 2 ? "00" : ""}
                        {myCode && myCode.toString().length == 3 ? "0" : ""}
                        {myCode}
                        </span>
                        <div className={`userCode ${styles.longTime}`}>{moment(date).format('hh:mm A')}</div>
                   </div> :null
                }
                
                <div className={`${styles.msgText}`}>
                    <span>{text}
                    {
                        textEdited === "edited" ?  '(edited)' : null
                    }
                    </span>
                   {
                       myMsg?<div className={`${styles.checkMark} bi ${view === 'seen' ? styles.msgSeen :''} 
                       ${status === 'recieved' ? 'bi-check2-all' : status === 'sent' ? 'bi-check2' : 'bi-clock'}`}></div>: null
                   } 
                </div>
                
            </div>
        </div>
    )
  }
  
  export default MessageForm;