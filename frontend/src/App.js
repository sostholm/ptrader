import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {displayNotification} from 'components/push-notification'
import Login from 'components/Login'
import AddAccount from 'components/add-account'
import AddWallet from 'components/add-wallet'
import AddToken from 'components/add-token'
import Balance from 'components/balance'
import Settings from 'components/settings'
import Drawer from 'components/drawer'
import Carousel from 'views/carousel'
import Dexie from 'dexie'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { assertScalarType } from 'graphql';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

// const useStyles = makeStyles((theme) => ({
//   root: {
//     backgroundColor: '#282c34',
//     minHeight: '100vh',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: 'calc(10px + 2vmin)',
//     color: 'white'
//   },
// }));
// let url
// if(process.env.NODE_ENV === 'development') {
//   url = 'ws://localhost'
// }

// if(process.env.NODE_ENV === 'production') {
//   url = `wss://pine64`
// }

let ws
const db = new Dexie('ptrader')

db.version(1).stores({
  receiveQueue: 'id, payload',
  balance: 'id, total, available',
  exchanges: 'id, name'
});

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('Login')
  const [balance, setBalance] = useState()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if(!loggedIn && view !== 'Login'){
      setView('Login')
    }
  },[loggedIn])

  useEffect(() => {
    if(!connected){
      ws = new WebSocket("wss://pine64:8000/ws")
      ws.onopen = async () => {

        ws.onmessage = async (event) => {
          console.log(event.data);
          let message = JSON.parse(event.data)
          if('id' in message){
            let id = message.id
            await db.receiveQueue.add({
              id: id,
              payload: message.payload,
            })
          }
          if('put' in message){
            Object.keys(message.payload).map(table => {
              message.payload[table].map(entry => db[table].put(entry))
            })
          }
          if('delete' in message){
            Object.keys(message.payload).map(table => {
              message.payload[table].map(entry => db[table].delete(entry.id))
            })
          }
        }

        ws.onclose = (event) => {
          if (event.wasClean) {
            alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            setLoggedIn(false, setConnected(false))
          } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            setLoggedIn(false, setConnected(false))
            alert('[close] Connection died');
          }
        }
      }
    }
  },[connected])

  const get_query = async (payload) => {
    let id = Math.floor(Math.random() * Math.floor(100000000))
    let request = {
      id: id,
      payload: payload
    }
    ws.send(JSON.stringify(request))

    while(true){
      const resp = await db.receiveQueue.get(id)
      if(resp){
        db.receiveQueue.delete(id)
        return resp
      }
      else{
        await new Promise(r => setTimeout(r, 20));
      } 
    }
  }

  const views = [
    {key: 'Login', text: 'Login'}, 
    {key: 'AddAccount', text: 'Add Account'}, 
    {key: 'Add Wallet', text: 'Add Wallet'},
    {key: 'Add Token', text: 'Add Token'},
    {key: 'Balance', text: 'Balance'},
    {key: 'Settings', text: 'Settings'}
  ]

  return (
    <div className="App">
      
      <div className="App-header">
      <ThemeProvider theme={darkTheme}>
        {loggedIn && <Drawer views={views} setView={setView}/>}
        {view === 'Login' && <Login getQuery={get_query} loggedIn={loggedIn} setLoggedIn={setLoggedIn} setView={setView}/>}
        {view === 'Balance' && <Balance getQuery={get_query} />}
        {/* <button onClick={displayNotification}>Display Notification</button> */}
        {/* <Carousel> */}
          
        {loggedIn && view === 'Add Account' && <AddAccount getQuery={get_query}/>}
        {loggedIn && view === 'Add Wallet' && <AddWallet getQuery={get_query} />}
        {loggedIn && view === 'Add Token' && <AddToken getQuery={get_query} />}
        {loggedIn && view == 'Settings' && <Settings getQuery={get_query} />}
        {/* </Carousel> */}
      </ThemeProvider>
      </div>
    </div>
  );
}

export default App;
