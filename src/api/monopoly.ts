import express, { Response, Request } from 'express'
import { SpinModel } from '../mongoose-models/monopoly/Spin'
import { MonopolySpin } from '../mongoose-models/monopoly/Spin';
const router = express.Router()
import { getInitialPageData, getLatestSpins, getLatestTable, getStatsInTheLastHours } from './get'
import { MonopolyTable, MonopolyTableModel } from './../mongoose-models/Tables';

router.post('/write-spins', async (request : Request, response : Response) => {
    try{
        const list = request.body
        const bulkUpdate = await SpinModel.bulkWrite(list.map((spin : MonopolySpin) => ({
            updateOne: {
                filter: { _id: spin._id },
                update: { ...spin },
                upsert:  true
            }
        })))

        response.send({
            updated : bulkUpdate.modifiedCount,
            upserted : bulkUpdate.upsertedCount
        })
    }catch(e){
        response.send({error : e})
    }
})

router.post('/write-table', async (request : Request, response : Response) => {
    try{
        const list = request.body
        console.log(list)

        const time = new Date().getTime()

        const low = list.find(it => it.type === 'low')
        const mid = list.find(it => it.type === 'low')
        const high = list.find(it => it.type === 'low')

        const newTable = {
            _id : `${time}_table`,
            time : time,
            lowTierTable : low,
            midTierTable : mid,
            highTierTable : high
        }

        const insertNew = await MonopolyTableModel.create(newTable)

        response.send({
            inserted : newTable,
        })
    }catch(e){
        response.send({error : e})
    }
})

router.get('/latest-table', async (request : Request, response : Response) => {
    try {
        const latestTable = await getLatestTable()
        response.send({
            latestTable
        })
    } catch (error) {
        response.send({ error })
    }
})


router.get('/get-all', async (request : Request, response : Response) => {
    const allSpins = await SpinModel.find()
    response.send({allSpins})
})

router.get('/get-latest/:count', async (request : Request, response : Response) => {
    try {
        const { count } = request.params
        const latestSpins = await getLatestSpins(parseInt(count))
        response.send({
            latestSpins
        })
    } catch (error) {
        response.send({ error })
    }
})

router.get('/get-hour', async (request : Request, response : Response) => {
    try {
        const now = new Date().getTime()
        const timeSince = now - 1 * 60 * 60 * 1000 - 5 * 1000
        const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as MonopolySpin[]
        response.send({spinsInTimeFrame})
    } catch (error) {
        response.send({ error })
    }
})

router.get('/stats-in-the-last-hours/:hours', async (request : Request, response : Response) => {
    try {
        const { hours } = request.params
        const stats = await getStatsInTheLastHours(parseInt(hours))
        response.send({ stats })
    } catch (error) {
        response.send({ error })
    }
})

router.get('/delete-all', async (request : Request, response : Response) => {
    const deleted = await SpinModel.deleteMany({})
    const remaining = await SpinModel.find()
    response.send({deleted,remaining})
})

router.get('/data-for-the-last-hours/:hours', async (request : Request, response : Response) => {
    try {
        const { hours } = request.params
        const {tables, spinsInTimeFrame, stats} = await getInitialPageData(parseInt(hours))
        response.send({
            stats,
            tables,
            spinsInTimeFrame
        })
    } catch (error) {
        response.send({ error })
    }
})

export default router
