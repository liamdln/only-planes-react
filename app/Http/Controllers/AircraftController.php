<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use function PHPUnit\Framework\isEmpty;

class AircraftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aircraft = DB::table("aircraft")->select("*")->get();
        return json_decode($aircraft);
    }

    public function aircraftPage(int $aircraft_id)
    {
        $aircraft = DB::table("aircraft")->select("*")->where("id", "=", $aircraft_id)->get();
        return Inertia::render("Aircraft", [
            "aircraft" => $aircraft[0]
        ]);
    }

    /**
     * Display a paginated listing of the resource
     */
    public function paginatedIndex(Request $request, int $page)
    {
        // number of aircraft to display at once
        $numAircraftPerReq = 5;

        // handle page numbers less than 1
        if ($page < 1) {
            return array("error" => "Cannot specify a page number less than 1.");
        }

        $avoidUserId = $request->query("avoid-user");

        $aircraftWithUserOpinions = DB::table("opinions")->select("aircraft_id")->where("user_id", "=", $avoidUserId);

        // get the aircraft
        $aircraft = DB::table("aircraft")
            ->select("*")
            ->where("user_id", "!=", $avoidUserId)
            ->whereNotIn("id", $aircraftWithUserOpinions)
            ->offset($numAircraftPerReq * ($page - 1))
            ->limit($numAircraftPerReq)
            ->inRandomOrder()
            ->get();
        return json_decode($aircraft);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $reg = $request->registration;
        $make = $request->make;
        $model = $request->model;
        $lat = $request->lat;
        $lng = $request->lng;

        $request->validate([
            "aircraft_image" => "required|image|mimes:png,jpg,jpeg|max:512000"
        ]);

        if (!$reg || !$make || !$model || !$lat || !$lng) {
            return response()->json([
                "status" => "error",
                "message" => "Not all data was sent with the request."
            ], 400);
        }

        try {

            $imageName = uniqid("aircraft-") . "." . $request->aircraft_image->extension();
            $request->aircraft_image->storeAs("images", $imageName);
            $request->aircraft_image->move(public_path("images"), $imageName);
            // $request->aircraft_image->storeAs("aircraft_images", $imageName);

            $user = $request->user();

            $new_aircraft_id = DB::table("aircraft")->insertGetId([
                "reg" => $reg,
                "make" => $make,
                "model" => $model,
                "location_lat" => $lat,
                "location_lng" => $lng,
                "featured_photo_url" => "/images" . "/" . $imageName,
                "user_id" => $user->id,
                "created_at" => date("Y-m-d H:i:s")
            ]);
            return response()->json([
                "status" => "success",
                "payload" => $new_aircraft_id
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not create aircraft."
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $aircraft = DB::table("aircraft")->select("*")->where("id", "=", $id)->get();
        return json_decode($aircraft);
    }

    public function edit(Request $request)
    {
        $reg = $request->registration;
        $make = $request->make;
        $model = $request->model;
        $lat = $request->lat;
        $lng = $request->lng;
        $new_image = $request->imageAttached;

        $new_image_name = "";

        if (!$reg || !$make || !$model || !$lat || !$lng) {
            return response()->json([
                "status" => "error",
                "message" => "Not all data was sent with the request."
            ], 400);
        }

        $aircraft_id = $request->query("aircraftId");

        if ($new_image) {
            $file_url = DB::table("aircraft")->select("featured_photo_url")->where("id", "=", $aircraft_id)->get();

            $file_name_array = explode("/", $file_url[0]->featured_photo_url);
            $file_name = end($file_name_array);

            try {
                File::delete(public_path() . "/images" . "/" . $file_name);
            } catch (Exception $e) {
                // dd($e);
            }

            $request->validate([
                "aircraft_image" => "required|image|mimes:png,jpg,jpeg|max:512000"
            ]);

            $new_image_name = uniqid("aircraft-") . "." . $request->aircraft_image->extension();
            $request->aircraft_image->storeAs("images", $new_image_name);
            $request->aircraft_image->move(public_path("images"), $new_image_name);
        }

        $aircraft = DB::table("aircraft")->select("*")->where("id", "=", $aircraft_id);

        if ($aircraft->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Aircraft not found."
            ], 404);
        }

        try {

            if ($new_image) {
                DB::table("aircraft")
                    ->where("id", "=", $aircraft_id)
                    ->update(["reg" => $reg, "make" => $make, "model" => $model, "location_lat" => $lat, "location_lng" => $lng, "featured_photo_url" => "/images" . "/" . $new_image_name]);
            } else {
                DB::table("aircraft")
                    ->where("id", "=", $aircraft_id)
                    ->update(["reg" => $reg, "make" => $make, "model" => $model, "location_lat" => $lat, "location_lng" => $lng]);
            }

            $new_aircraft = DB::table("aircraft")->select("*")->where("id", "=", $aircraft_id)->get();

            return response()->json([
                "status" => "success",
                "payload" => $new_aircraft
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not update aircraft."
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {

        $user_id = $request->user()->id;
        $aircraft_id = $request->query("aircraftId");
        $aircraft = DB::table("aircraft")->select("user_id")->where("id", "=", $aircraft_id);
        $aircraft_owner = $aircraft->get();
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $user_id)->get();

        if ($aircraft->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Aircraft not found."
            ], 404);
        }

        // ensure user is an admin
        if ($aircraft_owner[0]->user_id == $user_id || $requestee_role[0]->role == "Admin") {
            try {
                $aircraft->delete();

                return response()->json([
                    "status" => "success"
                ], 200);
            } catch (Exception $e) {
                return response()->json([
                    "status" => "error",
                    "message" => "Could not delete aircraft."
                ], 500);
            }
        }

        return response()->json([
            "status" => "error",
            "message" => "You are not authorized to perform the requested action."
        ], 403);
    }
}
