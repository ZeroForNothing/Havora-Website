import style from "../../styles/WindowTab/Appearance.module.css";

//PC : primary color
//SC : secondary color
//TC : third color
export default function ThemeBox({Theme_Color, setTheme, Theme_Name, themeId, PC, SC, TC, ...props}) {
    return <div
        className={`secondLayer ${style.ThemeButton} ${Theme_Color}`}
        onClick={() => setTheme(themeId)}
    >
        <div className={`${style.titleThemeColor}`}><span>{Theme_Name}</span> {Theme_Color == "pickedInput"?<span className={style.badge}>Active</span>: null} </div>
        <div className={`${style.ColorsContainer}`}>
            <div className={`${style.ColorBoxes} ${PC}`}></div>
            <div className={`${style.ColorBoxes} ${SC}`}></div>
            <div className={`${style.ColorBoxes} ${TC}`}></div>
        </div>
    </div>
}