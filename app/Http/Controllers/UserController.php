<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $user = DB::table("users")->select(["name", "id"])->where("id", "=", $id)->get();

        if ($user->isEmpty()) {
            abort(404);
        }

        return json_decode($user);
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

        $id = $request->query("userId");

        if ($request->user()->id == $id) {
            return response()->json([
                "status" => "error",
                "message" => "You cannot delete yourself."
            ], 400);
        }

        $current_user_power = DB::table("users")->select("permission_power")->where("id", "=", $request->user()->id)->get();
        $user = DB::table("users")->select(["id", "permission_power"])->where("id", "=", $id);

        if ($user->get()[0]->permission_power >= 100) {
            return response()->json([
                "status" => "error",
                "message" => "Cannot delete an admin."
            ], 400);
        }

        if ($current_user_power[0]->permission_power >= 100) {
            $user->delete();
            return response()->json([
                "status" => "success",
            ], 200);
        }

        return response()->json([
            "status" => "error",
            "message" => "You are not allowed to perform this action."
        ], 403);

    }
}
