# Only Planes

Only Planes is a web application I made for a course at university. I didn't dedicate as much time to it as I would have liked, so the quality and efficiency of the code has suffered in some places.

## Running

Download [Mailpit](https://github.com/axllent/mailpit) and place the `mailpit.exe` file into a new folder named `mailpit` in the project's root directory.
You'll need at least three terminal windows. Two located in the root folder, and one in the `./mailpit` folder.

Ensure an SQL server is running. There should be access to the `root` user with no password (yes, I know this is naughty).
For this, I used [XAMPP](https://www.apachefriends.org/).

To run the Laravel app:

```bash
php artisan serve
```

To build the React app:

```bash
npm run build
```

To run Mailpit:

```bash
./mailpit.exe
```
