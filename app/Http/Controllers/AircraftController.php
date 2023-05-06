<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Storage;

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

        // https://stackoverflow.com/questions/67227154/upload-image-in-laravel-8-api

        // dd($request->all());

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

            $user = Auth::user();

            DB::table("aircraft")->insert([
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
    public function destroy(string $id)
    {
        //
    }
}
