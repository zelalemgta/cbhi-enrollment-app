import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Header from './components/organisms/Header';
import Navigation from './components/organisms/Navigation';
import Footer from './components/organisms/Footer';
import Members from './components/pages/MemberPage';
import EnrollmentReport from './components/pages/EnrollmentReportPage';
import ContributionReport from './components/pages/ContributionReportPage';
import Settings from './components/pages/SettingsPage';
import SystemProgess from './components/organisms/SystemProgress';
import Notification from './components/organisms/Notification';
import { channels } from '../shared/constants';

const { ipcRenderer } = window;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#222d32',
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
        <SystemProgess />
        <Notification open={notification.open} type={notification.type} message={notification.message} />
        <Header />
        <Navigation />
        <Switch>
          <Route exact path="/" component={Members} />
          <Route exact path="/reports/enrollment" component={EnrollmentReport} />
          <Route exact path="/reports/contribution" component={ContributionReport} />
          <Route exact path="/settings" component={Settings} />
          <Route render={() => <Redirect to="/" />} />
        </Switch>
        <Footer />
      </ThemeProvider>
    </Router>
  );
}

export default App;
