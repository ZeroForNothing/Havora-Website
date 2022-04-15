import communityStyles from '../../../styles/WindowTab/Community.module.css'
import { useState,useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ShowError } from '../../fields/error';
import Content from '../Content';
import CategorySearch from '../../fields/CategorySearch';

export default function CommunityTab(){

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)

    const [mainNav, SetMainNav] = useState(true);
    const [postNav, SetPostNav] = useState(false);

    const [currentCategoryID, SetCurrentCategoryID] = useState<number>(null);


    useEffect(()=>{
        if(!socket) return;
    },[socket])
    return (  
    <>
        <div className={`Nav`}>
            {
                mainNav ? null : null
            }
        </div>
        
        {
            !postNav ? <CategorySearch socket={socket} currentCategoryID={currentCategoryID} SetCurrentCategoryID={SetCurrentCategoryID} fetchPosts={true}/> : null
        }         
            <Content socket={socket} user={user} currentCategoryID={currentCategoryID} SetCurrentCategoryID={SetCurrentCategoryID} CurrentProfile={null} mainNav={mainNav} postNav={postNav} SetMainNav={SetMainNav} SetPostNav={SetPostNav}/>
        
    </>
    )
}

    
