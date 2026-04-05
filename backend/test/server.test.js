const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Server = require('../models/Server');
const { createServer, listServers, deleteServer } = require('../controllers/serverController');
const { expect } = chai;

describe('Server Controller Test', () => {
  // Clean up stubs after each test case
  afterEach(() => {
    sinon.restore();
  });

  // Test Case 1: Successfully Create a Server
  it('should create a new server successfully', async () => {
    // Mock request data: Simulates an incoming HTTP request with user ID and server details
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: {
        name: 'Production Server',
        host: '10.0.0.1',
        port: 22,
        sshUser: 'admin',
        authType: 'password',
        authSecret: 'secret123'
      }
    };

    // Mock server that would be created
    const createdServer = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      owner: userId
    };

    // Stub Server.create to return the createdServer
    sinon.stub(Server, 'create').resolves(createdServer);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await createServer(req, res);

    // Assertions: verify that the server was created with correct status
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  // Test Case 2: Server Creation Error
  it('should return 500 if server creation fails', async () => {
    // Stub Server.create to throw an error
    sinon.stub(Server, 'create').throws(new Error('Database connection failed'));

    // Mock request data
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        name: 'Test Server',
        host: '10.0.0.2',
        port: 22,
        sshUser: 'user',
        authType: 'password',
        authSecret: 'secret'
      }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await createServer(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  // Test Case 3: Successfully List All Servers for User
  it('should retrieve all servers for the user', async () => {
    const userId = new mongoose.Types.ObjectId();

    // Mock servers array
    const mockServers = [
      { _id: new mongoose.Types.ObjectId(), name: 'Server 1', host: '10.0.0.1', owner: userId },
      { _id: new mongoose.Types.ObjectId(), name: 'Server 2', host: '10.0.0.2', owner: userId }
    ];

    // Stub Server.find to return mockServers (with chained sort)
    const findStub = sinon.stub(Server, 'find').returns({
      sort: sinon.stub().resolves(mockServers)
    });

    // Mock request and response
    const req = { user: { _id: userId } };
    const res = {
      json: sinon.spy()
    };

    // Call function
    await listServers(req, res);

    // Assertions
    expect(res.json.called).to.be.true;
  });

  // Test Case 4: Successfully Delete a Server
  it('should delete a server successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const serverId = new mongoose.Types.ObjectId();

    // Stub Server.findOneAndDelete to resolve successfully
    sinon.stub(Server, 'findOneAndDelete').resolves({ _id: serverId });

    // Mock request and response
    const req = {
      user: { _id: userId },
      params: { id: serverId }
    };
    const res = {
      json: sinon.spy()
    };

    // Call function
    await deleteServer(req, res);

    // Assertions
    expect(res.json.called).to.be.true;
  });

  // Test Case 5: Delete Server Error - Server Not Found
  it('should return 404 if server to delete is not found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const serverId = new mongoose.Types.ObjectId();

    // Stub Server.findOneAndDelete to return null (not found)
    sinon.stub(Server, 'findOneAndDelete').resolves(null);

    // Mock request and response
    const req = {
      user: { _id: userId },
      params: { id: serverId }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteServer(req, res);

    // Assertions
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});


