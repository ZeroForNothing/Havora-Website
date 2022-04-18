import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchSocket } from '../store/actions/socketAction'
import { fetchUser } from '../store/actions/userAction'
import { withIronSession } from "next-iron-session";

import Layout from '../components/fields/Layout'
import MainNav from '../components/RightPanel/MainNav'
import FriendsList from '../components/RightPanel/FriendsList'
import { ShowError } from '../components/fields/error'
import LoginForm from "../components/NoAuth/LoginForm"

import HomeTab from '../components/WindowTab/Home'
import ProfileTab from '../components/WindowTab/Profile'
import PostTab from '../components/WindowTab/Post'
import CommunityTab from '../components/WindowTab/Community'


const Index = ({ user })=> {

  const dispatch = useDispatch();
  let { socket } = useSelector((state: any) => state.socket)
  let [homeTab, SetHomeTab] = useState(true)
  let [profileTab, SetProfileTab] = useState(false)
  let [postTab, SetPostTab] = useState(false)
  let [communityTab, SetCommunityTab] = useState(false)

   useEffect(()=>{  
     if(user){

       if(socket == null){
         dispatch(fetchSocket())
        }
       else {        
          if(user) socket.emit('socketLogin',user)
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
              if(window === "Home") SetHomeTab(true)
              else if(window === "Profile") SetProfileTab(true)
              else if(window === "Post") SetPostTab(true)
              else if(window === "Community") SetCommunityTab(true)
          })
        }
      }
    }, [socket])
  return (
    <>
      {user ?
        <Layout title="Zero for Nothing">
          <MainNav />
          <FriendsList />
          <div className={`baseLayer WindowTab`}>
            { homeTab ? <HomeTab /> : null }
            { profileTab ? <ProfileTab userEmail={user.email}/> : null }
            { postTab ? <PostTab /> : null }
            { communityTab ? <CommunityTab /> : null }
          </div>
        </Layout>
        : <LoginForm />}
    </>
  )
}
export const getServerSideProps = withIronSession(
  async ({ req, res }) => {
    const user = req.session.get("user");
    if (!user) {
      //res.statusCode = 403;
      //res.end();
      return { props: {} };
    }
    
    return { props: { user } };
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
  
  