<?php

namespace App\Http\Controllers;

use Exception;
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
     * @param request HTTP request object.
     * @param user_id ID of the user.
     */
    public function index(Request $request, int $user_id)
    {

        $profile = DB::table("profiles")
            ->select(["name", "role", "profiles.id"])
            ->where("id", "=", $user_id);

        $user = DB::table("users")
            ->select(["name", "role", "profile.id"])
            ->where("users.id", "=", $user_id)
            ->joinSub($profile, "profile", "profile.id", "=", "users.id")
            ->get();

        $profile = DB::table("profiles")->select(["role", "name"])->where("id", "=", $request->user()->id)->get();

        $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $user_id)->get();
        $user_comments = DB::table("comments")->select(["author_id", "aircraft_id", "content", "updated_at", "id"])->where("author_id", "=", $user_id)->get();
        return Inertia::render("User", [
            "userDetails" => $user[0],
            "userAircraft" => $user_aircraft,
            "userComments" => $user_comments,
            "admin" => $profile[0]->role == "Admin"
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
        $requestee_role = DB::table("profiles")->select("role")->where("id", "=", $request->user()->id)->get();

        // ensure user is admin or the user is themselves
        if ($request->user()->id == $user_id || $requestee_role[0]->role == "Admin") {
            // $user = DB::table("users")->select(["name", "email", "id", "role"])->where("id", "=", $user_id)->get();
            try {
                $profile = DB::table("profiles")
                    ->select(["name", "role", "profiles.id"])
                    ->where("id", "=", $user_id);

                $user = DB::table("users")
                    ->select(["name", "role", "profile.id", "email"])
                    ->where("users.id", "=", $user_id)
                    ->joinSub($profile, "profile", "profile.id", "=", "users.id")
                    ->get();

                // no user found
                if ($user->isEmpty()) {
                    abort(404);
                }

                // return the edit page
                return Inertia::render('Profile/Edit', [
                    "user" => $user[0],
                    "admin" => $requestee_role[0]->role == "Admin"
                ]);
            } catch (Exception $e) {
                abort(500);
            }
        }
        abort(403);
    }

    // API Routes

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
        $requestee_role = DB::table("profiles")->select("role")->where("id", "=", $request->user()->id)->get();

        // not all of the data was sent.
        if (!$name || !$email || !$id) {
            return response()->json([
                "status" => "error",
                "message" => "You must include a name and an email."
            ], 400);
        }

        // ensure user is admin or the user is themselves
        if ($requestee_role[0]->role == "Admin" || $request->user()->id == $id) {
            try {
                $updated_user = DB::table("users")->where("id", $id)->update(["email" => $email]);
                $updated_profile = DB::table("profiles")->where("id", $id)->update(["name" => $name, "role" => $role]);

                // update returns whether anything was
                // updated, 0 for no.
                // If nothing was updated, alert the requestee.
                if ($updated_user < 1 && $updated_profile < 1) {
                    return response("Nothing modified.", 304);
                }

                return response()->json([
                    "status" => "success",
                    "message" => "User updated."
                ], 200);
            } catch (Exception $e) {
                return response()->json([
                    "status" => "error",
                    "message" => "Could not update user details."
                ], 500);
            }
        }


        return response()->json([
            "status" => "error",
            "message" => "You are not permitted to perform this action."
        ], 403);
    }

    /**
     * Get roles on a profile
     *
     * @param Request HTTP request object.
     */
    public function getRoles(Request $request) {

        $id = $request->user()->id;
        $profile = DB::table("profiles")->select(["role", "name"])->where("id", "=", $id);

        if ($profile->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Profile does not exist."
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "payload" => $profile
        ], 200);

    }

    /**
     * Get a profile.
     *
     * @param id ID of the profile.
     */
    public function show(string $id)
    {
        $profile = DB::table("profiles")->select(["id", "name", "role"])->where("id", "=", $id)->get();

        // no user
        if ($profile->isEmpty()) {
            return response()->json([
                "status" => "error",
                "message" => "Profile not found."
            ], 404);
        }

        return response()->json($profile[0]);
    }
}
