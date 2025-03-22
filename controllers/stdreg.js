import { admin } from "../models/admin.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import sendMail from "../middleware/sendmail.js"
import { stdreg } from "../models/stdreg.js"
import { outpass } from "../models/outpass.js"
import { complaint } from "../models/complaint.js"
import { feespayments } from "../models/fees.js"
// new registration
export const regsitration = async (req, res) => {
    try {
        const { name, email, password } = req.body

        let std = await admin.findOne({ email })
        if (std) {
            return res.status(400).json({
                message: "std already registered"
            })
        }
        //password change

        const hashPassword = await bcrypt.hash(password, 10)

        const otp = Math.floor(Math.random() * 1000000)

        std = { name, email, hashPassword }

        const activationToken = jwt.sign({ std, otp }, process.env.ACTIVATION_SECRET, {
            expiresIn: "5m"
        })

        const message = `Please verify your otp for Register ${otp}`
        await sendMail(email, "otp for Admin Registration!", message)

        return res.status(200).json({
            message: "otp send successfully",
            activationToken,

        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}
export const studentRegister = async (req, res) => {
    try {
        const { sno,
            roomno,
            rollno,
            name,
            Class,
            department,
            email,
            password,
            address,
            city,
            phone,
            parentphno,
            dob,
            year } = req.body


        let std = await stdreg.findOne({ email })

        if (std) {
            return res.status(400).json({
                message: "student already registered",
            })
        }

        //password change

        const hashPassword = await bcrypt.hash(password, 10)

        const otp = Math.floor(Math.random() * 1000000)

        std = {
            name,
            roomno,
            rollno,
            email,
            Class,
            department,
            sno,
            address,
            city,
            phone,
            parentphno,
            dob,
            year,
            hashPassword,
        }

        const activationToken = jwt.sign({ std, otp }, process.env.ACTIVATION_SECRET, {
            expiresIn: "5m"
        })

        const message = `Please verify your otp for Register ${otp}`
        await sendMail(email, "This otp for Student Registration!", message)

        return res.status(200).json({
            message: "Otp is Send Your email!..",
            activationToken,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

//opt verify
export const verifyOtp = async (req, res) => {
    try {
        const { otp, activationToken } = req.body
        const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET)
        if (!verify) {
            return res.status(500).json({
                message: "Otp expried"
            })
        }

        if (verify.otp != otp) {
            return res.status(500).json({
                message: "Otp wrong"
            })
        }
        await admin.create({
            name: verify.std.name,
            password: verify.std.hashPassword,
            email: verify.std.email
        })
        return res.status(200).json({
            message: "Registration successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

export const stdOtpVerify = async (req, res) => {
    try {
        const { otp, activationToken } = req.body
        
        const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET)
        
        if (!verify) {
            return res.status(500).json({
                message: "Otp expried"
            })
        }

        if (verify.otp != otp) {
            return res.status(500).json({
                message: "Otp wrong"
            })
        }
        await stdreg.create({
            name: verify.std.name,
            pass: verify.std.hashPassword,
            email: verify.std.email,
            sno: verify.std.sno,
            roomno: verify.std.roomno,
            rollno: verify.std.rollno,
            class: verify.std.Class,
            dept: verify.std.department,
            address: verify.std.address,
            city: verify.std.city,
            phno: verify.std.phone,
            parentphno: verify.std.parentphno,
            dob: verify.std.dob,
            year: verify.std.year,
        })
        return res.status(200).json({
            message: "Registration successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

//login from 
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }


        let user = await admin.findOne({ email });


        if (!user) {
            user = await stdreg.findOne({ email });
            if (user) {
                user.password = user.pass;
            }
        }


        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });


        const { password: _, ...userDetails } = user.toObject();

        return res.status(200).json({
            message: `Welcome ${user.name} !.`,
            token,
            user: userDetails,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const AdminDetails = async (req, res) => {
    try {
        const std = await admin.findById(req.std._id).select("-password")
        return res.status(200).json({
            std,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

export const stdfetchData = async (req, res) => {
    try {
        const { search, status } = req.query
        let filter = {};
        if (status && status !== "all") {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { roomno: { $regex: search, $options: "i" } },
                { sno: { $regex: search, $options: "i" } },
                { rollno: { $regex: search, $options: "i" } },
            ]

        }
        const fetch = await stdreg.find(filter).select("-pass")
        return res.status(200).json({
            message: "Std Fetch data",
            data: fetch
        })
    } catch (error) {
        return res.status(200).json({
            message: "No fetch data"
        })
    }
}

export const updateById = async (req, res) => {
    try {

        const fetchdataById = await stdreg.findById(req.params.id).select("-pass")
        return res.status(200).json({
            message: "fetched data",
            data: fetchdataById
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

export const updateByStdId = async (req, res) => {
    try {
        const fetchUpdateId = await stdreg.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!fetchUpdateId) {
            return res.status(404).json({
                message: "Student Data Not Found"
            })
        }
        return res.status(200).json({
            message: "Student Data Update Successfully!...",
            data: fetchUpdateId
        })
    } catch (error) {
        return res.status(500).json({ message: "Error updating student", error: err });
    }
}

export const snoFetchOutPass = async (req, res) => {
    try {
        const fetchSno = await stdreg.findOne({ sno: req.params.sno }).select("-pass")
        if (!fetchSno) {
            return res.status(404).json({
                message: "Student Data Not Found"
            })
        }
        return res.status(200).json({
            message: "studen Sno Fetch Data",
            data: fetchSno,
        })
    } catch (error) {
        return res.status(500).json({ message: "Error Fetching student", error: error });
    }
}

export const adminApproveOutPass = async (req, res) => {
    try {
        const { sno, roomno, email, name, timeout, outtimeap, timein, intimeap, date, phno, parentphno, detail } = req.body
        if (sno && roomno && email && name && timeout && timein && date && phno && parentphno && detail && outtimeap && intimeap) {
            const request = new outpass({
                sno: sno,
                roomno: roomno,
                name: name,
                email: email,
                phno: phno,
                parentphno: parentphno,
                outtime: timeout,
                outtimeap: outtimeap,
                intime: timein,
                intimeap: intimeap,
                date: date,
                reason: detail,
                status: "Approved",
            })

            const datasave = await request.save();
            if (!datasave) {
                return res.status(500).json({
                    message: "Failed to send the outpass request. Please try again."
                });
            }
            const message = `Dear ${name},

We are pleased to inform you that your outpass request has been approved. Below are the details of your outpass:

Outpass Details:
Student Name: ${name}
Room No: ${roomno}
Phone Number: ${phno}
Parent’s Phone: ${parentphno}
Date: ${date}
Out Time: ${timeout} ${outtimeap}
In Time: ${timein} ${intimeap}
Reason: ${detail}
Status: ✅ Approved
Please ensure that you adhere to the hostel rules and return on time. If you have any questions, feel free to contact the hostel administration.

Safe travels!

Best regards,
Hostel Management
Erode Arts and Science College.`
            await sendMail(email, "Outpass Approved!", message)

            return res.status(200).json({
                message: "Outpass is Approved Successfully!..."
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "OutPass is Not Register", error: error });

    }
}

export const StdReqOutPass = async (req, res) => {
    try {
        const { sno, roomno, name, email, timeout, outtimeap, timein, intimeap, date, phno, parentphno, detail } = req.body
        if (sno && roomno && email && name && timeout && timein && date && phno && parentphno && detail && outtimeap && intimeap) {
            const request = new outpass({
                sno: sno,
                roomno: roomno,
                name: name,
                phno: phno,
                email: email,
                parentphno: parentphno,
                outtime: timeout,
                outtimeap: outtimeap,
                intime: timein,
                intimeap: intimeap,
                date: date,
                reason: detail,
            })

            const datasave = await request.save();
            if (!datasave) {
                return res.status(500).json({
                    message: "Failed to send the outpass request. Please try again."
                });
            }

            return res.status(200).json({
                message: "Outpass request submitted. Please wait for approval or further updates!..."
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "OutPass is Not Register", error: error });

    }
}

export const outpassFetch = async (req, res) => {
    try {
        const fetchOutpass = await outpass.find({ status: 'Request' })
        return res.status(200).json({
            message: "Outpass Request List",
            data: fetchOutpass,
        })
    } catch (error) {
        return res.status(500).json({ message: "Error Fetching student", error: error });
    }
}

export const approval = async (req, res) => {
    try {
        const fetchUpdateId = await outpass.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!fetchUpdateId) {
            return res.status(404).json({
                message: "Outpass not Found"
            })
        }
        const approved = await outpass.findById(req.params.id)
        if (approved.status == "Approved") {
            const message = `Dear ${approved.name},

            We are pleased to inform you that your outpass request has been approved. Below are the details of your outpass:
            
            Outpass Details:
            Student Name: ${approved.name}
            Room No: ${approved.roomno}
            Phone Number: ${approved.phno}
            Parent’s Phone: ${approved.parentphno}
            Date: ${approved.date}
            Out Time: ${approved.outtime} ${approved.outtimeap}
            In Time: ${approved.intime} ${approved.intimeap}
            Reason: ${approved.reason}
            Status: ✅ ${approved.status}
            Please ensure that you adhere to the hostel rules and return on time. If you have any questions, feel free to contact the hostel administration.
            
            Safe travels!
            
            Best regards,
            Hostel Management
            Erode Arts and Science College.`
            await sendMail(approved.email, "Outpass Approved!", message)
            return res.status(200).json({
                message: "Student Outpass is Approved!...",
                data: fetchUpdateId
            })
        } else if (approved.status == "Decline") {
            return res.status(200).json({
                message: "Student Outpass is Decline!...",
                data: fetchUpdateId
            })
        } else {
            return res.status(400).json({
                message: "Student Outpass Not Found",
                data: fetchUpdateId
            })
        }

    } catch (error) {
        return res.status(500).json({ message: "Error updating student", error: err });
    }
}


export const fetchOutPassAll = async (req, res) => {
    try {
        const { status, search } = req.query;

        let filter = {};
        if (status && status !== "all") {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { sno: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { roomno: { $regex: search, $options: "i" } },
            ]
        }

        const findAllOutPass = await outpass.find(filter).sort({ date: -1 });
        const outPassNotify = await outpass.countDocuments({ status: "Request" })
        res.status(200).json({
            message: "Outpass data fetched successfully!",
            data: {
                findAllOutPass: findAllOutPass,
                outPassNotify: outPassNotify,
            }

        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching Outpass data.",
            error: error.message,
        });
    }

}


export const complaintSend = async (req, res) => {
    try {
        const { sno, date, roomno, name, subject, detail } = req.body
        console.log(sno, date, roomno, name, subject, detail)
        if (sno && date && roomno && name && subject && detail) {
            const tempComplaint = new complaint({
                sno,
                date,
                name,
                subject,
                roomno,
                issuse: detail,
            })
            const datasave = await tempComplaint.save();
            if (!datasave) {
                return res.status(500).json({
                    message: "Failed to send the Your Complaint. Please try again."
                });
            }

            return res.status(200).json({
                message: "Your Complaint is send Successfully!..."
            });
        }
    } catch (error) {
        return res.status(500).json({ message: "Technical Error", error: error });
    }
}

export const fetchAllComplaint = async (req, res) => {
    try {
        const fetchAllComplaint = await complaint.find({}).sort({ date: -1 })
        return res.status(200).json({
            message: "Fetch All Complaints",
            data: fetchAllComplaint,
        })
    } catch (error) {
        return res.status(500).json({ message: "Fetch All Complaints", error: err });

    }
}

export const notification = async (req, res) => {
    try {
        const outPassNotify = await outpass.countDocuments({ status: "Request" })
        const complaintNotify = await complaint.countDocuments()
        const feespending = await feespayments.countDocuments({ status: "pending" })
        const roomActive = await stdreg.countDocuments({status:"Active"})
        const roomAvailable = 68 - roomActive
        
        return res.status(200).json({
            message: "Notifications",
            data: {
                outPassNotify: outPassNotify,
                complaintNotify: complaintNotify,
                fesspending: feespending,
                roomActive:roomActive, 
                roomAvailable:roomAvailable,
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Notification", error: error });

    }
}

export const fessPay = async (req, res) => {
    try {
        const { student, balance } = req.body
       
        
        if (balance < 0) {
            return res.status(400).json({
                message: "Entered fees exceed the total amount. Please check and correct."
            })
        }
        const status = balance == 0 ? "paid" : "pending"
        
        if (student && balance) {
            
            const temFess = new feespayments({
                sno: student.sno,
                roomno: student.roomno,
                name: student.name,
                sem: student.sem,
                date: student.date,
                total: student.total,
                caution: student.caution,
                mess: student.mess,
                rent: student.rent,
                others: student.others,
                balance: balance,
                status: status,
                email: student.email,

            })
         
            const datasave = await temFess.save()
            
            if (!datasave) {
                return res.status(500).json({
                    message: "Failed to Save fees. Please try again!..."
                })
            }
            const totalfess = student.total
            const balancefee = balance
            const paidAmount = totalfess - balancefee
            const message = `
Dear ${student.name},

We are pleased to inform you that your hostel fee payment has been successfully received. Below are the payment details:

Payment Details:
Sem : ${student.sem}
Total Fee: ${student.total}
Caution Fee: ${student.caution}
Rent Fee: ${student.rent}
Mess Fee: ${student.mess}
Other Fees: ${student.others}
Total Paid: ${paidAmount}
Balance Due (if any): ${balance}

Your payment has been processed successfully, and your status is now ${status}.

If you have any questions, feel free to contact the hostel administration.

Best regards,
Hostel Management,
Erode Arts and Science College.
`;


            await sendMail(student.email, "Hostel Fee Payment Confirmation", message)
            return res.status(200).json({
                message: "Fees Payment Successfully!...",
            })

        }

    } catch (error) {
        return res.status(500).json({ message: "FessPayment Error", error: error });

    }
}


export const fetchFess = async (req, res) => {
    try {
        const { status, search } = req.query;

        let filter = {};
        if (status && status !== "all") {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { sno: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { roomno: { $regex: search, $options: "i" } },
            ]
        }

        const fees = await feespayments.find(filter).sort({ date: -1 });
        res.status(200).json({
            message: "Fees data fetched successfully!",
            data: fees,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching fees data.",
            error: error.message,
        });
    }
}



export const updateFees = async (req, res) => {
    try {
        const fetchdataById = await feespayments.findById(req.params.id)
        return res.status(200).json({
            message: "fetched student fees data",
            data: fetchdataById
        })
    } catch (error) {
        return res.status(500).json({ message: "Fetching Student FessPayment Error", error: error });
    }
}

export const updateByIdFees = async (req, res) => {
    try {
        const { student, balance } = req.body
        if (Number(balance) < 0) {
            return res.status(400).json({
                message: "Error: Balance cannot be negative. Please check the entered fees.",
            });
        }
        const status = Number(balance) === 0 ? "paid" : "pending";
        const updateData = { ...student, balance, status };

        const fetchdata = await feespayments.findByIdAndUpdate(req.params.id, updateData, { new: true })
        console.log(fetchdata)
        if (!fetchdata) {
            return res.status(404).json({
                message: "Student Fess Update Not Found"
            })
        }
        const totalfess = fetchdata.total
        const balancefee = fetchdata.balance
        const paidAmount = totalfess - balancefee
        const message = `
Dear ${fetchdata.name},

We are pleased to inform you that your hostel fee payment has been successfully received. Below are the payment details:

Payment Details:
Sem : ${fetchdata.sem}
Total Fee: ${fetchdata.total}
Caution Fee: ${fetchdata.caution}
Rent Fee: ${fetchdata.rent}
Mess Fee: ${fetchdata.mess}
Other Fees: ${fetchdata.others}
Total Paid: ${paidAmount}
Balance Due (if any): ${fetchdata.balance}

Your payment has been processed successfully, and your status is now ${fetchdata.status}.

If you have any questions, feel free to contact the hostel administration.

Best regards,
Hostel Management,
Erode Arts and Science College.
`;


        await sendMail(fetchdata.email, "Hostel Fee Payment Confirmation", message)
        return res.status(200).json({
            message: "Student Fees Update Successfully!...",
            data: fetchdata
        })
    } catch (error) {
        return res.status(500).json({ message: "Fetching Student FessPayment Error", error: error });
    }
}

export const fetchstddetails = async (req, res) => {
    try {
        const token = req.headers.token
        if (!token) {
            res.status(400).json({
                message: "Please login to Access!.."
            })
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        const user = await stdreg.findById(decodedData._id).select("-pass")
        if (!user) {
            res.status(400).json({
                message: "Student not Found!.."
            })
        }

        return res.status(200).json({
            message: "Student Details!..",
            data: user
        })

    } catch (error) {
        return res.status(500).json({ message: "Fetching Student Error", error: error });

    }
}

export const fetchStdOutPassId = async (req, res) => {
    try {
        const { id } = req.params;

        const stdoutpass = await outpass.findById(id)
        return res.status(200).json({
            message: "student outpass",
            data: stdoutpass
        })
    } catch (error) {
        return res.status(500).json({ message: "Fetching Student Error", error: error });

    }
}

export const adminuser = async (req, res) => {
    try {
        const token = req.headers.token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        let user = await admin.findById(decodedData._id).select("-password")
        if (!user) {
            user = await stdreg.findById(decodedData._id).select("-pass")
            if (!user) {
                return res.status(403).json({
                    message: "User not Found..",
                })
            }
        }

        if (user.role === "admin") {
            return res.status(200).json({
                message: `Welcome ${user.name} Admin!.`,
                data: user
            })

        }
        if (user.role === "student") {
            return res.status(200).json({
                message: `Welcome ${user.name}!.`,
                data: user
            })
        }


    } catch (error) {
        return res.status(500).json({ message: "Fetching Admin Error", error: error });
    }
}



export const fetchstdoutpass = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await stdreg.findById(decoded._id);
        
        if (!user) {
            return res.status(404).json({ message: "Student details not found" });
        }

        const { status } = req.query;
        let filter = { sno: user.sno };

        if (status && status !== "all") {
            filter.status = status;
        }

        const stdoutpass = await outpass.find(filter).sort({ date: -1 });

        if (!stdoutpass || stdoutpass.length === 0) {
            return res.status(404).json({ message: "Student outpass not found" });
        }

        return res.status(200).json({
            message: "Student details found",
            data: stdoutpass
        });

    } catch (error) {
        console.error("Error fetching student outpass:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await stdreg.findById(id);

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        student.status = student.status === "Active" ? "Inactive" : "Active";
        await student.save();

        res.json({ success: true, message: "Status updated successfully", data: student });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const sendPendingEmail = async (req, res) => {
    try {
        const Pending = await feespayments.find({ status: "pending" });

        for (const pending of Pending) {
            const paidAmount = pending.total - pending.balance
            const message = `Dear ${pending.name},\n\nThis is a reminder that you have a pending fee of ₹${pending.balance}. Below are the fee details:

Pending Fee Details:
Sem: ${pending.sem}
Total Fee: ₹${pending.total}
Caution Fee: ₹${pending.caution}
Rent Fee: ₹${pending.rent}
Mess Fee: ₹${pending.mess}
Other Fees: ₹${pending.others}
Total Paid: ₹${paidAmount}
Balance Due: ₹${pending.balance}

We kindly request you to clear the pending amount at the earliest to avoid any inconvenience. If you have already made the payment, please ignore this message.

For any queries, feel free to contact the hostel administration.

Please make the payment as soon as possible.\n\nThank you!

Best regards,  
Hostel Management,  
Erode Arts and Science College.`;

            await sendMail(pending.email, 'Reminder: Pending Fee Payment', message);
        }

        return res.status(200).json({
            message: "Pending emails sent successfully!..",
            data: Pending
        });

    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const stdFeesView = async (req, res) => {
    try {
        const token = req.headers.token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET)
        const user = await stdreg.findById(decodedData._id).select("-pass")
        const feesfetching = await feespayments.find({ sno: user.sno }).sort({ date: -1 })

        return res.status(200).json({
            message: "student fees fetching",
            data: feesfetching
        })

    } catch (error) {
        return res.status(500).json({ message: "Fetching fees Error", error: error });

    }
}

export const stdDownloadFess= async(req,res)=>{
    try {
     const stdDownloadFees= await feespayments.findById(req.params.id) 
     return res.status(200).json({
        message:"Student Fess Details",
        data:stdDownloadFees
     })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }

}


export const rooms=async(req,res)=>{
    try {
        const students = await stdreg.find({ status: "Active" });
        const roomMap = {};
        
        students.forEach(student => {
          if (!roomMap[student.roomno]) {
            roomMap[student.roomno] = { occupied: 0, available: 4, students: [] };
          }
          roomMap[student.roomno].occupied += 1;
          roomMap[student.roomno].available -= 1;
          roomMap[student.roomno].students.push(student.name);
        });
        
        const rooms = Object.keys(roomMap).map(roomNo => ({
          roomNo,
          occupied: roomMap[roomNo].occupied,
          available: roomMap[roomNo].available,
          students: roomMap[roomNo].students,
        }));
    
        res.json(rooms);
      } catch (error) {
        res.status(500).json({ message: "Server Error", error });
      }
}

export const checkroom=async (req, res) => {
    const roomNo = req.params.roomNo;
    try {
      
      const studentCount = await stdreg.countDocuments({ roomno: roomNo,status: "Active"  });
  
      if (studentCount < 4) {
        res.json({ available: true, message: `Room available. ${4 - studentCount} slots left.` });
      } else {
        res.json({ available: false, message: "Room is full. No slots available." });
      }
    } catch (error) {
      console.error("Error checking room:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  export const stdnotification=async(req,res)=>{
    try{

        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await stdreg.findById(decoded._id);
       
        
        if (!user) {
            return res.status(404).json({ message: "Student details not found" });
        }
        const reqoutpasscount= await outpass.countDocuments({ sno:user.sno, status:"Request"})
        const outpasscount= await outpass.countDocuments({ sno:user.sno})
        const approvedcount= await outpass.countDocuments({status:"Approved" , sno:user.sno})
        const pendingfees= await feespayments.countDocuments({status:"pending" , sno:user.sno})
     
        const complaintcount= await complaint.countDocuments({sno:user.sno})
     
        return res.status(200).json({
            message:"notifications",
            data:{
            outpasscount:outpasscount,
            reqoutpasscount:reqoutpasscount,
            approvedcount:approvedcount,
            pendingfees:pendingfees,
            
            complaintcount:complaintcount,
            user:user
        }

        })


    } catch (error) {
        console.error("Error checking room:", error);
        res.status(500).json({ error: "Internal server error" });
      }
  }