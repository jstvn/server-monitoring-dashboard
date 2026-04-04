const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    host: { type: String, required: true, trim: true },
    port: { type: Number, default: 22, min: 1, max: 65535 },
    sshUser: { type: String, required: true, trim: true },
    authType: { type: String, enum: ['password', 'key'], required: true },
    authSecret: { type: String, required: true, trim: true },
    keyName: { type: String, trim: true, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Server', serverSchema);

