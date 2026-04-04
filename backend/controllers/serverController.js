const Server = require('../models/Server');

const isValidHost = (value) => {
  if (!value || typeof value !== 'string') return false;
  const host = value.trim();
  if (!host || host.length > 253) return false;
  return /^[a-zA-Z0-9.-]+$/.test(host);
};

const normalizePayload = (body) => ({
  name: body.name?.trim(),
  host: body.host?.trim(),
  port: Number(body.port || 22),
  sshUser: body.sshUser?.trim(),
  authType: body.authType,
  authSecret: body.authSecret?.trim(),
  keyName: body.keyName?.trim() || '',
});

const validatePayload = (payload) => {
  if (!payload.name) return 'Server name is required';
  if (!payload.host) return 'Host is required';
  if (!isValidHost(payload.host)) return 'Host format is invalid';
  if (!payload.sshUser) return 'SSH username is required';
  if (!['password', 'key'].includes(payload.authType)) return 'Auth type is invalid';
  if (!payload.authSecret) return 'Auth secret is required';
  if (!Number.isInteger(payload.port) || payload.port < 1 || payload.port > 65535) return 'Port must be between 1 and 65535';
  return null;
};

const listServers = async (req, res) => {
  try {
    const servers = await Server.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServer = async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.id, owner: req.user._id });
    if (!server) return res.status(404).json({ message: 'Server not found' });
    res.json(server);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createServer = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const server = await Server.create({ ...payload, owner: req.user._id });
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateServer = async (req, res) => {
  try {
    const existingServer = await Server.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existingServer) return res.status(404).json({ message: 'Server not found' });

    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    Object.assign(existingServer, payload);
    const updatedServer = await existingServer.save();
    res.json(updatedServer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listServers, getServer, createServer, updateServer };

