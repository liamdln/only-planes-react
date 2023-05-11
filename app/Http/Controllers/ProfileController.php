<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

    // Web routes

    /**
     * Get the profile page for the user profile.
     *
     * @param user_id ID of the user.
     */
    public function index(int $user_id)
    {
        // get the user details, user's aircraft, and user's comments
        $user = DB::table("users")->select(["name", "id", "role"])->where("id", "=", $user_id)->get();
        $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $user_id)->get();
        $user_comments = DB::table("comments")->select(["author_id", "aircraft_id", "content", "updated_at", "id"])->where("author_id", "=", $user_id)->get();
        return Inertia::render("User", [
            "userDetails" => $user[0],
            "userAircraft" => $user_aircraft,
            "userComments" => $user_comments
        ]);
    }

    /**
     * Edit the user.
     *
     * @param request HTTP request object.
     * @param user_id ID of the user to edit.
     */
    public function edit(Request $request, int $user_id): Response
    {

        // get the requestee's role
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();

        // ensure user is admin or the user is themselves
        if ($request->user()->id == $user_id || $requestee_role[0]->role == "Admin") {
            $user = DB::table("users")->select(["name", "email", "id", "role"])->where("id", "=", $user_id)->get();

            // no user found
            if ($user->isEmpty()) {
                abort(404);
            }

            // return the edit page
            return Inertia::render('Profile/Edit', [
                "user" => $user[0]
            ]);
        }
        abort(403);
    }

    /**
     * Update the user's details
     *
     * @param request HTTP request object.
     */
    public function updateDetails(Request $request)
    {

        $id = $request->input("id");
        $name = $request->input("name");
        $email = $request->input("email");
        $role = $request->input("role");
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();

        // not all of the data was sent.
        if (!$name || !$email || !$id) {
            return response()->json([
                "status" => "error",
                "message" => "You must include a name and an email."
            ], 400);
        }

        // ensure user is admin or the user is themselves
        if ($requestee_role[0]->role == "Admin" || $request->user()->id == $id) {
            $updatedUser = DB::table("users")->where("id", $id)->update(["name" => $name, "email" => $email, "role" => $role]);

            // update returns whether anything was
            // updated, 0 for no.
            // If nothing was updated, alert the requestee.
            if ($updatedUser < 1) {
                return response("Nothing modified.", 304);
            }

            return response()->json([
                "status" => "success",
                "message" => "User updated."
            ], 200);
        }

        return response()->json([
            "status" => "error",
            "message" => "You are not permitted to perform this action."
        ], 403);
    }
}
