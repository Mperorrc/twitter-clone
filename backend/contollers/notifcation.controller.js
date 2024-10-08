import Notification from "../models/notification.model.js";

export const getNotifications = async (req,res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to: userId})
        .populate({
            path:"from",
            select:"username profileImg"
        });

        await Notification.updateMany({to: userId}, {read:true});

        res.status(200).json(notifications);

    } catch (error) {
        console.log("Error in fetching notifications", error.message);
        res.status(500).json("Internal Server Error");
    }
}

export const deleteNotifications = async (req,res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to: userId});

        res.status(200).json({message: "Deleted all user Notifications"});

    } catch (error) {
        console.log("Error in deleteNotifications", error.message);
        res.status(500).json("Internal Server Error");
    }
}

export const deleteNotification = async (req,res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);

        if(!notification){
            return res.status(400).json({
                error: "Notification not found"
            });
        }

        if(notification.from.toString() !== userId.toString()){
            return res.status(400).json({
                error: "You are not authorized to delete this notification"
            });
        }

        await Notification.findByIdAndDelete(notificationId);
        
        return res.status(200).json({message: "Notification deleted successfully"});

    } catch (error) {
        console.log("Error in deleteNotification", error.message);
        res.status(500).json("Internal Server Error");
    }
}