//
//

const healthCheck = async (request, reply) => {
    reply.send({
        success: true,
        pyd: {
            app: 'FinTrack',
            creator: 'P&U',
            version: '0.0.4',
            description: 'finance tracking application',
            node_env: process.env.NODE_ENV,
            timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' }),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        }
    })
};


module.exports = {
    healthCheck
}
