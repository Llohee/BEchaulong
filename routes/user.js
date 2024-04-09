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
userRouter.patch('/:email', authorizationCheck, async (req, res) => {
    const { role, song } = req.body
    const email = req.params.email
    // Tim xem co user khong findOne
    const user = await userModel.findOne({ email })
    // Neu co thi xoa
    if (user) {
        // Update role cho user nay updateOne
        // await userModel.updateOne({email}, {role})
        // const user = await userModel.findOne({email})
        // const user = await userModel.findOneAndUpdate({email}, {role}, {new: true})
        const user = await userModel.findOneAndUpdate({ email }, { $push: { songs: song } }, { new: true })
        // Gui lai user duoc update cho client
        res.send(user)
    } else {
        res.send('Khong co user')
    }
})

userRouter.post('/create', authorizationCheck, async () => {

})

userRouter.delete('/:email', authorizationCheck, async (req, res) => {
    // Lay email tu params
    const email = req.params.email
    // Check xem email co phai cua user hien tai khong?
    const currentUser = req.user
    if (currentUser.email === email) {
        res.status(400).send('Khong the xoa user nay')
        return
    }
    // Tim xem user co trong db khong?? userModel.findOne({email})
    const user = await userModel.findOne({ email })
    // Neu co thi xoa
    if (user) {
        await userModel.deleteOne({ email })
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