'use strict';

var should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Campaign = mongoose.model('Campaign'),
    express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
    agent,
    credentials,
    user,
    campaign,
    campaign2;

/**
 * Campaign routes tests
 */
describe('Campaign CRUD tests', function() {

    before(function(done) {
        // Get application
        app = express.init(mongoose);
        agent = request.agent(app);

        done();
    });

    beforeEach(function(done) {
        // Create user credentials
        credentials = {
            username: 'username',
            password: 'M3@n.jsI$Aw3$0m3'
        };

        // Create a new user
        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
            provider: 'local'
        });

        // Save a user to the test db and create new Campaign
        user.save(function() {
            campaign = {
                name: 'Campaign name',
                startdate: '2017-04-20',
                enddate: '2017-04-22',
                usercount: 0,
                listusercampaign: [{
                    identification: 1180200059502,
                    user: user,
                    acceptcampaigndate: '2017-04-28'
                },
                {
                    identification: 1180200059503,
                    user: user,
                    acceptcampaigndate: '2017-04-28'
                }],
            };

            campaign2 = {
                name: 'Campaign name',
                startdate: '2017-04-20',
                enddate: '2017-04-22',
                usercount: 0,
                listusercampaign: [{
                    identification: 1180200059502,
                    user: user,
                    acceptcampaigndate: '2017-04-28'
                }, {
                    identification: 1180200059503,
                    user: user,
                    acceptcampaigndate: '2017-04-28'
                }],
            };

            done();
        });
    });

    it('should be able to save a Campaign if logged in', function(done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(200)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Handle Campaign save error
                        if (campaignSaveErr) {
                            return done(campaignSaveErr);
                        }

                        // Get a list of Campaigns
                        agent.get('/api/campaigns')
                            .end(function(campaignsGetErr, campaignsGetRes) {
                                // Handle Campaigns save error
                                if (campaignsGetErr) {
                                    return done(campaignsGetErr);
                                }

                                // Get Campaigns list
                                var campaigns = campaignsGetRes.body;

                                // Set assertions
                                (campaigns[0].user._id).should.equal(userId);
                                (campaigns[0].name).should.match('Campaign name');

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should not be able to save an Campaign if not logged in', function(done) {
        agent.post('/api/campaigns')
            .send(campaign)
            .expect(403)
            .end(function(campaignSaveErr, campaignSaveRes) {
                // Call the assertion callback
                done(campaignSaveErr);
            });
    });

    it('should not be able to save an Campaign if no name is provided', function(done) {
        // Invalidate name field
        campaign.name = '';

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(400)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Set message assertion
                        (campaignSaveRes.body.message).should.match('Please fill Campaign name');

                        // Handle Campaign save error
                        done(campaignSaveErr);
                    });
            });
    });

    it('should be able to update an Campaign if signed in', function(done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(200)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Handle Campaign save error
                        if (campaignSaveErr) {
                            return done(campaignSaveErr);
                        }

                        // Update Campaign name
                        campaign.name = 'WHY YOU GOTTA BE SO MEAN?';

                        // Update an existing Campaign
                        agent.put('/api/campaigns/' + campaignSaveRes.body._id)
                            .send(campaign)
                            .expect(200)
                            .end(function(campaignUpdateErr, campaignUpdateRes) {
                                // Handle Campaign update error
                                if (campaignUpdateErr) {
                                    return done(campaignUpdateErr);
                                }

                                // Set assertions
                                (campaignUpdateRes.body._id).should.equal(campaignSaveRes.body._id);
                                (campaignUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');


                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should be able to get a list of Campaigns if not signed in', function(done) {
        // Create new Campaign model instance
        var campaignObj = new Campaign(campaign);

        // Save the campaign
        campaignObj.save(function() {
            // Request Campaigns
            request(app).get('/api/campaigns')
                .end(function(req, res) {
                    // Set assertion
                    res.body.should.be.instanceof(Array).and.have.lengthOf(1);

                    // Call the assertion callback
                    done();
                });

        });
    });

    it('should be able to get a single Campaign if not signed in', function(done) {
        // Create new Campaign model instance
        var campaignObj = new Campaign(campaign);

        // Save the Campaign
        campaignObj.save(function() {
            request(app).get('/api/campaigns/' + campaignObj._id)
                .end(function(req, res) {
                    // Set assertion
                    res.body.should.be.instanceof(Object).and.have.property('name', campaign.name);

                    // Call the assertion callback
                    done();
                });
        });
    });

    it('should return proper error for single Campaign with an invalid Id, if not signed in', function(done) {
        // test is not a valid mongoose Id
        request(app).get('/api/campaigns/test')
            .end(function(req, res) {
                // Set assertion
                res.body.should.be.instanceof(Object).and.have.property('message', 'Campaign is invalid');

                // Call the assertion callback
                done();
            });
    });

    it('should return proper error for single Campaign which doesnt exist, if not signed in', function(done) {
        // This is a valid mongoose Id but a non-existent Campaign
        request(app).get('/api/campaigns/559e9cd815f80b4c256a8f41')
            .end(function(req, res) {
                // Set assertion
                res.body.should.be.instanceof(Object).and.have.property('message', 'No Campaign with that identifier has been found');

                // Call the assertion callback
                done();
            });
    });

    it('should be able to delete an Campaign if signed in', function(done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(200)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Handle Campaign save error
                        if (campaignSaveErr) {
                            return done(campaignSaveErr);
                        }

                        // Delete an existing Campaign
                        agent.delete('/api/campaigns/' + campaignSaveRes.body._id)
                            .send(campaign)
                            .expect(200)
                            .end(function(campaignDeleteErr, campaignDeleteRes) {
                                // Handle campaign error error
                                if (campaignDeleteErr) {
                                    return done(campaignDeleteErr);
                                }

                                // Set assertions
                                (campaignDeleteRes.body._id).should.equal(campaignSaveRes.body._id);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should not be able to delete an Campaign if not signed in', function(done) {
        // Set Campaign user
        campaign.user = user;

        // Create new Campaign model instance
        var campaignObj = new Campaign(campaign);

        // Save the Campaign
        campaignObj.save(function() {
            // Try deleting Campaign
            request(app).delete('/api/campaigns/' + campaignObj._id)
                .expect(403)
                .end(function(campaignDeleteErr, campaignDeleteRes) {
                    // Set message assertion
                    (campaignDeleteRes.body.message).should.match('User is not authorized');

                    // Handle Campaign error error
                    done(campaignDeleteErr);
                });

        });
    });

    it('should be able to get a single Campaign that has an orphaned user reference', function(done) {
        // Create orphan user creds
        var _creds = {
            username: 'orphan',
            password: 'M3@n.jsI$Aw3$0m3'
        };

        // Create orphan user
        var _orphan = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'orphan@test.com',
            username: _creds.username,
            password: _creds.password,
            provider: 'local'
        });

        _orphan.save(function(err, orphan) {
            // Handle save error
            if (err) {
                return done(err);
            }

            agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function(signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) {
                        return done(signinErr);
                    }

                    // Get the userId
                    var orphanId = orphan._id;

                    // Save a new Campaign
                    agent.post('/api/campaigns')
                        .send(campaign)
                        .expect(200)
                        .end(function(campaignSaveErr, campaignSaveRes) {
                            // Handle Campaign save error
                            if (campaignSaveErr) {
                                return done(campaignSaveErr);
                            }

                            // Set assertions on new Campaign
                            (campaignSaveRes.body.name).should.equal(campaign.name);
                            should.exist(campaignSaveRes.body.user);
                            should.equal(campaignSaveRes.body.user._id, orphanId);

                            // force the Campaign to have an orphaned user reference
                            orphan.remove(function() {
                                // now signin with valid user
                                agent.post('/api/auth/signin')
                                    .send(credentials)
                                    .expect(200)
                                    .end(function(err, res) {
                                        // Handle signin error
                                        if (err) {
                                            return done(err);
                                        }

                                        // Get the Campaign
                                        agent.get('/api/campaigns/' + campaignSaveRes.body._id)
                                            .expect(200)
                                            .end(function(campaignInfoErr, campaignInfoRes) {
                                                // Handle Campaign error
                                                if (campaignInfoErr) {
                                                    return done(campaignInfoErr);
                                                }

                                                // Set assertions
                                                (campaignInfoRes.body._id).should.equal(campaignSaveRes.body._id);
                                                (campaignInfoRes.body.name).should.equal(campaign.name);
                                                should.equal(campaignInfoRes.body.user, undefined);

                                                // Call the assertion callback
                                                done();
                                            });
                                    });
                            });
                        });
                });
        });
    });

    it('should not be able to save an Campaign if no startdate is provided', function(done) {
        // Invalidate name field
        campaign.startdate = '';

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(400)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Set message assertion
                        (campaignSaveRes.body.message).should.match('Please fill Campaign startdate');

                        // Handle Campaign save error
                        done(campaignSaveErr);
                    });
            });
    });

    it('should not be able to save an Campaign if no enddate is provided', function(done) {
        // Invalidate name field
        campaign.enddate = '';

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(400)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Set message assertion
                        (campaignSaveRes.body.message).should.match('Please fill Campaign enddate');

                        // Handle Campaign save error
                        done(campaignSaveErr);
                    });
            });
    });

    it('should not be able to save an Campaign if no usercount is provided', function(done) {
        // Invalidate name field
        campaign.usercount = null;

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(400)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Set message assertion
                        (campaignSaveRes.body.message).should.match('Please fill Campaign usercount');

                        // Handle Campaign save error
                        done(campaignSaveErr);
                    });
            });
    });

    // it('should not be able to save an Campaign if no usercount is identification', function (done) {
    //   // Invalidate name field
    //   campaign.listusercampaign[0].identification = null;

    //   agent.post('/api/auth/signin')
    //     .send(credentials)
    //     .expect(200)
    //     .end(function (signinErr, signinRes) {
    //       // Handle signin error
    //       if (signinErr) {
    //         return done(signinErr);
    //       }

    //       // Get the userId
    //       var userId = user.id;

    //       // Save a new Campaign
    //       agent.post('/api/campaigns')
    //         .send(campaign)
    //         .expect(400)
    //         .end(function (campaignSaveErr, campaignSaveRes) {
    //           // Set message assertion
    //           (campaignSaveRes.body.message).should.match('Please fill Campaign identification');

    //           // Handle Campaign save error
    //           done(campaignSaveErr);
    //         });
    //     });
    // });

    // it('should not be able to save an Campaign if no usercount is acceptcampaigndate', function (done) {
    //   // Invalidate name field
    //   campaign.listusercampaign[0].acceptcampaigndate = '';

    //   agent.post('/api/auth/signin')
    //     .send(credentials)
    //     .expect(200)
    //     .end(function (signinErr, signinRes) {
    //       // Handle signin error
    //       if (signinErr) {
    //         return done(signinErr);
    //       }

    //       // Get the userId
    //       var userId = user.id;

    //       // Save a new Campaign
    //       agent.post('/api/campaigns')
    //         .send(campaign)
    //         .expect(400)
    //         .end(function (campaignSaveErr, campaignSaveRes) {
    //           // Set message assertion
    //           (campaignSaveRes.body.message).should.match('Please fill Campaign acceptcampaigndate');

    //           // Handle Campaign save error
    //           done(campaignSaveErr);
    //         });
    //     });
    // });

    it('should not be able to save an campaign if name is duplicated', function(done) {

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(200)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Handle campaign save error
                        if (campaignSaveErr) {
                            return done(campaignSaveErr);
                        }
                        // Save a new campaign
                        agent.post('/api/campaigns')
                            .send(campaign)
                            .expect(400)
                            .end(function(campaignSaveErr, campaignSaveRes) {
                                // Set message assertion
                                //(campaignSaveRes.body.message).should.match('11000 duplicate key error collection: mean-test.campaigns index: docno already exists');
                                (campaignSaveRes.body.message.toLowerCase()).should.containEql('name already exists');

                                // Handle campaign save error
                                done(campaignSaveErr);
                            });

                    });

            });
    });

    it('should be able to update an data', function(done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Campaign
                agent.post('/api/campaigns')
                    .send(campaign)
                    .expect(200)
                    .end(function(campaignSaveErr, campaignSaveRes) {
                        // Handle Campaign save error
                        if (campaignSaveErr) {
                            return done(campaignSaveErr);
                        }

                        // Update Campaign name\
                        campaign.listusercampaign[0].identification = 123789;                        
                        campaign.listusercampaign[1].identification = 123789;

                        // Update an existing Campaign
                        agent.put('/api/campaigns/' + campaignSaveRes.body._id)
                            .send(campaign)
                            .expect(200)
                            .end(function(campaignUpdateErr, campaignUpdateRes) {
                                // Handle Campaign update error
                                if (campaignUpdateErr) {
                                    return done(campaignUpdateErr);
                                }

                                // Set assertions
                                (campaignUpdateRes.body._id).should.equal(campaignSaveRes.body._id);
                                (campaignUpdateRes.body.listusercampaign[0].identification).should.match(123789);
                                (campaignUpdateRes.body.listusercampaign[1].identification).should.match(123789);
                                


                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    afterEach(function(done) {
        User.remove().exec(function() {
            Campaign.remove().exec(done);
        });
    });
});