
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSocket } from "../../store/actions/socketAction";
// export function setGameSettings(GAME_SETTINGS) {
//     //set sound for user
//     $('#SettingsTab').find('#setOverallSound').val(GAME_SETTINGS.Sound_UI * 10)
//     $('#inputClick').prop("volume", GAME_SETTINGS.Sound_UI);
//     //set user theme color
//     $("#activateColorMode input").removeClass('selectedColorMode')
//     if (GAME_SETTINGS.Theme_Color == 1) {
//       $("body").removeClass("bodyLightMode");
//       $("body").addClass("bodyDarkMode");
//       $("#activateDarkMode").addClass('selectedColorMode')
//     } else {
//       $("body").removeClass("bodyDarkMode");
//       $("body").addClass("bodyLightMode");
//       $("#activateLightMode").addClass('selectedColorMode')
//     }
//   }

//   export function showServerMsg(serverMsg, inputText) {
//     $("#AlertFromServer span").text(serverMsg)
//     $("#AlertFromServer input").val(inputText);
//     $("#AlertFromServer").show()
//   }

