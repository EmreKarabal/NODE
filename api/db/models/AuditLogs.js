const mongoose = require('mongoose');

const schema = mongoose.Schema({
    level: String,
    email: {type: String, required: false},
    location: String,
    proc_type: String,
    log: mongoose.SchemaTypes.Mixed
} , {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})


class AuditLogs extends mongoose.Model {


}

schema.loadClass(AuditLogs);
module.exports =  mongoose.model("audit_logs", schema);