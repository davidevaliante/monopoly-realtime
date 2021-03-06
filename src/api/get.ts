import { MonopolySpin, SpinModel } from '../mongoose-models/monopoly/Spin'
import { CrazyTimeStats, SymbolStats } from '../mongoose-models/monopoly/Stats'
import { MonopolySymbol } from '../mongoose-models/monopoly/Symbols'
import { MonopolyTableModel } from '../mongoose-models/Tables'

export const getLatestSpins = async (count : number) => {
    const allSpins = await SpinModel.find().limit(count).sort({'timeOfSpin' : -1})
    return allSpins
}

export const getLatestTable = async () => {
    const table = await MonopolyTableModel.find().limit(1).sort({'time' : -1})
    return table
}

export const getStatsInTheLastHours = async (hoursToCheck : number) => {

    const now = new Date().getTime()

    const timeSince = now - hoursToCheck * 60 * 60 * 1000 - 5 * 1000

    // const queryStart = new Date().getTime()

    // const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as Spin[]

    const spinsInTimeFrame = await SpinModel.find({timeOfSpin:{$gte:timeSince}}, 'spinResultSymbol').sort({'timeOfSpin' : -1}) as MonopolySpin[]


    // const queryEnd = new Date().getTime()

    const totalSpins = spinsInTimeFrame.length

    // console.log(`Query took ${queryEnd - queryStart} to execute for ${totalSpins}`)

    
    const stats = new CrazyTimeStats(
        timeSince,
        totalSpins,
        Object.values(MonopolySymbol).filter(it => typeof(it) !== 'number').map((symbol : MonopolySymbol) => {

            const timeSince = spinsInTimeFrame.map(s => s.spinResultSymbol).indexOf(symbol.toString())
            
            return new SymbolStats(
                symbol,
                spinsInTimeFrame.filter(it => it.spinResultSymbol === symbol.toString()).length * 100 / totalSpins,
                timeSince != -1 ? timeSince : totalSpins,
                spinsInTimeFrame.filter(it => it.spinResultSymbol === symbol.toString()).length
            )
        })
    )

    return stats
}

export const getInitialPageData = async (hoursToCheck : number) => {

    const now = new Date().getTime()

    const timeSince = now - hoursToCheck * 60 * 60 * 1000 - 5 * 1000

    // const queryStart = new Date().getTime()

    // const spinsInTimeFrame = await SpinModel.where('timeOfSpin').gte(timeSince).sort({'timeOfSpin' : -1}) as Spin[]

    const spinsInTimeFrame = await SpinModel.find({timeOfSpin:{$gte:timeSince}}, ).sort({'timeOfSpin' : -1}) as MonopolySpin[]

    const tables = await MonopolyTableModel.find().limit(1).sort({'time' : -1})

    const stats = await getStatsInTheLastHours(hoursToCheck)

    // const queryEnd = new Date().getTime()

    // const totalSpins = spinsInTimeFrame.length

    // console.log(`Query took ${queryEnd - queryStart} to execute for ${totalSpins}`)

    return {
        stats,
        tables,
        spinsInTimeFrame
    }
}