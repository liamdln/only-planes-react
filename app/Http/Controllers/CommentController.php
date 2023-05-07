<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getComments(Request $request)
    {

        $aircraft_id = $request->query("aircraftId");
        $user_id = $request->query("user_id");
        try {

            if (!$aircraft_id && $user_id) {
                $comments = DB::table("comments")->select(["content", "likes", "date", "id", "author_id"])->where("aircraft_id", "=", $user_id)->get();
            } else if (!$user_id && $aircraft_id) {
                $comments = DB::table("comments")->select(["content", "likes", "date", "id", "author_id"])->where("aircraft_id", "=", $aircraft_id)->get();
            } else if ($aircraft_id && $user_id) {
                $comments = DB::table("comments")->select(["content", "likes", "date", "id", "author_id"])->where("aircraft_id", "=", $aircraft_id)->where("user_id", "=", $user_id)->get();
            } else {
                return response()->json([
                    "status" => "error",
                    "message" => "No aircraft ID or user ID supplied."
                ], 400);
            }

            return response()->json($comments);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not get comments."
            ], 500);
        }

    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $comment = $request->input("comment");
        $aircraft_id = $request->input("aircraftId");

        try {
            $id = DB::table("comments")->insertGetId([
                "author_id" => $request->user()->id,
                "aircraft_id" => $aircraft_id,
                "content" => $comment,
                "likes" => 0,
                "date" => date("Y-m-d H:i:s")
            ]);
            return response()->json([
                "status" => "success",
                "id" => $id
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not create comment."
            ], 500);
        }


    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        $id = $request->query("commentId");
        $requestee_role = DB::table("users")->select("role")->where("id", "=", $request->user()->id)->get();
        $commentRow = DB::table("comments")->select("*")->where("id", "=", $id);
        $commentAuthor = $commentRow->get();

        // ensure user is an admin
        if ($requestee_role[0]->role == "Admin" || $commentAuthor[0]->author_id == $request->user()->id) {
            try {
                $commentRow->delete();
                return response()->json([
                    "status" => "success"
                ], 200);
            } catch (Exception $e) {
                return response()->json([
                    "status" => "error",
                    "message" => "Could not delete comment."
                ], 500);
            }
        }
        return response()->json([
            "status" => "error",
            "message" => "You are not authorized to perform the requested action."
        ], 403);
    }
}