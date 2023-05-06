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

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $userId)->get();
        return Inertia::render("User", [
            "userDetails" => $request->user(),
            "userAircraft" => $user_aircraft,
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request, int $userId): Response
    {

        $currentUserPower = DB::table("users")->select("permission_power")->where("id", "=", $request->user()->id)->get();

        if ($request->user()->id == $userId || $currentUserPower[0]->permission_power >= 100) {
            $user = DB::table("users")->select(["name", "email", "id"])->where("id", "=", $userId)->get();

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
        $requestee_power = DB::table("users")->select("permission_power")->where("id", "=", $request->user()->id)->get();

        if (!$name || !$email || !$id) {
            return response()->json([
                "status" => "error",
                "message" => "You must include a name and an email."
            ], 400);
        }

        if ($requestee_power[0]->permission_power >= 100 || $request->user()->id == $id) {
            $updatedUser = DB::table("users")->where("id", $id)->update(["name" => $name, "email" => $email]);

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

    // /**
    //  * Delete the user's account.
    //  */
    // public function destroy(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'password' => ['required', 'current_password'],
    //     ]);

    //     $user = $request->user();

    //     Auth::logout();

    //     $user->delete();

    //     $request->session()->invalidate();
    //     $request->session()->regenerateToken();

    //     return Redirect::to('/');
    // }

    // public function editUserBanStatus(Request $request) {
    //     $id = $request->input("id");
    //     $ban_status = $request->input("banned");
    //     $requestee_power = DB::table("users")->select("permission_power")->where("id", "=", $request->user()->id)->get();

    //     if ($requestee_power[0]->permission_power >= 100) {
    //         DB::table("users")->where("id", $id)->update(["banned" => $ban_status]);
    //         return response()->json([
    //             "status" => "success",
    //             "message" => "User ban status changed to " .
    //         ], 200);
    //     }

    //     return response()->json([
    //         "status" => "error",
    //         "message" => "You are not permitted to perform this action."
    //     ], 403);

    // }

    public function getUserProfile(int $user_id)
    {
        $user = DB::table("users")->select(["name", "id"])->where("id", "=", $user_id)->get();

        if ($user->isEmpty()) {
            abort(404);
        }

        $user_aircraft = DB::table("aircraft")->select("*")->where("user_id", "=", $user_id)->get();
        return Inertia::render("User", [
            "userDetails" => $user[0],
            "userAircraft" => $user_aircraft,
        ]);
    }
}
