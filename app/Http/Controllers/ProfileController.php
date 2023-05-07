<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

    public function index(int $user_id)
    {
        $user = DB::table("users")->select(["name", "id", "role"])->where("id", "=", $user_id)->get();
        $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $user_id)->get();
        $user_comments = DB::table("comments")->select(["author_id", "aircraft_id", "content", "date", "id"])->where("author_id", "=", $user_id)->get();
        return Inertia::render("User", [
            "userDetails" => $user[0],
            "userAircraft" => $user_aircraft,
            "userComments" => $user_comments
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request, int $user_id): Response
    {

        $current_user_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();

        // ensure user is admin
        if ($request->user()->id == $user_id || $current_user_role[0]->role == "Admin") {
            $user = DB::table("users")->select(["name", "email", "id", "role"])->where("id", "=", $user_id)->get();

            if ($user->isEmpty()) {
                abort(404);
            }

            return Inertia::render('Profile/Edit', [
                "user" => $user[0]
            ]);
        }
        abort(403);
    }

    /**
     * Update the user's profile information.
     */
    public function updateDetails(Request $request)
    {

        $id = $request->input("id");
        $name = $request->input("name");
        $email = $request->input("email");
        $role = $request->input("role");
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();

        if (!$name || !$email || !$id) {
            return response()->json([
                "status" => "error",
                "message" => "You must include a name and an email."
            ], 400);
        }

        // ensure user is admin
        if ($requestee_role[0]->role == "Admin" || $request->user()->id == $id) {
            $updatedUser = DB::table("users")->where("id", $id)->update(["name" => $name, "email" => $email, "role" => $role]);

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

    // public function getUserProfile(int $user_id)
    // {
    //     $user = DB::table("users")->select(["name", "id", "role"])->where("id", "=", $user_id)->get();

    //     if ($user->isEmpty()) {
    //         abort(404);
    //     }

    //     $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $user_id)->get();
    //     return Inertia::render("User", [
    //         "userDetails" => $user[0],
    //         "userAircraft" => $user_aircraft,
    //     ]);
    // }
}
