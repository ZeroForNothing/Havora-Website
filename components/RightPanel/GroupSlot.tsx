import React, { useRef, useState } from "react"
import styles from '../../styles/RightPanel/FriendsList.module.css'

export const GroupSlot = ({ socket, name })=>{
    const slotRef = useRef(null);
    return (
        <div className={`WindowButton ${styles.friendStatus}`} onClick={() => {  }} ref={slotRef}>

            {name}
            
        </div>
    )
}