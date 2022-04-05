import {ShowError , HideError}  from '../../fields/error'
export default  function PostData (socket,SetPostContainer,PostTitle,SetItsCategory){
    if(socket == null) return;
    socket.on("startCreatingPost", function(data) {
      SetPostContainer(true)
          if (data.type == 1) {
            SetItsCategory(false)
            PostTitle.current.textContent = 'Profile Post'
          } else if (data.type == 2) {
            SetItsCategory(true)
            PostTitle.current.textContent = 'Community Post'
          } else if (data.type == 3 && data.username != null && data.code != null) {
            SetItsCategory(false)
            PostTitle.current.textContent = data.username + "#" + data.code + " Post"
          }       
      });
    socket.on("discardPostCreation", ()=> {
      SetPostContainer(false)
    });
    socket.on("promptToDiscardPost",()=>{
      console.log("Discard post")
    })
}
export function checkAcceptedExtensions (file) {
	const type = file.type.split('/').pop()
	const accepted = ['jpeg', 'jpg', 'png', 'mp4' , 'mp3' , 'mov' ,'avi' ,'mkv' , 'x-matroska']
	if (accepted.indexOf(type) == -1) {
		return false
	}
	return true
}
export const InsertYoutubeUrl = (e ,youtubeIFrame) => {
    let element = e.target;
    let url = element.value;
    if (url != undefined || url != '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      let frameDoc = youtubeIFrame.current
      if (match && match[2].length == 11) {
        HideError()
        frameDoc.src = 'https://www.youtube.com/embed/' + match[2] + '?enablejsapi=1&modestbranding=1';
        frameDoc.style.display = 'inline-block'
      } else {
        ShowError("Invalid Youtube Url")
          frameDoc.src = 'about:blank';
          frameDoc.style.display = 'none'
      }
    }
    if(url.trim().length < 1) HideError()
  }
