import React, { useRef, useState } from "react"
import styles from '../../styles/RightPanel/FriendsList.module.css'

export const CallSlot = ({ index ,stream , calling , biggerView,volume ,prof ,wall , token, muted , callInChat , SetBiggerView , SetSmallerView })=>{
    let isAudio = false;
    let isVideo = false;
    if(!calling && stream){
        if(stream.getAudioTracks().length)// checking audio presence
            isAudio=true;
        if(stream.getVideoTracks().length)// checking video presence
            isVideo=true;
    }
    return (
        <div className={`secondLayer ${calling? styles.shake : ''} ${styles.callerHolder} ${biggerView != null && biggerView === index ? styles.biggerView : ''}`} style={{borderColor : `rgba(0,150,0, ${volume ? volume : 0})`, 
        backgroundImage: wall ? `url(${"/MediaFiles/WallpaperPic/" + token + "/" + wall })` : 'none' }}  onClick={()=>{ 
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
                biggerView != null && biggerView === index &&  isVideo ? <video ref={video => {if(video){ video.srcObject = stream; }}} muted={muted} autoPlay></video> : isVideo ? <span>{`Watch stream`}</span> : null
            }
            {
                isAudio && <audio ref={audio => {if(audio){ audio.srcObject = stream; }}} muted={muted} autoPlay></audio> 
            }
            {
                !isVideo && <img className='unInteractiveLayer' src={`/MediaFiles/ProfilePic/${token}/${prof}`} /> 
            }
            {/* {
                callUser.calling && <div>Calling</div>
            } */}
        </div>
    )
}