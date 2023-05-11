<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    /**
     * @deprecated
     * Store a new image.
     *
     * @param request HTTP request object.
     */
    public function store(Request $request)
    {
        // this function has been deprecated
        try {

            // validate the image
            // max 512mb
            $request->validate([
                "image" => "required|image|mimes:png,jpg,jpeg|max:512000"
            ]);

            // generate a new name and store the image
            $imageName = uniqid("aircraft-") . "." . $request->file->extension();
            Storage::disk("local")->put("aircraft_images/" . $imageName, file_get_contents($request->aircraft_image));

            // return the image URL
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

}
