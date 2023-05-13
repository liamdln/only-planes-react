<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    /**
     * Get tags
     */
    public function get()
    {

        $tags = DB::table("tags")->select("*")->get();
        return response()->json([
            "status" => "success",
            "payload" => $tags
        ]);

    }

    /**
     * Get tag
     *
     * @param request HTTP object.
     */
    public function getById(Request $request)
    {

        $id = $request->query("id");

        $tag = DB::table("tags")
            ->select("*")
            ->where("id", "=", $id)
            ->get();

        if ($tag->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Tag not found."
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "payload" => $tag[0]
        ], 200);
    }

    public function getTagsForAircraft(Request $request) {

        $aircraft_id = $request->query("aircraftId");

        $tags = DB::table("aircraft_tags")
            ->select("tag_id")
            ->where("aircraft_id", "=", $aircraft_id);

        if ($tags->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Tag not found for aircraft."
            ], 404);
        }

        try {
            $tags = $tags->get();
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Cannot get tag."
            ], 500);
        }

        return response()->json([
            "status" => "success",
            "payload" => $tags
        ], 200);

    }
}
