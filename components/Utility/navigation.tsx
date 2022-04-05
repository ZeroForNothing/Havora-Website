export default  function Navigation (socket , HomeTab , ProfileTab , PostTab){
    if(socket == null) return;

    let WindowButton = document.getElementsByClassName("WindowButton");
    for (let i = 0; i < WindowButton.length; i++) {
        let element = WindowButton[i];
        element.addEventListener("click", ()=>{ 
            socket.emit('OpenWindow',{
                window : element.id
            })
        });
    }
    socket.on('OpenWindow',(data)=>{
        let window : string = data.window;

        for (let i = 0; i < WindowButton.length; i++) 
            WindowButton[i].classList.remove("pickedInput");
        
        HomeTab(false)
        ProfileTab(false)
        PostTab(false)
        
        document.getElementById(window).classList.add("pickedInput");

        
        if(window === "Home") HomeTab(true)
        else if(window === "Profile") ProfileTab(true)
        else if(window === "Post") PostTab(true)
    })
}
