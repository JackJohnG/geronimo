# Geronimo - NoteKeeper

This is a note keeper app which I have created for my own usage and decided to share it in case someone else is interested in it.
The application can be configured to use your Google Drive account to store your notes, allowing you to access your notes from any PC where the application is installed.

## Development

The application was build using Angular 2 and Electron frameworks.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `ng build --prod` to build the project. The build artifacts will be stored in the `dist/` directory.

Run `electron .` to test the application in Electron mode.

Run `electron-packager . --platform=win32 --arch=x64 --version-string.ProductName=\"Geronimo\" --icon=\Users\${path_to_project}\dist\assets\images\geronimo.ico` to build the application for Windows platform
