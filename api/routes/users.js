const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users');

router.post('/signup', UserController.register_user);
router.post('/signin', UserController.user_login);
router.get('/', UserController.get_all_users);
router.get('/:userId', UserController.get_user_by_id);
router.patch('/:userId', UserController.update_user);
router.delete('/:userId', UserController.remove_user);
router.patch('/password-reset/:userId', UserController.change_user_password);

module.exports = router;