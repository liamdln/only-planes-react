<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{

    /**
     * Get a user.
     *
     * @param id ID of the user.
     */
    public function show(string $id)
    {
        $user = DB::table("users")->select(["id", "email"])->where("id", "=", $id)->get();

        // no user
        if ($user->isEmpty()) {
            abort(404);
        }

        return json_decode($user);
    }

    /**
     * Delete a user.
     *
     * @param request HTTP request object.
     */
    public function destroy(Request $request)
    {

        $id = $request->query("userId");

        // stop a user deleting themselves
        if ($request->user()->id == $id) {
            return response()->json([
                "status" => "error",
                "message" => "You cannot delete yourself."
            ], 400);
        }

        $current_user_role = DB::table("profiles")->select("role")->where("id", "=", $request->user()->id)->get();
        $user = DB::table("users")->where("id", "=", $id);
        $profile = DB::table("profiles")->select("role")->where("id", "=", $id);

        // stop a user deleting another admin
        if ($profile->get()[0]->role == "Admin") {
            return response()->json([
                "status" => "error",
                "message" => "Cannot delete an admin."
            ], 400);
        }

        // ensure user is an admin
        // only admins can delete users.
        if ($current_user_role[0]->role == "Admin") {
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
