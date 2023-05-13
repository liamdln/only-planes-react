<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{

    // API Endpoints

    /**
     * Get a list of all comments.
     *
     * @param request HTTP request object.
     */
    public function getComments(Request $request)
    {

        // get filter from the URL.
        // query is: /some/endpoint?my-query=1
        $aircraft_id = $request->query("aircraftId");
        $user_id = $request->query("user_id");

        try {

            // check if the user wants the comments for an aircraft, made by a user, or made by a user for an aircraft.
            if (!$aircraft_id && $user_id) {
                $comments = DB::table("comments")->select(["content", "likes", "updated_at", "id", "author_id"])->where("aircraft_id", "=", $user_id)->get();
            } else if (!$user_id && $aircraft_id) {
                $comments = DB::table("comments")->select(["content", "likes", "updated_at", "id", "author_id"])->where("aircraft_id", "=", $aircraft_id)->get();
            } else if ($aircraft_id && $user_id) {
                $comments = DB::table("comments")->select(["content", "likes", "updated_at", "id", "author_id"])->where("aircraft_id", "=", $aircraft_id)->where("user_id", "=", $user_id)->get();
            } else {
                // incorrect or no query sent
                return response()->json([
                    "status" => "error",
                    "message" => "No aircraft ID or user ID supplied."
                ], 400);
            }

            return response()->json($comments);

        // unknown error
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not get comments."
            ], 500);
        }
    }

    /**
     * Get a list of comments broken into pages.
     *
     * @param request HTTP request object.
     * @param page Page of comments to return.
     */
    public function getPaginatedComments(Request $request, int $page)
    {
        $aircraft_id = $request->query("aircraftId");
        $user_id = $request->query("user_id");
        $comments_per_page = 5;

        try {
            // check if the user wants the comments for an aircraft, made by a user, or made by a user for an aircraft.
            if (!$aircraft_id && $user_id) {
                $comments = DB::table("comments")
                    ->select(["content", "likes", "updated_at", "id", "author_id"])
                    ->where("user_id", "=", $user_id);
            } else if (!$user_id && $aircraft_id) {
                $comments = DB::table("comments")
                    ->select(["content", "likes", "updated_at", "id", "author_id"])
                    ->where("aircraft_id", "=", $aircraft_id);
            } else if ($aircraft_id && $user_id) {
                $comments = DB::table("comments")
                    ->select(["content", "likes", "updated_at", "id", "author_id"])
                    ->where("aircraft_id", "=", $aircraft_id)
                    ->where("user_id", "=", $user_id);
            } else {
                return response()->json([
                    "status" => "error",
                    "message" => "No aircraft ID or user ID supplied."
                ], 400);
            }

            $total_comments = $comments->count();

            // limit and offset the comments to only get 5 each time.
            $filtered_comments = $comments
                ->offset($comments_per_page * ($page - 1))
                ->limit($comments_per_page)
                ->orderByDesc("updated_at")
                ->get();
            // dd($filtered_comments);

            return response()->json([
                "payload" => $filtered_comments,
                "totalComments" => $total_comments,
                "commentsPerPage" => $comments_per_page
            ]);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not get comments."
            ], 500);
        }
    }

    /**
     * Create a comment
     *
     * @param request HTTP request object.
     */
    public function store(Request $request)
    {
        // input comes from the body of the request
        // usually JSON.
        $comment = $request->input("comment");
        $aircraft_id = $request->input("aircraftId");

        try {
            $id = DB::table("comments")->insertGetId([
                "author_id" => $request->user()->id,
                "aircraft_id" => $aircraft_id,
                "content" => $comment,
                "likes" => 0,
                "date" => date("Y-m-d H:i:s"),
                "created_at" => date("Y-m-d H:i:s"),
                "updated_at" => date("Y-m-d H:i:s")
            ]);
            return response()->json([
                "status" => "success",
                "payload" => $id
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not create comment."
            ], 500);
        }
    }

    /**
     * Edit a comment.
     *
     * @param request HTTP request object.
     */
    public function edit(Request $request)
    {
        $id = $request->query("commentId");
        $requestee_role = DB::table("profiles")->select("role")->where("id", "=", $request->user()->id)->get();
        $commentRow = DB::table("comments")->select("*")->where("id", "=", $id);
        $comment = $commentRow->get();
        $new_comment_content = $request->input("content");

        // invalid ID.
        if ($commentRow->count() < 1) {
            return response()->json([
                "status" => "error",
                "message" => "Comment not found."
            ], 404);
        }

        // no data was sent, cannot edit a comment so it's empty.
        if (!$new_comment_content || $new_comment_content == "") {
            return response()->json([
                "status" => "error",
                "message" => "No content was sent."
            ], 400);
        }

        // ensure user is an admin or the author of the comment
        if ($requestee_role[0]->role == "Admin" || $comment[0]->author_id == $request->user()->id) {
            try {

                // update the comment
                $commentRow->update(["content" => $new_comment_content, "updated_at" => date("Y-m-d H:i:s")]);

                return response()->json([
                    "status" => "success"
                ], 200);

            } catch (Exception $e) {
                return response()->json([
                    "status" => "error",
                    "message" => "Could not edit comment."
                ], 500);
            }
        }
        return response()->json([
            "status" => "error",
            "message" => "You are not authorized to perform the requested action."
        ], 403);

    }

    /**
     * Delete a comment.
     *
     * @param request HTTP request object.
     */
    public function destroy(Request $request)
    {
        $id = $request->query("commentId");
        $requestee_role = DB::table("profiles")->select("role")->where("id", "=", $request->user()->id)->get();
        $comment_row = DB::table("comments")->select("*")->where("id", "=", $id);
        $comment = $comment_row->get();

        // no comment exists
        if (!$comment[0]) {
            return response()->json([
                "status" => "error",
                "message" => "Comment not found."
            ], 404);
        }

        // ensure user is an admin or the author of the comment
        if ($requestee_role[0]->role == "Admin" || $comment[0]->author_id == $request->user()->id) {

            // try delete the comment
            try {
                $comment_row->delete();
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
