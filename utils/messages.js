const moment = require('moment');

const formatMessage = (username, text) => {
    return {
        username, 
        text,
        time: moment().format("MMM D, YYYY, h:mm a")
    }
};

module.exports = formatMessage;