import mongoose from 'mongoose'

const loginSessionsSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    lastActivityTime: {
        type: Date,
        default: Date.now
    }
}, {collection: 'loginSessions'})

mongoose.model('loginSessions', loginSessionsSchema)
