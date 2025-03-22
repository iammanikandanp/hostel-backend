import express from "express"
import {  adminApproveOutPass, AdminDetails,  adminuser,  approval,  checkroom,  complaintSend,  fessPay,    fetchAllComplaint,  fetchFess,  fetchOutPassAll,  fetchstddetails,  fetchstdoutpass,  fetchStdOutPassId,  login, notification, outpassFetch, regsitration,  rooms,  sendPendingEmail,  snoFetchOutPass, stdDownloadFess, stdFeesView, stdfetchData, stdnotification, stdOtpVerify, StdReqOutPass, studentRegister, updateActiveStatus, updateById, updateByIdFees, updateByStdId, updateFees, verifyOtp } from "../controllers/stdreg.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router()

router.post('/std/adminregister', regsitration)
router.post('/std/stdregister', studentRegister)
router.post('/std/verify', verifyOtp)
router.post('/std/stdverify', stdOtpVerify)
router.post('/std/login', login)
router.post('/std/adminapproveoutpass',isAuth,adminApproveOutPass)
router.post('/std/stdreqoutpass',StdReqOutPass)
router.post('/std/stdcomplaint',complaintSend)
router.post('/std/feespayment',isAuth,fessPay)
router.get('/std/admindetail',isAuth,AdminDetails )
router.get('/std/findalloutpass',isAuth,fetchOutPassAll )
router.get('/std/findstdoutpass',fetchstdoutpass )
router.get('/std/fetch', isAuth,stdfetchData)
router.get('/std/fetchs/:sno', isAuth,snoFetchOutPass)
router.get('/std/update/:id',isAuth,  updateById)
router.get('/std/requestoutpass',isAuth, outpassFetch)
router.get('/std/fetchallcomplaint',isAuth, fetchAllComplaint)
router.get('/std/notification',notification)
router.get('/std/fetchFess',isAuth,fetchFess)
router.get('/std/fetchingstudent',fetchstddetails)
router.get('/std/fetchingstdoutpass/:id',fetchStdOutPassId)
router.get('/std/fetchoneFess/:id',isAuth,updateFees)
router.get('/std/userdetails',adminuser)
router.get('/std/stdfeesfetching',stdFeesView)
router.get('/std/room',rooms)
router.get('/std/check-room/:roomNo',checkroom)
router.get('/std/stdnoti/:id',stdnotification)
router.get('/std/stddownloadfees/:id',stdDownloadFess)
router.get('/std/pendingsendmail',isAuth,sendPendingEmail)
router.put('/std/update/:id',isAuth,  updateByStdId)
router.put('/std/demoapproval/:id',isAuth,  approval)
router.put('/std/updatefeespayment/:id',isAuth,updateByIdFees)
router.put('/std/updateStatus/:id',isAuth,updateActiveStatus)

export default router;