import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchSocket } from '../store/actions/socketAction'
import { fetchUser } from '../store/actions/userAction'
import { withIronSession } from "next-iron-session";

import Layout from '../components/fields/Layout'
import MainNav from '../components/TopPanel/MainNav'
import FriendsList from '../components/RightPanel/FriendsList'
import { ShowError } from '../components/fields/error'
import LoginForm from "../components/NoAuth/LoginForm"

import HomeTab from '../components/WindowTab/Home'
import ProfileTab from '../components/WindowTab/Profile'
import PostTab from '../components/WindowTab/Post'
import CommunityTab from '../components/WindowTab/Community'
import ChatTab from '../components/WindowTab/Chat'
import SettingsTab from '../components/WindowTab/Settings'


const Index = ({ userSession })=> {

  const dispatch : any = useDispatch();
  let { socket } = useSelector((state: any) => state.socket)
  let { user } = useSelector((state: any) => state.user)
  let [homeTab, SetHomeTab] = useState(true)
  let [profileTab, SetProfileTab] = useState(false)
  let [postTab, SetPostTab] = useState(false)
  let [communityTab, SetCommunityTab] = useState(false)
  let [chatTab, SetChatTab] = useState(false)
  let [settingsTab, SetSettingsTab] = useState(false)

  let [WindowLoad, SetWindowLoad]  = useState(null)

   useEffect(()=>{  
     if(userSession){
       if(!socket){ dispatch(fetchSocket()) }
       else {        
          if(userSession) socket.emit('socketLogin',userSession)
          socket.on('registerUser',data =>{
           dispatch(fetchUser(data))
          })
          socket.on('ShowError',data =>{
            ShowError(data.error)
          })
          socket.on('OpenWindow',(data)=>{
              let window : string = data.window;

              if(window !== "Post"){
                let allButtons = document.getElementsByClassName("WindowButton");
                for (let i = 0; i < allButtons.length; i++) 
                   allButtons[i].classList.remove("pickedInput");
                let selectedButton = document.getElementById(window);
                if(selectedButton) selectedButton.classList.add("pickedInput");
              }
              
              SetHomeTab(false)
              SetProfileTab(false)
              SetPostTab(false)
              SetCommunityTab(false)
              SetChatTab(false)
              SetSettingsTab(false)
              if(window === "Home") SetHomeTab(true)
              else if(window === "Profile") SetProfileTab(true)
              else if(window === "Post"){
                SetWindowLoad(data.load)
                SetPostTab(true)
              }
              else if(window === "Community") SetCommunityTab(true)
              else if(window === "Chat"){
                SetWindowLoad(data.load)
                SetChatTab(true)
              }else if(window === "Settings") SetSettingsTab(true)
          })
        }
      }
    }, [socket])
  return (
    <>
      {userSession ?
        <Layout title="Havora" >
          <MainNav />
          <FriendsList />
          <div className={`baseLayer WindowTab`}>
            { homeTab ? <HomeTab /> : null }
            { profileTab ? <ProfileTab userEmail={userSession.email}/> : null }
            { postTab ? <PostTab WindowLoad={WindowLoad} /> : null }
            { communityTab ? <CommunityTab /> : null }
            { chatTab ? <ChatTab WindowLoad={WindowLoad} /> : null }
            { settingsTab ? <SettingsTab userEmail={userSession.email}/> : null }
          </div>
        </Layout>
        : <LoginForm />}
    </>
  )
}
export const getServerSideProps = withIronSession(
  async ({ req, res }) => {
    const userSession = req.session.get("user");
    if (!userSession) {
      //res.statusCode = 403;
      //res.end();
      return { props: {} };
    }
    
    return { props: { userSession } };
  },
  {
    cookieName: "ZeroForNothing",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false
    },
    password: process.env.APPLICATION_SECRET
  }
  );
  export default Index;
  
  