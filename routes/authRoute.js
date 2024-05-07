const express = require('express');
const router = express.Router();
const { deleteaUser,
    getSingleUser,
    createUser,
    loginUserCtrl,
    getallUsers,
    updateaUser,
    handleRefreshToken,
    logoutUser
} = require('../controller/userCtrl');
const {authMiddleWare} = require('../middlewares/authMiddleWare');

router.post('/register',createUser); 
router.post('/login',loginUserCtrl);
router.get('/all-users',authMiddleWare,getallUsers);
router.get('/refresh',authMiddleWare,handleRefreshToken);
router.get('/logout',authMiddleWare,logoutUser);
router.get('/:id',authMiddleWare,getSingleUser);
//router.get('/:id',getSingleUser);
router.delete('/:id',deleteaUser);
router.put('/edit-user',authMiddleWare,updateaUser);

module.exports = router;
