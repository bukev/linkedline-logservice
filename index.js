const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// creates logs array
let logs
const readFile = () => {
    fs.readFile('./logs.csv', 'utf-8', (err, data) => {
        logs = data.split('\r\n')
    })
}

readFile()

// calculate a nonce number, which given its value, the encrypted log will return a hash with two leading zeros
const createNonce = (hash, message) => {
    let nonce = 0
    let actualHash

    do {
        nonce++
        actualHash = crypto
            .createHash('sha256')
            .update(`${hash},${message},${nonce}`)
            .digest('hex')
        
        // console.log(actualHash)
        
    } while (!(/^00.*/.test(actualHash)));
    
    return nonce
}

// function that adds a new log to the csv file
const updateFile = async (newLog) => {

    const data = await logs.join('\r\n') + '\r\n' + newLog
    
    fs.writeFile(__dirname + '/logs.csv', data, (err, result) => {
        if (err) console.log(err)
    });

}

app.post('/', (req, res) => {
    
    readFile()

    const lastLog = logs[logs.length - 1]
    console.log(lastLog)
    const hash = crypto.createHash('sha256').update(lastLog).digest('hex');

    updateFile(`${hash},${req.body.message},${createNonce(hash, req.body.message)}`)
})

app.listen(3001, () => {
    console.log(`server listening on port 3001`);
});