<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationsController extends Controller
{

    // Web routes

    /**
     * Get the notifications page.
     *
     * @param request HTTP request object.
     */
    public function index(Request $request)
    {
        $notifications_from_db = DB::table("notifications")
            ->select("*")
            ->where("recipient_id", "=", $request->user()->id)
            ->get();
        $notifications = [];
        $handled_comment_ids = [];
        $handled_opinion_ids = [];

        // echo ($notifications_from_db);

        // go through each notification and
        // get the record associated with the ID stored
        // in the notification record
        try {

            foreach ($notifications_from_db as $notification) {

                // can have opinions or comments
                // the notifications have a polymorphic
                // relationship with each
                $notifiable_type = $notification->notifiable_type;
                $notifiable = null;

                if ($notifiable_type == "comment") {
                    $notifiable = DB::table("comments")
                        ->select(["content", "id"])
                        ->where("author_id", "=", $notification->sender_id)
                        ->where("aircraft_id", "=", $notification->post_id)
                        ->whereNotIn("id", $handled_comment_ids);

                    array_push($handled_comment_ids, $notifiable->get()[0]->id);
                } else if ($notifiable_type == "opinion") {
                    $notifiable = DB::table("opinions")
                        ->select(["opinion", "id"])
                        ->where("user_id", "=", $notification->sender_id)
                        ->where("aircraft_id", "=", $notification->post_id)
                        ->whereNotIn("id", $handled_opinion_ids);

                    array_push($handled_opinion_ids, $notifiable->get()[0]->id);
                } else {
                    // no type
                    return Inertia::render("Notifications", [
                        "notifications" => []
                    ]);
                }

                if ($notifiable->count() < 1) {
                    return Inertia::render("Notifications", [
                        "notifications" => []
                    ]);
                }
                // echo ("OPINIONS: " . print_r($handled_opinion_ids) . "<br/>");
                // echo ("COMMENTS: " . print_r($handled_comment_ids) . "<br/><br/>");

                // get information about the sender, recipient, and aircraft profile
                $notifiable = $notifiable->get();
                $sender = DB::table("profiles")->select(["id", "name"])->where("id", "=", $notification->sender_id)->get();
                $recipient = DB::table("profiles")->select(["id", "name"])->where("id", "=", $notification->recipient_id)->get();
                $aircraft = DB::table("aircraft")->select(["id", "reg"])->where("id", "=", $notification->post_id)->get();

                // add all this to an array that will be rendered on the page.
                array_push($notifications, [
                    "notifiable" => $notifiable_type,
                    "notifiable_content" => $notifiable[0],
                    "aircraft" => $aircraft[0],
                    "sender" => $sender[0],
                    "recipient" => $recipient[0],
                    "date" => $notification->created_at,
                    "id" => $notification->id
                ]);
            }

            return Inertia::render("Notifications", [
                "notifications" => $notifications
            ]);

        } catch (Exception $e) {
            dd($e);
            return Inertia::render("Notifications", [
                "notifications" => []
            ]);
        }
    }

    // API Routes

    /**
     * Create a notification
     *
     * @param request HTTP request object.
     */
    public function store(Request $request)
    {
        $sender_id = $request->input("senderId");

        if ($sender_id != $request->user()->id) {
            return response()->json([
                "status" => "error",
                "message" => "You do not have permission to perform this action."
            ], 403);
        }

        $recipient_id = $request->input("recipientId");
        $aircraft_id = $request->input("aircraftId");
        $notifiable_id = $request->input("notifiableId");
        $notifiable_type = $request->input("notifiableType");

        if ($recipient_id == $sender_id) {
            return response("Nothing modified: Cannot send notification to yourself.", 304);
        }

        // try store the notification and return the ID of the
        // new notification
        try {
            $notification_id = DB::table("notifications")->insertGetId([
                "sender_id" => $sender_id,
                "recipient_id" => $recipient_id,
                "post_id" => $aircraft_id,
                "notifiable_id" => $notifiable_id,
                "notifiable_type" => $notifiable_type,
                "read" => 0,
                "created_at" => date("Y-m-d H:i:s")
            ]);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not post notification."
            ], 500);
        }

        return response()->json([
            "status" => "success",
            "payload" => $notification_id
        ], 201);
    }

    /**
     * Delete a notification
     *
     * @param request HTTP request object.
     */
    public function destroy(Request $request)
    {
        $notification_id = $request->query("notificationId");
        $notification = DB::table("notifications")->where("id", "=", $notification_id);

        if ($notification->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Notification not found."
            ], 404);
        }

        $notification_recipient = $notification->select("recipient_id")->get();

        // the notification does not belong to the user who is request its deletion
        if ($notification_recipient[0]->recipient_id != $request->user()->id) {
            return response()->json([
                "status" => "error",
                "message" => "You are not authorized to perform this request."
            ], 403);
        }

        // try delete the notification
        try {
            $notification->delete();
            return response()->json([
                "status" => "success",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not delete notification."
            ], 500);
        }
    }
}
