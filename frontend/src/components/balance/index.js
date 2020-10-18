import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { HorizontalBar } from 'react-chartjs-2';
import {my_balance} from 'services'
import {colors} from 'components/random-color'

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

export default function Balance(props){
    const [balances, setBalances] = useState()
    const [usd, setUsd] = useState()
    const [doughnut, setDoughnut] = useState()
    const classes = useStyles()

    async function getBalance(){
        const result = await props.getQuery(my_balance())
        setBalances(result.payload)
    }

    useEffect(() => {getBalance()}, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getBalance()
        }, 60000);
        return () => clearInterval(interval);
      }, []);

    useEffect(() => {
        if (balances){
            let total_usd = 0
            const above_1 = Object.values(balances.myBalance).filter(currency => parseFloat(currency.usd) > 1)
            Object.values(above_1).map(currency =>  total_usd += parseFloat(currency.usd))

            let currencies = {} 
            Object.values(above_1).map(currency =>  currencies[currency.currency] = 0)
            Object.values(above_1).map(currency =>  currencies[currency.currency] += parseFloat(currency.usd))

            currencies = Object.keys(currencies).map(key => [key, currencies[key]])
            currencies.sort((a,b) => (a[1] > b[1]) ? 1 : ((b[1] > a[1]) ? -1 : 0)).reverse()

            setDoughnut( {
                datasets: [{
                    data: currencies.map(arr =>  arr[1]),
                    backgroundColor: Object.values(above_1).map((currency, index) => colors[index]),
                    label: 'Value in USD'
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: currencies.map(arr =>  arr[0])
            })
            setUsd(total_usd)
        }
    }, [balances])

    if(props.invisible) return <></>

    return(
        <div className={classes.root}>
            <div>{usd}</div>
            <HorizontalBar width={"90%"} data={doughnut} />
        </div>
    )
}