<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class AircraftController extends Controller
{

    // API Routes

    /**
     * Get a list of all aircraft.
     */
    public function index()
    {
        $aircraft = DB::table("aircraft")->select("*")->get();
        return json_decode($aircraft);
    }

    /**
     * Get a paginated list of all aircraft.
     *
     * @param request HTTP Request object.
     * @param page Requested page of aircraft profiles.
     */
    public function paginatedIndex(Request $request, int $page)
    {
        // number of aircraft to display at once
        $num_aircraft_per_req = 5;

        // handle page numbers less than 1
        if ($page < 1) {
            return array("error" => "Cannot specify a page number less than 1.");
        }

        // user we don't want aircraft from
        // usually the user making the request
        // as we don't want to show them their
        // own aircraft
        $avoidUserId = $request->query("avoid-user");

        $filtered_aircraft = DB::table("opinions")->select("aircraft_id")->where("user_id", "=", $avoidUserId);

        // get the aircraft
        // limit to the max number
        // for each page and offset
        // by the page number - 1 as
        // the page numbers here start
        // at 0
        $aircraft = DB::table("aircraft")
        ->select("*")
        ->where("user_id", "!=", $avoidUserId)
        ->whereNotIn("id", $filtered_aircraft)
        ->offset($num_aircraft_per_req * ($page - 1))
        ->limit($num_aircraft_per_req)
        ->inRandomOrder()
        ->get();

        return json_decode($aircraft);
    }

    /**
     * Create an aircraft in the database.
     *
     * @param request HTTP Request object.
     */
    public function store(Request $request)
    {
        $reg = $request->registration;
        $make = $request->make;
        $model = $request->model;
        $lat = $request->lat;
        $lng = $request->lng;

        // validate the image
        // max 512mb
        $request->validate([
            "aircraft_image" => "required|image|mimes:png,jpg,jpeg|max:512000"
        ]);

        // not all data was sent
        if (!$reg || !$make || !$model || !$lat || !$lng) {
            return response()->json([
                "status" => "error",
                "message" => "Not all data was sent with the request."
            ], 400);
        }

        try {

            // generate a random name
            // and store the image in the public folder.
            $imageName = uniqid("aircraft-") . "." . $request->aircraft_image->extension();
            $request->aircraft_image->storeAs("images", $imageName);
            $request->aircraft_image->move(public_path("images"), $imageName);
            // $request->aircraft_image->storeAs("aircraft_images", $imageName);

            $user = $request->user();

            // store the aircraft in the database
            // and return the ID of the new record.
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

        // some error occurred
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not create aircraft."
            ], 500);
        }
    }

    /**
     * Get a specific aircraft profile.
     *
     * @param id The ID of the aircraft profile.
     */
    public function show(string $id)
    {
        $aircraft = DB::table("aircraft")->select("*")->where("id", "=", $id)->get();
        return json_decode($aircraft);
    }

    /**
     * Edit an aircraft profile.
     *
     * @param request HTTP Request object.
     */
    public function edit(Request $request)
    {

        $aircraft_id = $request->query("aircraftId");
        $aircraft = DB::table("aircraft")->where("id", "=", $aircraft_id);
        $aircraft_owner = $aircraft->select("user_id")->get();
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();

        // no aircraft found.
        if ($aircraft->select("*")->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Aircraft not found."
            ], 404);
        }

        // ensure the user owns the profile before allowing an edit
        // and allow admins to edit the profile as well
        if ($aircraft_owner[0]->user_id != $request->user()->id && $requestee_role[0]->role != "Admin") {
            return response()->json([
                "status" => "error",
                "message" => "You are not authorized to perform that action."
            ], 403);
        }

        $reg = $request->registration;
        $make = $request->make;
        $model = $request->model;
        $lat = $request->lat;
        $lng = $request->lng;
        $new_image = $request->imageAttached;

        $new_image_name = "";

        // not all data was sent
        if (!$reg || !$make || !$model || !$lat || !$lng) {
            return response()->json([
                "status" => "error",
                "message" => "Not all data was sent with the request."
            ], 400);
        }

        // changing the picture is optional
        // check if the user indicated that there is a
        // new image.
        if ($new_image) {

            // validate the new image
            // max 512mb
            $request->validate([
                "aircraft_image" => "required|image|mimes:png,jpg,jpeg|max:512000"
            ]);

            // get the name of the old image
            $file_url = DB::table("aircraft")->select("featured_photo_url")->where("id", "=", $aircraft_id)->get();
            $file_name_array = explode("/", $file_url[0]->featured_photo_url);
            $file_name = end($file_name_array);

            // delete the old image
            try {
                File::delete(public_path() . "/images" . "/" . $file_name);
            } catch (Exception $e) {
                // dd($e);
            }

            // generate a name for the new image and store it in the public folder
            $new_image_name = uniqid("aircraft-") . "." . $request->aircraft_image->extension();
            $request->aircraft_image->storeAs("images", $new_image_name);
            $request->aircraft_image->move(public_path("images"), $new_image_name);
        }

        // try store the new information
        // and the new image URL if it exists.
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

            // return the new aircraft
            $new_aircraft = DB::table("aircraft")->select("*")->where("id", "=", $aircraft_id)->get();
            return response()->json([
                "status" => "success",
                "payload" => $new_aircraft
            ], 200);

        // error updating data.
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not update aircraft."
            ], 500);
        }
    }

    /**
     * Delete an aircraft profile.
     *
     * @param request HTTP Request object.
     */
    public function destroy(Request $request)
    {

        $user_id = $request->user()->id;
        $aircraft_id = $request->query("aircraftId");
        $aircraft = DB::table("aircraft")->select("user_id")->where("id", "=", $aircraft_id);
        $aircraft_owner = $aircraft->get();
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $user_id)->get();

        // no aircraft found matching filter
        if ($aircraft->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Aircraft not found."
            ], 404);
        }

        // ensure user is an admin or user owns the aircraft profile.
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

        // unauthorised - user doesn't own aircraft profile or is not admin
        return response()->json([
            "status" => "error",
            "message" => "You are not authorized to perform the requested action."
        ], 403);
    }

    // Web Routes

    /**
     * Get the profile page for an aircraft profile.
     *
     * @param aircraft_id
     */
    public function aircraftPage(int $aircraft_id)
    {
        $aircraft = DB::table("aircraft")->select("*")->where("id", "=", $aircraft_id)->get();
        return Inertia::render("Aircraft", [
            "aircraft" => $aircraft[0]
        ]);
    }

}
