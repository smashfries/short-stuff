const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String,
    userId: String,
    clicks: Number,
});
  
const UrlModel = mongoose.model('Url', urlSchema);

module.exports = {
    UrlModel
}