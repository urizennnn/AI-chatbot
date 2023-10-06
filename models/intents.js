const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
    intent: {
        type: Array,
        required: true
    }
}, {
    timestamps: true
});

module.exports=mongoose.model('Intent',intentSchema)