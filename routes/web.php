<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AircraftController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\OpinionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\TagController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register')
//     ]);
// });

Route::get('/', function () {
    return redirect("/login");
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // interactions
    Route::get("/interactions", [OpinionController::class, "index"]);
    Route::delete("/interactions", [OpinionController::class, "destroy"]);

    // profile
    Route::get("/profile/{id}", [ProfileController::class, "index"]);
    Route::get("/profile/edit/{id}", [ProfileController::class, "edit"]);

    // aircraft
    Route::get("/aircraft/{id}", [AircraftController::class, "aircraftPage"]);

    // notifications
    Route::get("/notifications", [NotificationsController::class, "index"]);

});

// files
Route::prefix("/resources")->group(function () {

    Route::middleware('auth')->group(function () {

        Route::controller(ImageController::class)->group(function() {
            // Route::get("/{name}", "getImage");
            Route::post("/upload", "store");
        });

    });

});

// api
Route::prefix("/api")->group(function () {

    // authenticated only
    Route::middleware('auth')->group(function () {
        // aircraft
        Route::controller(AircraftController::class)->group(function () {
            Route::get("/all-aircraft", "index");
            Route::get("/all-aircraft/{page}", "paginatedIndex");
            Route::get("/aircraft/{id}", "show");
            // post as formdata is not sent with put request
            // bug in laravel
            Route::post("/aircraft/edit", "edit");
            Route::post("/aircraft/create", "store");
            Route::delete("/aircraft/delete", "destroy");
        });

        // user
        Route::controller(UserController::class)->group(function () {
            Route::delete("/user/delete", "destroy");
        });

        // profile
        Route::controller(ProfileController::class)->group(function () {
            Route::get("/profile/{id}", "show"); // change to profile
            Route::put("/profile/edit/{id}", "updateDetails");
        });

        // Actions
        Route::controller(OpinionController::class)->group(function () {
            Route::post("/opinions", "store");
        });

        // Notifications
        Route::controller(NotificationsController::class)->group(function () {
            Route::post("/notifications", "store");
            Route::delete("/notifications", "destroy");
        });

        // comments
        Route::controller(CommentController::class)->group(function () {
            Route::get("/comments/{page}", "getPaginatedComments");
            Route::post("/comments", "store");
            // post as formdata is not sent with put request
            // bug in laravel
            Route::post("/comments/edit", "edit");
            Route::delete("/comments", "destroy");
        });

        // tags
        Route::controller(TagController::class)->group(function () {
            Route::get("/tags", "get");
            Route::get("/tag", "getById");
            Route::get("/tags/for", "getTagsForAircraft");
        });

    });
});

require __DIR__ . '/auth.php';
