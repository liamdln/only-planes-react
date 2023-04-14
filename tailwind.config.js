const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                "dislike": "#ff9994",
                "like": "#94ff99",
                "op-darkblue": "#222831",
                "op-primary": "#D65A31",
                "op-primary-effect": "#cb5128",
                "op-card": "#2a313d"
            }
        },
    },

    plugins: [require('@tailwindcss/forms')],
};
