const express = require('express')
const jwt = require('jsonwebtoken')
const {  userModel } = require('../models/user')
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })

const userRouter = express.Router()

const authorizationCheck = (req, res, next) => {
    const userRoles = req.users.role
    console.log(userRoles)
    // Check xem user nay co quyen lay toan bo user khong (Authorization) == check role
    if (userRoles.includes('admin')) {
        next()
    } else {
        res.send('User khong co quyen')
    }

}

userRouter.get('/', authorizationCheck, async (req, res) => {
    try {
        const users = await userModel.find({})
        res.send(users)
    } catch (error) {
        res.send('Error')
        console.log(error)
    }

})

userRouter.get('/me', (req, res) => {
    res.send(req.user)
})


userRouter.get('/', authorizationCheck, async (req, res) => {
    const users = await userModel.find({})
    const user = req.user
})

// Update role cua user
userRouter.patch('/:username', authorizationCheck, async (req, res) => {
    const { role, song } = req.body
    const username = req.params.username
    // Tim xem co user khong findOne
    const user = await userModel.findOne({ username })
    // Neu co thi xoa
    if (user) {
        // Update role cho user nay updateOne
        // await userModel.updateOne({username}, {role})
        // const user = await userModel.findOne({username})
        // const user = await userModel.findOneAndUpdate({username}, {role}, {new: true})
        const user = await userModel.findOneAndUpdate({ username }, { $push: { songs: song } }, { new: true })
        // Gui lai user duoc update cho client
        res.send(user)
    } else {
        res.send('Khong co user')
    }
})

userRouter.post('/create', authorizationCheck, async () => {

})

userRouter.delete('/:username', authorizationCheck, async (req, res) => {
    // Lay username tu params
    const username = req.params.username
    // Check xem username co phai cua user hien tai khong?
    const currentUser = req.user
    if (currentUser.username === username) {
        res.status(400).send('Khong the xoa user nay')
        return
    }
    // Tim xem user co trong db khong?? userModel.findOne({username})
    const user = await userModel.findOne({ username })
    // Neu co thi xoa
    if (user) {
        await userModel.deleteOne({ username })
        res.send('Da xoa,')
    } else {
        res.send('Khong co user')
    }
})

userRouter.post('/profile', upload.any('avatar'), (req, res) => {
    console.log(req.file)
    res.send('ok')
})

module.exports = { userRouter }