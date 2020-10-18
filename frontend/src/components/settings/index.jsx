import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import {subscribeUser} from 'components/push-notification'
import {updateSubscription} from 'services'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexFlow: 'column',
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
      },
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
      },
  }));

export default function Settings(props){

    const classes = useStyles()

    if(props.invisible) return <></>

    async function addSubscriptionInfo(){
        await subscribeUser( (sub) => props.getQuery(updateSubscription(sub)))
        console.log('this')
    }

    return(
        <div className={classes.root}>
            <Button variant="contained" color="primary" onClick={addSubscriptionInfo}>Subscribe Push Notification</Button>
        </div>
    )
}