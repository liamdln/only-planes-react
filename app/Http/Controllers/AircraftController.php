<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
    public function paginatedIndex(Request $request, int $page) {
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
        //
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
