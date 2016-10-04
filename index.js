var request = require("request");
var fs = require("fs");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    MotionDetected = homebridge.hap.Characteristic.MotionDetected;

    homebridge.registerAccessory("homebridge-homeds-http-motionsensor", "HomeDSHttpMotionSensor", HomeDSAccessory);
}

function HomeDSAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.stateUrl = config["stateUrl"];
    this.poolingInterval = config["poolingInterval"];

    this.motionsensor = new Service.MotionSensor(this.name);

    this.motionsensor
        .getCharacteristic(MotionDetected)
        .on('get', this.getState.bind(this));

    this.MotionDetected = this.motionsensor.getCharacteristic(MotionDetected);

    this.init();

}

HomeDSAccessory.prototype = {

    init: function() {
        setTimeout(this.monitorState.bind(this), 5000);
    },
    monitorState: function() {

        this.log("monitor state");

        request.get({
            url: this.stateUrl
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {

                var state = JSON.parse(body);
                this.MotionDetected.setValue(state.state);

            } else {
                this.log("Server error");
            }
        }.bind(this));

        setTimeout(this.monitorState.bind(this), this.poolingInterval);

    },
    getState: function(callback) {

        this.log("Getting current state...");

        request.get({
            url: this.stateUrl
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {

                var state = JSON.parse(body);
                callback(null, state.state);

            } else {
                this.log("Error server get state", err);
                callback(null);
            }
        }.bind(this));

    }

}

HomeDSAccessory.prototype.getServices = function() {
    return [this.motionsensor];
}
