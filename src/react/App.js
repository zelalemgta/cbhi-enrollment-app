import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Members from './containers/Members';
import Reports from './containers/Reports';
import Settings from './containers/Settings';
import Notification from './components/Notification';
import { channels } from '../shared/constants';

const { ipcRenderer } = window;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#222d32', //'#0288d1',
      footer: '#0288d1'
    },
    secondary: {
      main: '#43a047',
    },
    text: {
      primary: '#000',
      secondary: '#333',
      altColor: '#fff',
      label: "#777"
    }
  },
  typography: {
    h6: {
      fontSize: '1rem'
    }
  }
});

function App() {

  const [notification, setNotification] = useState({
    open: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    ipcRenderer.on(channels.SEND_NOTIFICATION, (event, result) => {
      setNotification({
        open: true,
        ...result
      });
    });
    return () => {
      ipcRenderer.removeAllListeners(channels.SEND_NOTIFICATION);
    }
  }, [notification]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Notification open={notification.open} type={notification.type} message={notification.message} />
        <Header />
        <Navigation />
        <Switch>
          <Route exact path="/" component={Members} />
          <Route exact path="/reports" component={Reports} />
          <Route exact path="/settings" component={Settings} />
          <Route render={() => <Redirect to="/" />} />
        </Switch>
        <Footer />
      </ThemeProvider>
    </Router>
  );
}

export default App;
