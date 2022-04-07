import Layout from '../components/fields/Layout'
import MainNav from '../components/RightPanel/MainNav'
import FriendsList from '../components/RightPanel/FriendsList'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchSocket } from '../store/actions/socketAction'
import { fetchUser } from '../store/actions/userAction'
import { ShowError } from '../components/fields/error'
import HomeTab from '../components/WindowTab/Home'
import ProfileTab from '../components/WindowTab/Profile/Profile'
import PostTab from '../components/WindowTab/Post/Post'
import StoreTab from '../components/WindowTab/Store/Store'
import { withIronSession } from "next-iron-session";
import LoginForm from "../components/NoAuth/LoginForm"

const Index = ({ user })=> {

  const dispatch = useDispatch();
  let { socket } = useSelector((state: any) => state.socket)
  let [homeTab, SetHomeTab] = useState(true)
  let [profileTab, SetProfileTab] = useState(false)
  let [postTab, SetPostTab] = useState(false)
  let [storeTab, SetStoreTab] = useState(false)

   useEffect(()=>{  
     if(user){

       if(socket == null){
         dispatch(fetchSocket())
        }
       else {        
        if(user)
          socket.emit('socketLogin',user)
         socket.on('registerUser',data =>{
           dispatch(fetchUser(data))
          })
          socket.on('ShowError',data =>{
            ShowError(data.error)
          })
          socket.on('OpenWindow',(data)=>{
              let window : string = data.window;
                    
              let selectedButton = document.getElementById(window);
              let allButtons = document.getElementsByClassName("WindowButton");
              
              for (let i = 0; i < allButtons.length; i++) 
              allButtons[i].classList.remove("pickedInput");
              
              selectedButton.classList.add("pickedInput");
              
              SetHomeTab(false)
              SetProfileTab(false)
              SetPostTab(false)
              if(window === "Home") SetHomeTab(true)
              else if(window === "Profile") SetProfileTab(true)
              else if(window === "Post") SetPostTab(true)
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
          <div className={`WindowTab`}>
            { homeTab ? <HomeTab /> : null }
            { profileTab ? <ProfileTab userEmail={user.email}/> : null }
            { postTab ? <PostTab /> : null }
            { storeTab ? <StoreTab /> : null }
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
      //res.statusCode = 404;
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
  
  