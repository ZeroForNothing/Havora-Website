import React, { useRef, useState } from "react"
import styles from '../../styles/RightPanel/FriendsList.module.css'

export const GroupSlot = ({ socket, name , SetPreview })=>{
    const slotRef = useRef(null);
    return (
        <div className={`WindowButton ${styles.friendStatus}`} onClick={() => { SetPreview({group : name ,name: null, code : null , prof : null, wall : null , token : null , top : slotRef.current.offsetTop}) }} ref={slotRef}>

            {name}
            
        </div>
    )
}