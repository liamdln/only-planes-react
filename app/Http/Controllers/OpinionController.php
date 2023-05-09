<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OpinionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->query("type");
        $dbType = $type == "likes" ? "like" : "dislike";
        $user = $request->user();

        // $aircraftIds = DB::table("opinions")->select("opinions.aircraft_id")->where("opinions.user_id", "=", $user->id)->where("opinions.opinion", "=", $dbType);
        // $actionDates = DB::table("opinions")->select(["opinions.created_at AS action_dispatch_date", "opinions.aircraft_id"])->whereIn("opinions.aircraft_id", $aircraftIds);
        // $aircraft = DB::table("aircraft")->select(["aircraft.id", "aircraft.reg", "aircraft.featured_photo_url", "dates.action_dispatch_date"])->joinSub($actionDates, "dates", "dates.aircraft_id", "=", "aircraft.id")->whereIn("aircraft.id", $aircraftIds)->get();

        $actionedAircraft = DB::table("opinions")
            ->select(["opinions.aircraft_id", "opinions.created_at AS action_dispatch_date"])
            ->where("opinions.user_id", "=", $user->id)
            ->where("opinions.opinion", "=", $dbType);

        $aircraft = DB::table("aircraft")
            ->select(["aircraft.reg", "aircraft.featured_photo_url", "aircraft.make", "aircraft.model", "aircraft.id", "action_dispatch_date"])
            ->joinSub($actionedAircraft, "actionedAircraft", "actionedAircraft.aircraft_id", "=", "aircraft.id")
            ->get();


        return Inertia::render("Interactions", [
            "type" => $type,
            "aircraft" => $aircraft,
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $userId = $request->input("userId");

        if ($userId != $request->user()->id) {
            return response()->json([
                "status" => "error",
                "message" => "You do not have permission to perform this action."
            ], 403);
        }

        $aircraftId = $request->input("aircraftId");
        $opinion = $request->input("opinion");

        try {
            $opinionId = DB::table("opinions")->insertGetId([
                "user_id" => $userId,
                "aircraft_id" => $aircraftId,
                "opinion" => $opinion,
                "created_at" => date("Y-m-d H:i:s")
            ]);
        } catch (Exception $e) {
            // dd($e);
            return response()->json([
                "status" => "error",
                "message" => "Could not post opinion."
            ], 500);
        }

        return response()->json([
            "status" => "success",
            "payload" => $opinionId
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
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
        // $userId = $request->query("userId");
        $aircraftId = $request->query("aircraftId");
        $opinion = DB::table("opinions")->select("id")->where("user_id", "=", $request->user()->id)->where("aircraft_id", "=", $aircraftId);

        if ($opinion->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Opinion not found."
            ], 404);
        }

        try {
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


        // $opinion_owner = $opinion->get();

        // dd($opinion_owner[0]->id);

        // if ($opinion_owner[0]->id == $request->user()->id) {
        //     $opinion->delete();

        //     return response()->json([
        //         "status" => "success"
        //     ], 200);
        // }

        // return response()->json([
        //     "status" => "error",
        //     "message" => "You are not authorized to perform the requested action."
        // ], 403);
    }
}
