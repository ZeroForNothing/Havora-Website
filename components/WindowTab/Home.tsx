import styles from '../../styles/WindowTab/Home.module.css'
export default function HomeTab(){
    return (
        <>
        <div className={` Nav`}> 
            <input type="button" id="WhatsNew" className={`${"pickedInput"} ${styles.whatsNew}`}/>
            <input type="button" id="PatchNotes" className={`${styles.patchNotes}`}/>
        </div>
        <div id="HomeTab" className="WindowTab">
        <ul>
            <li>finish the posting on other user profile</li>
            <li>other players not getting disconnected appear at their friends</li>
            <li>when signing out in web close every connection in the other tabs</li>
            <li>when signing in to an acc u must send auth token to every open instance</li>
            <li>make a reporting system</li>
            <li>Fix Errors that shows</li>
            <li>add more logs in the server</li>
            <li>add more trycatch on the server</li>
            <li>Inventory / store need to be done</li>
            <li>Home tab need to be filled</li>
            <li>Right a story about the game and what it hold</li>
            <li>Make the voice chat work</li>
        </ul>
        </div>
        </>
    )
}

    
