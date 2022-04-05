export default  function ProfileData (socket,SetUserName ,SetUserCode,SetUserPic, SetUserWall ,ShowComments , ShowReplies,ShowCreateComment, SetPosts , SetComments , SetReplies , SetOnClickBehavior, DeleteContentEvent  , SaveContentEvent,SetMyProfile, SetMainNav,SetPostNav , SetLoadMorePosts,SetLoadMoreComments,SetLoadMoreReplies,commentPage , SetCommentPage , replyPage , SetReplyPage , CommentTextCreation , SetCreateComment){
   
      function CreateComment(){
        let text = CommentTextCreation.current.value
        ShowCreateComment(false)
        socket.emit("createProfileComment",{
          text
        })
      }
      socket.on('createProfileComment', function(data) {
          alert("Posted successfully")
      })
}
export function checkAcceptedExtensions (file) {
	const type = file.type.split('/').pop()
	const accepted = ['jpeg', 'jpg', 'png']
	if (accepted.indexOf(type) == -1) {
		return false
	}
	return true
}
