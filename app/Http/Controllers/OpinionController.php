<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OpinionController extends Controller
{

    // Web Routes

    /**
     * Get the opinion page for a type of opinion.
     *
     * @param request HTTP request object.
     */
    public function index(Request $request)
    {
        $type = $request->query("type");

        // two types of opinions: likes and dislikes
        $db_type = $type == "likes" ? "like" : "dislike";
        $user = $request->user();

        // get the aircraft ID and opinion ID where the opinion matches the
        // requested type.
        $aircraft_context = DB::table("opinions")
            ->select(["opinions.aircraft_id", "opinions.created_at AS action_dispatch_date"])
            ->where("opinions.user_id", "=", $user->id)
            ->where("opinions.opinion", "=", $db_type);

        // next get the aircraft details and attach the
        // previous request so that the date of the opinion (action_dispatch_date)
        // can be returned to the user.
        $aircraft = DB::table("aircraft")
            ->select(["aircraft.reg", "aircraft.featured_photo_url", "aircraft.make", "aircraft.model", "aircraft.id", "action_dispatch_date"])
            ->joinSub($aircraft_context, "actionedAircraft", "actionedAircraft.aircraft_id", "=", "aircraft.id")
            ->get();


        return Inertia::render("Interactions", [
            "type" => $type,
            "aircraft" => $aircraft,
        ]);
    }

    // API Routes

    /**
     * Create an opinion.
     *
     * @param request HTTP request object.
     */
    public function store(Request $request)
    {
        $userId = $request->input("userId");

        // avoid users creating opinions for someone else.
        if ($userId != $request->user()->id) {
            return response()->json([
                "status" => "error",
                "message" => "You do not have permission to perform this action."
            ], 403);
        }

        $aircraftId = $request->input("aircraftId");
        $opinion = $request->input("opinion");

        // try create an opinion
        try {
            $opinionId = DB::table("opinions")->insertGetId([
                "user_id" => $userId,
                "aircraft_id" => $aircraftId,
                "opinion" => $opinion,
                "created_at" => date("Y-m-d H:i:s")
            ]);
            return response()->json([
                "status" => "success",
                "payload" => $opinionId
            ], 201);
        } catch (Exception $e) {
            // dd($e);
            return response()->json([
                "status" => "error",
                "message" => "Could not post opinion."
            ], 500);
        }
    }

    /**
     * Delete an opinion
     *
     * @param request HTTP request object.
     */
    public function destroy(Request $request)
    {
        // $userId = $request->query("userId");
        $aircraftId = $request->query("aircraftId");
        $opinion = DB::table("opinions")->select("id")->where("user_id", "=", $request->user()->id)->where("aircraft_id", "=", $aircraftId);

        // no opinion could be found
        if ($opinion->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Opinion not found."
            ], 404);
        }

        try {
            // try delete the opinion
            $opinion->delete();
            return response()->json([
                "status" => "success"
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not remove relationship"
            ], 500);
        }

    }
}
