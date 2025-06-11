import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get('/health',(_req,res)=>{
    res.status(200).json({status:'UP'});
})

const port = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || 'inventory-service';

//Error handler
app.use((err,_req,res,_next)=>{
    console.log(err.stack)
    res.status(500).json({message:'Internal server error'})
})

app.listen(port,()=>{
    console.log(`${serviceName} is running on port ${port}`)
})