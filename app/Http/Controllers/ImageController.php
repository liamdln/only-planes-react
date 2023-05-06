<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function getImage(string $imageId)
    {
        // if (!Storage::disk("local")->exists("aircraft_images/" . $imageId)) {
        //     return response()->json([
        //         "status" => "error",
        //         "message" => "File does not exist."
        //     ], 404);
        // }
        // // $image = Storage::disk("local")->get("aircraft_images/" . $imageId);
        // $image = File::get(Storage::url("app/aircraft_images/" . $imageId));
        // return $image;
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
        try {
            $request->validate([
                "image" => "required|image|mimes:png,jpg,jpeg|max:512000"
            ]);

            $imageName = uniqid("aircraft-") . "." . $request->file->extension();
            Storage::disk("local")->put("aircraft_images/" . $imageName, file_get_contents($request->aircraft_image));

            return array(
                "url" => "/resources" . "/" . $imageName
            );
        } catch (Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Could not upload image."
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
     *
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
