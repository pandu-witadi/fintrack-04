const { User, Project, Budget, Actual, Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const summary = async (request, reply) => {
    try {
        // Count projects
        const userCount = await User.countDocuments({})
        
        // Count projects
        const projectCount = await Project.countDocuments({})
        
        // Count events (Evn)
        // const eventCount = await Evn.countDocuments({})
        
        // Count transactions (Trx)
        // const transactionCount = await Trx.countDocuments({})


        return {
            success: true,
            pyd: {
                users: userCount,
                projects: projectCount,
                // events: eventCount,
                // transactions: transactionCount
            }
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch dashboard summary', 500)
    }
}

module.exports = summary
