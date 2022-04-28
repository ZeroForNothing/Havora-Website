import { useRef, useState } from 'react'
import moment from "moment";
import styles from '../../../styles/WindowTab/Chat.module.css'
import { CircularProgressbar , buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MessageForm = ({socket ,id,myName,myCode,myPicToken,myPicType, msgWriterName,msgWriterCode ,talkingWithPicToken, talkingWithPicType, text, date, textEdited, status, view,tempMedia , mediaFiles , mediaFolder , showUser})=> {

    let [myMsg,SetMyMSg] = useState( myName === msgWriterName && myCode === msgWriterCode);
    let [picToken , SetPicToken] = useState(myMsg ? myPicToken : talkingWithPicToken)
    let [picType , SetPicType] = useState(myMsg ? myPicType : talkingWithPicType)

    if(!tempMedia && mediaFiles && mediaFolder)mediaFiles = mediaFiles ? mediaFiles.toString().split(",") : null

    return (
        <div className={`${styles.msgContainer}`}>
            <div className={`${styles.msgUserInfo}`}>
                {
                    showUser ?  <div className={`secondLayer ${styles.msgUserImage}`} style={{ backgroundImage:  picType ? `url(${"/MediaFiles/ProfilePic/" + picToken + "/" + picType })` : 'none'}}></div> : null
                }   
                {
                    !showUser? <div className={`userCode ${styles.shortTime}`}>{moment(date).format('hh:mm')}</div> : null
                }
                
            </div>
            <div className={`${styles.textDiv}`}>
                {/* <div className={`${styles.recieverListDiv}`}>
                    <input type="button" className={`${styles.DeleteUserMsg}`} value="Delete" />
                    <input type="button" className={`${styles.EditUserMsg}`} value="Edit"/>
                </div> */}
                {
                   showUser ? <div className={`${styles.msgUserName}`}  onClick={()=> {
                    window.history.pushState({}, document.title, `/?user=${msgWriterName}&code=${msgWriterCode}`);
                    socket.emit('OpenWindow',{
                        window : 'Profile'
                      })
                }} >
                       <p>{msgWriterName}</p>
                        <span className='userCode'>#
                        {msgWriterCode && msgWriterCode.toString().length == 1 ? "000" : ""}
                        {msgWriterCode && msgWriterCode.toString().length == 2 ? "00" : ""}
                        {msgWriterCode && msgWriterCode.toString().length == 3 ? "0" : ""}
                        {msgWriterCode}
                        </span>
                        <div className={`userCode ${styles.longTime}`}>{moment(date).format('hh:mm A')}</div>
                   </div> :null
                }
                {
                    mediaFiles && mediaFiles.length > 0 && !tempMedia ? mediaFiles.map(( media,index) =>{
                        return <div className={`${styles.msgMediaHolder}`}>
                           {
                                (media.endsWith(".png") || media.endsWith(".jpg") || media.endsWith(".jpeg")) ?
                                <img key={index} className={`secondLayer`} src={`/MediaFiles/ChatFiles/${picToken}/${mediaFolder}/${media}`} />
                                : (
                                  (media.endsWith(".mp4") || media.endsWith(".MP4") || media.endsWith(".mov")|| media.endsWith(".x-matroska")) ?
                                    <video key={index} className={`secondLayer`} controls>
                                      <source src={`/MediaFiles/ChatFiles/${picToken}/${mediaFolder}/${media}`} />
                                      Can't view video here
                                    </video> : null)
                           }
                        </div>
                        })
                    : null
                }
                {
                    !mediaFiles && !mediaFolder && tempMedia && tempMedia.length > 0 ? tempMedia.map(( media,index) =>{
                        return <div className={`${styles.msgMediaHolder}`}> 
                            <div className={`${styles.tempMediaDiv}`}>
                                {
                                    media.itsImage ?
                                    <img key={index} className={`secondLayer`} src={media.src} />
                                    : 
                                    <video key={index} className={`secondLayer`} controls>
                                        <source src={media.src} />
                                        Can't view video here
                                    </video> 
                                }
                                {
                                    !media.finished ?                                
                                     <div className={`${styles.progress}`}>
                                        <CircularProgressbar value={media.percentage}   styles={buildStyles({
                                            // How long animation takes to go from one percentage to another, in seconds
                                            pathTransitionDuration: 0.01,
                                            // Colors
                                            pathColor: `#ff3232`,
                                            trailColor: '#2d2d2d',
                                            // backgroundColor: '#32ff34',
                                        })}/>
                                    </div> : null
                                }
                            </div>
                        </div>
                        })
                    : null
                }
               
                <div className={`${styles.msgText}`}>
                    <span>{text}
                    {
                        textEdited === "edited" ?  '(edited)' : null
                    }
                    </span>
                </div>
                   {
                       myMsg?<div className={`${styles.checkMark} bi ${view === 'seen' ? styles.msgSeen :''} 
                       ${status === 'recieved' ? 'bi-check2-all' : status === 'sent' ? 'bi-check2' : 'bi-clock'}`}></div>: null
                   } 
                
            </div>
        </div>
    )
  }
  
  export default MessageForm;