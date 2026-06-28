import React, { useEffect } from 'react'
import Routes from "./src/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertNotificationRoot, Toast } from "react-native-alert-notification";
import ImmersiveMode from "react-native-immersive-mode";

const App = () => {

  useEffect(() => {
    ImmersiveMode.setBarMode("FullSticky");
    ImmersiveMode.setBarTranslucent(true);
  }, []);



  return (
      <AlertNotificationRoot theme='dark'>
        <SafeAreaProvider>
          <Routes />
        </SafeAreaProvider>
      </AlertNotificationRoot>
  )
}

export default App;