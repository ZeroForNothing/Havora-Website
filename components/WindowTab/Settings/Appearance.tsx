import { useSelector } from "react-redux"
import style from "../../../styles/WindowTab/Appearance.module.css";
import ThemeBox from "../../Components/ThemeBox";

export default function Appearance({editAppearanceNav, ...props}) {

    let { user } = useSelector((state: any) => state.user)
    let { socket } = useSelector((state: any) => state.socket)
    
    const setTheme = (themeId:number)=>{
      
      socket.emit( 'SetThemeColor', { color : themeId } )
      
        
        console.log(themeId)
    }

    
    return editAppearanceNav ? (
      <div className={`MainDisplay`}>
        <div className={`${style.externalContainer}`}>
          <ThemeBox
            Theme_Name="Light Mode"
            Theme_Color={user.settings.Theme_Color == 0 ? "pickedBorderColor" : ""}
            setTheme={setTheme}
            themeId={0}
            PC={style.LightThemePC}
            SC={style.LightThemeSC}
            TC={style.LightThemeTC}
          />
          <ThemeBox
            Theme_Name="Dark Mode"
            Theme_Color={user.settings.Theme_Color == 1 ? "pickedBorderColor" : ""}
            setTheme={setTheme}
            themeId={1}
            PC={`dark-primary-bgcolor`}
            SC={`dark-secondary-bgcolor`}
            TC={`dark-pickedInput-bgcolor`}
          />
          <ThemeBox
            Theme_Name="Blue Mode"
            Theme_Color={user.settings.Theme_Color == 2 ? "pickedBorderColor" : ""}
            setTheme={setTheme}
            themeId={2}
            PC={`blue-primary-bgcolor`}
            SC={`blue-secondary-bgcolor`}
            TC={`blue-pickedInput-bgcolor`}
          />
          <ThemeBox
            Theme_Name="Purple Mode"
            Theme_Color={user.settings.Theme_Color == 3 ? "pickedBorderColor" : ""}
            setTheme={setTheme}
            themeId={3}
            PC={`purple-primary-bgcolor`}
            SC={`purple-secondary-bgcolor`}
            TC={`purple-pickedInput-bgcolor`}
          />
        </div>
      </div>
    ) : null;
}