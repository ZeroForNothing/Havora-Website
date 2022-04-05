import { ShowError } from "../../fields/error";
export default  function PostNav (socket,postForProfile,postForCommunity,postForUser , SetPostType ,SetDiscardPost ,SetSubmitPost , PostText , PostUrl){
    if(socket == null) return;
    function ShowCreatePost(){
        let type = null;
        let username = null;
        let userCode = null;
        if(postForProfile.current.classList.contains("pickedInput")){
            type = 1
        }
        else if(postForCommunity.current.classList.contains("pickedInput")){
            type = 2
        }
        else if(postForUser.current.classList.contains("pickedInput")){
            type = 3
            let value : string = (document.getElementById("createPostForUserName") as any).value;
            username = value.substr(0, value.indexOf('#'));
            userCode = value.substr(value.indexOf('#') + 1, 4);
        }
        socket.emit('startCreatingPost', {
            type: type,
            username : username,
            userCode : userCode
        })
    }
    function DiscardPost(){
        socket.emit("discardPost")
    }
    function SubmitPost(){
        let text = null;
        let url = null;
        if(PostText.current) text = PostText.current.value
        if(PostUrl.current) url = PostUrl.current.value
        socket.emit("createPost",{
            text,
            url
        })
    }

    SetPostType(()=>ShowCreatePost)
    SetDiscardPost(()=>DiscardPost)
    SetSubmitPost(()=>SubmitPost)
}
