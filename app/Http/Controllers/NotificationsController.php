<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $notifications_from_db = DB::table("notifications")->select("*")->where("recipient_id", "=", $request->user()->id)->get();
        $notifications = [];

        foreach ($notifications_from_db as $notification) {

            $notifiable_type = $notification->notifiable_type;
            // dd($notifiable_type->get());

            if ($notifiable_type == "comment") {
                $notifiable = DB::table("comments")
                    ->select("content")
                    ->where("author_id", "=", $notification->sender_id)
                    ->where("aircraft_id", "=", $notification->post_id);

            } else if ($notifiable_type == "opinion") {
                $notifiable = DB::table("opinions")
                    ->select("opinion")
                    ->where("user_id", "=", $notification->sender_id)
                    ->where("aircraft_id", "=", $notification->post_id);
            } else {
                return Inertia::render("Notifications", [
                    "notifications" => []
                ]);
            }

            if ($notifiable->count() < 1) {
                return Inertia::render("Notifications", [
                    "notifications" => []
                ]);
            }

            $notifiable = $notifiable->get();
            $sender = DB::table("users")->select(["id", "name"])->where("id", "=", $notification->sender_id)->get();
            $recipient = DB::table("users")->select(["id", "name"])->where("id", "=", $notification->recipient_id)->get();
            $aircraft = DB::table("aircraft")->select(["id", "reg"])->where("id", "=", $notification->post_id)->get();

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
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource.
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
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

        if ($notification_recipient[0]->recipient_id != $request->user()->id) {
            return response()->json([
                "status" => "error",
                "message" => "You are not authorized to perform this request."
            ], 403);
        }

        $notification->delete();
        return response()->json([
            "status" => "success",
        ], 200);
    }
}
